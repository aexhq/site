import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", String(process.pid) + "-" + String(Date.now()));
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost" + path, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the prose-first AI app backend page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>The session backend for AI apps · aex<\/title>/i);
  assert.match(html, /The session backend for AI apps\./);
  assert.match(html, /Your app stays yours/);
  assert.match(html, /stop[\s\S]*resume without losing its place/i);
  assert.match(html, /\$0\.12/);
  assert.match(html, /\$0\.10/);
  assert.match(html, /\$0\.003/);
  assert.match(html, /Join the beta/);
  assert.doesNotMatch(html, /Platform-added TTFT|2,002|leakage-gate|Brain \/ Process/i);
});

test("public status and prelaunch legal pages render", async () => {
  const status = await render("/status");
  assert.equal(status.status, 200);
  assert.match(await status.text(), /Service status[\s\S]*AEX API[\s\S]*Incidents/i);

  const privacy = await render("/privacy");
  assert.equal(privacy.status, 200);
  const privacyHtml = await privacy.text();
  assert.match(privacyHtml, /<title>Privacy · aex<\/title>/i);
  assert.match(privacyHtml, /legal operator name[\s\S]*must be configured/i);
  assert.match(privacyHtml, /up to seven days/i);

  const terms = await render("/terms");
  assert.equal(terms.status, 200);
  const termsHtml = await terms.text();
  assert.match(termsHtml, /Founding beta terms/i);
  assert.match(termsHtml, /business, trade, craft, or profession/i);
});

test("server-renders dashboard-first waitlist and invited onboarding", async () => {
  const waitlist = await render("/dashboard");
  assert.equal(waitlist.status, 200);
  const waitlistHtml = await waitlist.text();
  assert.match(waitlistHtml, /<title>Dashboard · aex<\/title>/i);
  assert.match(waitlistHtml, /Start in the dashboard\./);
  assert.match(waitlistHtml, /Join the Founding Beta/);

  const invited = await render("/dashboard?mode=invite");
  assert.equal(invited.status, 200);
  const invitedHtml = await invited.text();
  assert.match(invitedHtml, /Create your account\./);
  assert.match(invitedHtml, /aex_iv_/);
});

test("dashboard proxy is a fixed mutation allowlist with an HttpOnly session", async () => {
  const proxy = await readFile(new URL("../app/api/control/[...path]/route.ts", import.meta.url), "utf8");
  const dashboard = await readFile(new URL("../app/dashboard/DashboardClient.tsx", import.meta.url), "utf8");
  assert.match(proxy, /function routeFor/);
  assert.match(proxy, /https:\/\/api\.aex\.dev/);
  assert.match(proxy, /HttpOnly/);
  assert.match(proxy, /SameSite=Lax/);
  assert.match(proxy, /Secure/);
  assert.match(proxy, /redirect: "manual"/);
  assert.doesNotMatch(proxy, /request\.nextUrl\.searchParams\.get\(["'](?:url|origin|host)/);
  assert.doesNotMatch(dashboard, /localStorage|sessionStorage/);
  await assert.rejects(access(new URL("../app/_sites-preview", templateRoot)));
});

test("checkout return routes render", async () => {
  const success = await render("/topup/success");
  assert.equal(success.status, 200);
  assert.match(await success.text(), /Checking the ledger/);
  const cancelled = await render("/topup/cancelled");
  assert.equal(cancelled.status, 200);
  assert.match(await cancelled.text(), /No charge was made/);
});
