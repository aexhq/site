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

async function render(path = "/", init = {}) {
  const headers = new Headers(init.headers);
  if (!headers.has("accept")) headers.set("accept", "text/html");
  return fetch(origin + path, { ...init, headers });
}

test("server-renders the minimal landing shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text[/]html/i);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  const html = await response.text();

  assert.match(html, /<title>Agent infra for next era<\/title>/i);
  assert.match(html, /Agent infra for next era/);
  assert.match(html, /rel="icon"[^>]+href="\/icon\.svg/i);
  assert.match(html, /class="wordmark-mark"/);
  assert.match(html, /class="theme-toggle"/);
  assert.match(html, /href="https:\/\/github\.com\/aexhq"[^>]*>GitHub/);
  assert.match(html, /href="\/brain"[^>]*>Brain/);

  // The hero carries the wordmark, the headline, and two links. Nothing else.
  assert.doesNotMatch(html, /Pricing|Join the alpha|Provider cost|architecture-grid|feature-group/i);
  assert.doesNotMatch(html, /High-performance, reliable, and simple infrastructure/i);
  assert.doesNotMatch(html, /admitAgentloop|tool_bindings|role="tablist"/);

  // Legal identity stays in the footer.
  assert.match(html, /THINK SLOWLY LTD[\s\S]*17224795/i);
  assert.match(html, /Registered office:[\s\S]*71-75 Shelton Street[\s\S]*WC2H 9JQ/i);
  await access(new URL("public/og.png", templateRoot));
});

test("server-renders the Brain page in README order", async () => {
  const response = await render("/brain");
  assert.equal(response.status, 200);
  const html = await response.text();
  const text = html.replace(/<[^>]*>/g, "");

  assert.match(html, /<title>Brain · Aex<\/title>/i);
  assert.match(text, /A minimal, blazing fast, extensible agent runtime\./);
  assert.match(text, /extensible agent runtime server/);

  const order = [
    "what-it-is-title",
    "features-title",
    "benchmark-title",
    "architecture-title",
    "roadmap-title",
    "getting-started-title",
    "license-title",
  ];
  let cursor = -1;
  for (const id of order) {
    const at = html.indexOf(`id="${id}"`);
    assert.ok(at > cursor, `${id} is out of order`);
    cursor = at;
  }

  assert.match(text, /Conversations outlive processes/);
  assert.match(text, /No network, no filesystem, no secrets, no clock/);
  assert.match(text, /ghcr\.io\/aexhq\/brain:latest/);
  assert.match(text, /MIT/);
  assert.match(html, /href="\/brain\/docs"/);
  assert.match(html, /href="\/brain\/docs\/reference\/api"/);
  assert.match(html, /href="https:\/\/github\.com\/aexhq\/brain"/);
  assert.doesNotMatch(text, /env-aws-microvm|VERCEL_AI_GATEWAY_API_KEY/);

  // Current measured figures, not the pre-rebuild archive.
  assert.match(text, /Turn round-trip[\s\S]*40 ms/);
  assert.match(text, /14 KiB/);
  assert.doesNotMatch(text, /Cold start|1049 ms|874\.4 ms/);
  assert.doesNotMatch(text, /TBD|2,002 turns|1\.4 ms|21-31 KiB/);
  assert.doesNotMatch(text, /Apache/i);
});

test("retired documentation path redirects to the Brain docs", async () => {
  const response = await render("/docs", { redirect: "manual" });
  assert.equal(response.status, 308);
  assert.equal(response.headers.get("location"), "/brain/docs");
});

test("serves the Brain documentation, generated API pages, and a static search index", async () => {
  const intro = await render("/brain/docs");
  assert.equal(intro.status, 200);
  const introText = (await intro.text()).replace(/<[^>]*>/g, " ");
  assert.match(introText, /Brain runs agent sessions/);
  assert.match(introText, /Quickstart/);

  const concept = await render("/brain/docs/concepts/agent-loop");
  assert.equal(concept.status, 200);
  assert.match((await concept.text()).replace(/<[^>]*>/g, " "), /no filesystem, network, process/);

  // Generated from contracts/session/v1/openapi.yaml, never written by hand.
  const apiIndex = await render("/brain/docs/reference/api");
  assert.equal(apiIndex.status, 200);
  const apiIndexHtml = await apiIndex.text();
  assert.match(apiIndexHtml.replace(/<[^>]*>/g, " "), /Create Session/);
  assert.match(apiIndexHtml, /href="\/brain\/docs\/reference\/api\/createSession"/);
  assert.doesNotMatch(apiIndexHtml, /%5C/);

  const api = await render("/brain/docs/reference/api/createSession");
  assert.equal(api.status, 200);
  const apiText = (await api.text()).replace(/<[^>]*>/g, " ");
  assert.match(apiText, /Create Session/);
  assert.match(apiText, /POST/);
  assert.match(apiText, /[/]v1[/]sessions/);

  const index = await render("/static.json", { headers: { accept: "application/json" } });
  assert.equal(index.status, 200);
  const payload = await index.json();
  assert.ok(JSON.stringify(payload).includes("/brain/docs/quickstart"));
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

  const returning = await render("/dashboard", {
    headers: { cookie: "aex_account=aex_at_returning_session_hint" },
  });
  assert.equal(returning.status, 200);
  const returningHtml = await returning.text();
  assert.match(returningHtml, /dashboard-spinner/);
  assert.match(returningHtml, /Opening your dashboard\./);
  assert.match(returningHtml, /aria-busy="true"/);
  assert.doesNotMatch(returningHtml, /Start in the dashboard\./);
});

test("dashboard proxy is a fixed mutation allowlist with an HttpOnly session", async () => {
  const proxy = await readFile(new URL("../app/api/control/[...path]/route.ts", import.meta.url), "utf8");
  const dashboard = await readFile(new URL("../app/dashboard/DashboardClient.tsx", import.meta.url), "utf8");
  const dashboardPage = await readFile(new URL("../app/dashboard/page.tsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  const themeToggle = await readFile(new URL("../app/components/ThemeToggle.tsx", import.meta.url), "utf8");
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
  assert.match(dashboardPage, /cookies\(\)[\s\S]*aex_account/);
  assert.match(dashboard, /hasDashboardSession[\s\S]*dashboard-spinner/);
  assert.match(dashboard, /sessions\.create[\s\S]*brain: pi\(\)[\s\S]*vercel-ai-gateway/);
  assert.doesNotMatch(dashboard, /admitAgentloop|agentloop_digest/);
  assert.doesNotMatch(dashboard, /OPENAI_API_KEY|AI_GATEWAY_API_KEY|ai-gateway\.vercel\.sh/);
  assert.match(styles, /@media \(prefers-color-scheme: dark\)/);
  assert.match(styles, /:root\[data-theme="dark"\]/);
  assert.match(styles, /color-scheme: dark/);
  assert.match(styles, /--wordmark-icon: url\("\/aex-mark-black\.webp"\)/);
  assert.match(styles, /--wordmark-icon: url\("\/aex-mark-white\.webp"\)/);
  assert.match(themeToggle, /localStorage\.setItem\(storageKey, nextTheme\)/);
  await access(new URL("public/aex-mark-black.webp", templateRoot));
  await access(new URL("public/aex-mark-white.webp", templateRoot));
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
