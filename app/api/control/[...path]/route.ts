import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const allowedReads = new Set(["account", "balance", "usage", "keys", "rates"]);
const defaultControlOrigin = "https://api-dev.aex.dev";

function jsonError(status: number, message: string) {
  return Response.json(
    { error: { code: "upstream_error", message } },
    { status, headers: { "cache-control": "no-store" } },
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (path.length !== 1 || !allowedReads.has(path[0])) {
    return jsonError(404, "That control-plane read is not exposed by the dashboard.");
  }

  const authorization = request.headers.get("authorization");
  if (path[0] !== "rates" && !authorization?.startsWith("Bearer aex_at_")) {
    return jsonError(401, "An aex account token is required.");
  }

  const configuredOrigin = process.env.AEX_API_BASE_URL ?? defaultControlOrigin;
  let upstream: URL;
  try {
    upstream = new URL("/v1/" + path[0], configuredOrigin);
  } catch {
    return jsonError(500, "The dashboard control-plane origin is invalid.");
  }
  if (upstream.protocol !== "https:") {
    return jsonError(500, "The dashboard control-plane origin must use HTTPS.");
  }

  try {
    const response = await fetch(upstream, {
      method: "GET",
      headers: {
        accept: "application/json",
        ...(authorization ? { authorization } : {}),
      },
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(12_000),
    });
    const body = await response.arrayBuffer();
    return new Response(body, {
      status: response.status,
      headers: {
        "cache-control": "no-store",
        "content-type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch {
    return jsonError(502, "The aex control plane could not be reached.");
  }
}
