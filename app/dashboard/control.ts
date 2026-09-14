export async function api<T>(path: string, method = "GET", body?: unknown, idempotencyKey?: string): Promise<T> {
  const response = await fetch(`/api/control/${path}`, { method, cache: "no-store",
    headers: { "content-type": "application/json", ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const result = response.status === 204 ? undefined : await response.json();
  if (!response.ok) throw Object.assign(new Error(result?.message ?? "Request failed. Refresh to check its status."), { status: response.status });
  return result as T;
}
