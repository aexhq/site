import { NextRequest, NextResponse } from "next/server";
import { accountCookie, controlOrigin } from "../../../../lib/control";
export const dynamic = "force-dynamic";
async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const path = (await context.params).path.join("/"), method = request.method;
  const allowed = (method === "GET" && ["account", "usage", "keys"].includes(path))
    || (method === "POST" && path === "keys")
    || (["PATCH", "DELETE"].includes(method) && /^keys\/key_[a-f0-9]{64}$/.test(path))
    || (method === "DELETE" && path === "account/session");
  const error = (status: number, message: string) => NextResponse.json({ message }, { status, headers: { "cache-control": "no-store" } });
  if (!allowed || request.nextUrl.search) return error(404, "Not found");
  if (method !== "GET" && request.headers.get("origin") !== request.nextUrl.origin) return error(403, "Invalid request origin");
  const token = request.cookies.get(accountCookie)?.value;
  if (!token) return error(401, "Sign in to continue");
  let body: string | undefined;
  if (method === "POST" || method === "PATCH") {
    const reader = request.body?.getReader();
    if (!reader) return error(400, "Request body required");
    const chunks: Uint8Array[] = []; let length = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.length;
        if (length > 4096) { await reader.cancel(); return error(413, "Request too large"); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    body = Buffer.concat(chunks).toString("utf8");
  }
  try {
    const upstream = await fetch(`${controlOrigin()}/v1/${path}`, { method, body, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(15_000), headers: { authorization: `Bearer ${token}`, "content-type": "application/json" } });
    const response = new NextResponse(upstream.status === 204 ? null : await upstream.text(), { status: upstream.status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
    if (upstream.status === 401 || (path === "account/session" && upstream.ok)) response.cookies.delete(accountCookie);
    return response;
  } catch { return error(503, "Service temporarily unavailable"); }
}
export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE };
