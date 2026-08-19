import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const accountCookie = "aex_account";
const defaultControlOrigin = "https://api.aex.dev";
const maxBodyBytes = 32 * 1024;

type Route = {
  upstreamPath: string;
  needsAccount: boolean;
};

function jsonError(status: number, message: string, code = "invalid_request") {
  return Response.json(
    { error: { code, message } },
    { status, headers: { "cache-control": "no-store" } },
  );
}

function routeFor(method: string, parts: string[]): Route | null {
  const path = parts.join("/");
  if (method === "POST" && path === "waitlist") {
    return { upstreamPath: "/v1/waitlist", needsAccount: false };
  }
  if (method === "POST" && path === "accounts") {
    return { upstreamPath: "/v1/accounts", needsAccount: false };
  }
  if (method === "GET" && path === "rates") {
    return { upstreamPath: "/v1/rates", needsAccount: false };
  }
  if (
    method === "GET" &&
    ["account", "balance", "usage", "keys", "topups"].includes(path)
  ) {
    return { upstreamPath: "/v1/" + path, needsAccount: true };
  }
  if (method === "POST" && ["keys", "topups"].includes(path)) {
    return { upstreamPath: "/v1/" + path, needsAccount: true };
  }
  if (method === "GET" && /^topups\/[A-Za-z0-9_-]+$/.test(path)) {
    return { upstreamPath: "/v1/" + path, needsAccount: true };
  }
  if (method === "DELETE" && /^keys\/[A-Za-z0-9_-]+$/.test(path)) {
    return { upstreamPath: "/v1/" + path, needsAccount: true };
  }
  return null;
}

function controlOrigin(): URL | null {
  try {
    const origin = new URL(process.env.AEX_API_BASE_URL ?? defaultControlOrigin);
    const local = origin.hostname === "localhost" || origin.hostname === "127.0.0.1";
    if (origin.protocol !== "https:" && !(local && origin.protocol === "http:")) {
      return null;
    }
    return origin;
  } catch {
    return null;
  }
}

function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function requestBody(request: NextRequest): Promise<ArrayBuffer | Response | undefined> {
  if (request.method === "GET" || request.method === "DELETE") return undefined;
  const body = await request.arrayBuffer();
  if (body.byteLength > maxBodyBytes) {
    return jsonError(413, "The request body is too large.");
  }
  return body;
}

function cookieHeader(request: NextRequest, token: string, expires = false) {
  const secure = new URL(request.url).hostname !== "localhost";
  const attributes = [
    `${accountCookie}=${expires ? "" : encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    expires ? "Max-Age=0" : "Max-Age=2592000",
  ];
  if (secure) attributes.push("Secure");
  return attributes.join("; ");
}

async function forward(
  request: NextRequest,
  route: Route,
  body: ArrayBuffer | undefined,
  accountToken?: string,
  upstreamMethod = request.method,
) {
  const origin = controlOrigin();
  if (!origin) {
    return jsonError(500, "The dashboard control-plane origin is invalid.", "configuration_error");
  }
  const upstream = new URL(route.upstreamPath, origin);
  try {
    const response = await fetch(upstream, {
      method: upstreamMethod,
      headers: {
        accept: "application/json",
        ...(body ? { "content-type": "application/json" } : {}),
        ...(accountToken ? { authorization: "Bearer " + accountToken } : {}),
      },
      body,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
    });
    // Fetch forbids constructing a 204 response with a body, including a zero-byte
    // ArrayBuffer. Preserve the upstream no-content response instead of turning a
    // successful DELETE into a dashboard 502.
    const responseBody = response.status === 204 ? null : await response.arrayBuffer();
    return new Response(responseBody, {
      status: response.status,
      headers: {
        "cache-control": "no-store",
        "content-type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return jsonError(502, "The aex control plane could not be reached.", "upstream_error");
  }
}

async function connectAccount(request: NextRequest, body: ArrayBuffer | undefined) {
  let accountToken = "";
  try {
    const parsed = JSON.parse(new TextDecoder().decode(body)) as { account_token?: unknown };
    accountToken = typeof parsed.account_token === "string" ? parsed.account_token.trim() : "";
  } catch {
    return jsonError(400, "Send a valid JSON account token.");
  }
  if (!/^aex_at_[A-Za-z0-9]{40,64}$/.test(accountToken)) {
    return jsonError(400, "Use the account token beginning with aex_at_.");
  }
  const response = await forward(
    request,
    { upstreamPath: "/v1/account", needsAccount: true },
    undefined,
    accountToken,
    "GET",
  );
  if (response.ok) {
    response.headers.append("set-cookie", cookieHeader(request, accountToken));
  }
  return response;
}

async function handle(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (!isSameOrigin(request) && request.method !== "GET") {
    return jsonError(403, "Cross-origin dashboard mutations are not accepted.", "forbidden");
  }

  const joined = path.join("/");
  if (joined === "session" && request.method === "DELETE") {
    const response = Response.json(
      { object: "dashboard_session", status: "signed_out" },
      { headers: { "cache-control": "no-store" } },
    );
    response.headers.append("set-cookie", cookieHeader(request, "", true));
    return response;
  }

  const bodyOrError = await requestBody(request);
  if (bodyOrError instanceof Response) return bodyOrError;
  if (joined === "session" && request.method === "POST") {
    return connectAccount(request, bodyOrError);
  }

  const route = routeFor(request.method, path);
  if (!route) {
    return jsonError(404, "That control-plane operation is not exposed by the dashboard.");
  }

  const token = request.cookies.get(accountCookie)?.value;
  if (route.needsAccount && !token?.startsWith("aex_at_")) {
    return jsonError(401, "Sign in with your aex account token.", "unauthorized");
  }

  const response = await forward(request, route, bodyOrError, token);
  if (joined === "accounts" && request.method === "POST" && response.ok) {
    try {
      const created = (await response.clone().json()) as { account_token?: unknown };
      if (typeof created.account_token === "string") {
        response.headers.append("set-cookie", cookieHeader(request, created.account_token));
      }
    } catch {
      return jsonError(502, "The account response was not valid JSON.", "upstream_error");
    }
  }
  return response;
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;
