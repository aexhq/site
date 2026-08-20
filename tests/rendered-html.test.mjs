import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { access, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test, { after, before } from "node:test";

const templateRoot = new URL("../", import.meta.url);
const projectRoot = fileURLToPath(templateRoot);
const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const port = 31_000 + (process.pid % 1_000);
const origin = `http://127.0.0.1:${port}`;
let server;
let serverOutput = "";

before(async () => {
  server = spawn(
    process.execPath,
    [nextBin, "start", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: projectRoot, env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" }, stdio: ["ignore", "pipe", "pipe"] },
  );
  for (const stream of [server.stdout, server.stderr]) {
    stream.on("data", (chunk) => {
      serverOutput = (serverOutput + chunk.toString()).slice(-8_000);
    });
  }

  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Next.js exited before tests started.\n${serverOutput}`);
    }
    try {
      const response = await fetch(origin, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Next.js did not become ready.\n${serverOutput}`);
});

after(async () => {
  if (!server || server.exitCode !== null) return;
  server.kill();
  await Promise.race([once(server, "exit"), new Promise((resolve) => setTimeout(resolve, 5_000))]);
});

async function render(path = "/") {
  return fetch(origin + path, { headers: { accept: "text/html" } });
}

test("server-renders the agent backend landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  const html = await response.text();
  assert.match(html, /<title>Agent backend for AI apps<\/title>/i);
  assert.match(html, /rel="icon"[^>]+href="\/icon\.svg/i);
  assert.match(html, /Agent backend for AI apps/);
  assert.match(html, /simple, elegant, session-oriented SDK/i);
  assert.match(html, /Read the docs[\s\S]*Dashboard[\s\S]*GitHub/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /Start[\s\S]*Custom tool[\s\S]*Typed result[\s\S]*Continue/);
  assert.match(html, /defineTool/);
  assert.match(html, /lookup_order/);
  assert.match(html, /bash\(\)[\s\S]*webSearch\(\)[\s\S]*subagents\(\)/);
  assert.match(html, /session\.send/);
  assert.match(html, /output:/);
  assert.doesNotMatch(html, /session\.output/);
  assert.match(html, /openai\/gpt-5\.4/);
  assert.match(html, /AI_GATEWAY_API_KEY/);
  assert.match(html, /ai-gateway\.vercel\.sh/);
  assert.doesNotMatch(html, /sk-ant-/);
  assert.match(html, /Long-lived by design/);
  assert.match(html, /A real computer/);
  assert.match(html, /Structured by default/);
  assert.match(html, /The brain remembers\. The hands do the work\./);
  assert.match(html, /anthropic\.com\/engineering\/managed-agents/);
  assert.match(html, /\$0\.12/);
  assert.match(html, /\$0\.10/);
  assert.match(html, /\$0\.03/);
  assert.match(html, /\$0\.003/);
  assert.match(html, /Bring your own key/);
  assert.match(html, /Join the alpha/);
  assert.match(html, /first six months after launch/i);
  assert.doesNotMatch(html, /A light engine leaves the model room to work|How the closest products draw the boundary|Claude Managed Agents|2,002/i);
  assert.doesNotMatch(html, /demo-copy|demo-flow/);
  assert.doesNotMatch(html, /Founding beta|Join the beta|eu-west-1|Linux workspace|Suspended machine/i);
  assert.doesNotMatch(html, /The session backend for AI apps|<dt>Sessions<\/dt>|<dt>Tools<\/dt>|<dt>Output<\/dt>/i);
  assert.doesNotMatch(html, /\bAEX\b|\bBeta\b/);
  assert.match(html, /THINK SLOWLY LTD[\s\S]*17224795/i);
  assert.match(html, /Registered office:[\s\S]*71-75 Shelton Street[\s\S]*WC2H 9JQ/i);
  assert.doesNotMatch(html, /Platform-added TTFT|leakage-gate|Brain \/ Process/i);
});

test("public status and company legal pages render", async () => {
  const status = await render("/status");
  assert.equal(status.status, 200);
  assert.match(await status.text(), /Service status[\s\S]*Aex API[\s\S]*Incidents/);

  const privacy = await render("/privacy");
  assert.equal(privacy.status, 200);
  const privacyHtml = await privacy.text();
  assert.match(privacyHtml, /<title>Privacy · Aex<\/title>/);
  assert.match(privacyHtml, /THINK SLOWLY LTD[\s\S]*data controller/i);
  assert.match(privacyHtml, /17224795[\s\S]*England and Wales/i);
  assert.doesNotMatch(privacyHtml, /Prelaunch preview/i);
  assert.match(privacyHtml, /Vercel[\s\S]*Cloudflare/i);
  assert.doesNotMatch(privacyHtml, /OpenAI Sites/i);
  assert.match(privacyHtml, /up to seven days/i);

  const terms = await render("/terms");
  assert.equal(terms.status, 200);
  const termsHtml = await terms.text();
  assert.match(termsHtml, /Alpha terms/);
  assert.match(termsHtml, /THINK SLOWLY LTD[\s\S]*company number[\s\S]*17224795/i);
  assert.match(termsHtml, /registered office[\s\S]*71-75 Shelton Street[\s\S]*WC2H 9JQ/i);
  assert.match(termsHtml, /personal, educational,[\s\S]*commercial projects/i);
  assert.doesNotMatch(termsHtml, /beta is for people using AEX wholly or mainly for a/i);
  assert.doesNotMatch(termsHtml, /\bAEX\b|\bBeta\b/);
});

test("server-renders dashboard-first waitlist and invited onboarding", async () => {
  const waitlist = await render("/dashboard");
  assert.equal(waitlist.status, 200);
  const waitlistHtml = await waitlist.text();
  assert.match(waitlistHtml, /<title>Dashboard · Aex<\/title>/);
  assert.match(waitlistHtml, /Start in the dashboard\./);
  assert.match(waitlistHtml, /Join the alpha/);

  const invited = await render("/dashboard?mode=invite");
  assert.equal(invited.status, 200);
  const invitedHtml = await invited.text();
  assert.match(invitedHtml, /Create your account\./);
  assert.match(invitedHtml, /aex_iv_/);
  assert.match(invitedHtml, /I agree to the[\s\S]*Alpha terms/);
  assert.doesNotMatch(invitedHtml, /professional or business purposes/i);
  assert.doesNotMatch(invitedHtml, /Founding beta|eu-west-1/i);
  assert.doesNotMatch(invitedHtml, /\bAEX\b|\bBeta\b/);
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
  assert.match(proxy, /response\.status === 204 \? null : await response\.arrayBuffer\(\)/);
  assert.match(proxy, /accountToken,\s*"GET",\s*\)/);
  assert.doesNotMatch(proxy, /request\.nextUrl\.searchParams\.get\(["'](?:url|origin|host)/);
  assert.doesNotMatch(dashboard, /localStorage|sessionStorage/);
  await assert.rejects(access(new URL("../app/_sites-preview", templateRoot)));
});

test("checkout return routes render", async () => {
  const success = await render("/topup/success");
  assert.equal(success.status, 200);
  assert.match(await success.text(), /Checking the ledger/);
  const successPage = await readFile(new URL("../app/topup/success/page.tsx", import.meta.url), "utf8");
  const statusClient = await readFile(new URL("../app/topup/TopupStatusClient.tsx", import.meta.url), "utf8");
  const proxy = await readFile(new URL("../app/api/control/[...path]/route.ts", import.meta.url), "utf8");
  assert.match(successPage, /session_id/);
  assert.match(statusClient, /api\/control\/checkout/);
  assert.match(statusClient, /response\.status === 200/);
  assert.match(statusClient, /response\.status === 202/);
  assert.match(statusClient, /response\.status === 410/);
  assert.match(proxy, /topups\/checkout/);
  assert.match(proxy, /checkoutReturn[\s\S]*needsAccount: false/);
  const cancelled = await render("/topup/cancelled");
  assert.equal(cancelled.status, 200);
  assert.match(await cancelled.text(), /No charge was made/);
});
