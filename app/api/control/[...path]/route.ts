import { NextRequest, NextResponse } from "next/server";
import { accountCookie, controlOrigin, siteOrigin } from "../../../../lib/control";
export const dynamic = "force-dynamic";
async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const path = (await context.params).path.join("/"), method = request.method;
  const payment = method === "POST" && ["billing/topups", "billing/refunds"].includes(path);
  const allowed = (method === "GET" && ["account", "usage", "keys", "billing", "billing/ledger", "billing/topups", "billing/refunds"].includes(path))
    || (method === "POST" && ["keys", "auth/grants", "billing/topups", "billing/refunds", "billing/sync"].includes(path))
    || (method === "PUT" && path === "billing")
    || (["PATCH", "DELETE"].includes(method) && /^keys\/key_[a-f0-9]{64}$/.test(path))
    || (method === "DELETE" && path === "account/session");
  const error = (status: number, message: string) => NextResponse.json({ message }, { status, headers: { "cache-control": "no-store" } });
  const query = request.nextUrl.searchParams;
  const before = query.get("before");
  const validCursor = method === "GET" && path === "billing/ledger" && Array.from(query.keys()).length === 1
    && before !== null && /^[1-9][0-9]*$/.test(before) && Number.isSafeInteger(Number(before));
  if (!allowed || (request.nextUrl.search && !validCursor)) return error(404, "Not found");
  if (method !== "GET" && request.headers.get("origin") !== siteOrigin()) return error(403, "Invalid request origin");
  const token = request.cookies.get(accountCookie)?.value;
  if (!token) return error(401, "Sign in to continue");
  const operationKey = request.headers.get("idempotency-key");
  if (payment && (!operationKey || Buffer.byteLength(operationKey) > 256)) return error(400, "Payment operation key required");
  let body: string | undefined;
  if (["POST", "PATCH", "PUT"].includes(method)) {
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
    const upstream = await fetch(`${controlOrigin()}/v1/${path}${validCursor ? `?before=${before}` : ""}`, { method, body, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(30_000), headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...(payment ? { "idempotency-key": operationKey! } : {}) } });
    const response = new NextResponse(upstream.status === 204 ? null : await upstream.text(), { status: upstream.status, headers: { "content-type": "application/json", "cache-control": "no-store" } });
    if (upstream.status === 401 || (path === "account/session" && upstream.ok)) response.cookies.delete(accountCookie);
    return response;
  } catch { return error(503, "Service temporarily unavailable"); }
}
export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
