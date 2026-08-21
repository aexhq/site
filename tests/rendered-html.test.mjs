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

test("server-renders the backend landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.match(response.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
  const html = await response.text();
  const text = html.replace(/<[^>]*>/g, "");
  assert.match(html, /<title>The backend for AI workloads<\/title>/i);
  assert.match(html, /rel="icon"[^>]+href="\/icon\.svg/i);
  assert.match(html, /property="og:image"[^>]+content="http:\/\/127\.0\.0\.1:\d+\/og\.png"/i);
  assert.match(html, /property="og:image:width"[^>]+content="1200"/i);
  assert.match(html, /property="og:image:height"[^>]+content="630"/i);
  assert.match(html, /name="twitter:card"[^>]+content="summary_large_image"/i);
  assert.match(html, /name="twitter:image"[^>]+content="http:\/\/127\.0\.0\.1:\d+\/og\.png"/i);
  assert.match(html, /The backend for AI workloads/);
  assert.match(html, /High-performance, reliable, and simple infrastructure/i);
  assert.match(html, /Start a session with your models and tools[\s\S]*structured data/i);
  assert.match(html, /Docs[\s\S]*Dashboard[\s\S]*GitHub[\s\S]*Discord/);
  assert.match(html, /class="wordmark-mark"/);
  assert.match(html, /class="theme-toggle"/);
  assert.match(html, /aria-label="Switch to dark mode"/);
  assert.match(html, /href="https:\/\/github\.com\/aexhq\/aex"[^>]*>GitHub/);
  assert.match(html, /href="https:\/\/discord\.gg\/Qk2YnHMHVb"[^>]*>Discord/);
  assert.match(html, /role="tablist"/);
  assert.match(html, /Start[\s\S]*Tools[\s\S]*Structured Outputs[\s\S]*Files[\s\S]*Sandboxes[\s\S]*Storage[\s\S]*Subagents/);
  assert.doesNotMatch(html, />Continue<\/button>/);
  assert.match(html, /<pre class="site-code"/);
  assert.match(text, /tool/);
  assert.match(text, /getWeather/);
  assert.match(text, /\.client\(\)/);
  assert.doesNotMatch(text, /lookupOrder|lookup_order|lookupCustomer/);
  assert.match(text, /session\.send/);
  assert.match(text, /console\.log\(await session\.send/);
  assert.match(text, /output:/);
  assert.doesNotMatch(text, /session\.output/);
  assert.match(text, /gpt-5\.4/);
  assert.match(text, /OPENAI_API_KEY/);
  assert.doesNotMatch(text, /AI_GATEWAY_API_KEY|baseUrl|ai-gateway\.vercel\.sh/);
  assert.match(text, /session\.sandbox\.files\.upload/);
  assert.match(text, /Create two isolated sandboxes/);
  assert.match(text, /session\.storage\.copyFromSandbox/);
  assert.match(text, /session\.children\.create/);
  assert.match(html, /class="syntax-keyword"/);
  assert.match(html, /class="syntax-string"/);
  assert.doesNotMatch(html, /sk-ant-/);
  assert.match(html, /<h2 id="architecture-title">Architecture<\/h2>/);
  assert.match(html, /architecture-grid/);
  assert.match(html, /<h3>Database<\/h3>[\s\S]*<h3>Storage<\/h3>[\s\S]*<h3>Your app<\/h3>[\s\S]*<h3>Brain<\/h3>[\s\S]*<h3>Hands<\/h3>[\s\S]*<h3>Sandbox<\/h3>/);
  assert.match(html, /anthropic\.com\/engineering\/managed-agents/);
  assert.match(html, /<h2 id="features-title">Features<\/h2>/);
  assert.match(html, /brain-features-title[\s\S]*hands-features-title[\s\S]*sandbox-features-title/);
  assert.match(text, /lookupStock[\s\S]*\.client\(\)[\s\S]*client:[\s\S]*store-api/);
  assert.match(html, /Append-only recovery across process restarts/);
  assert.match(html, /Durable receipts make retries and recovery explicit/);
  assert.doesNotMatch(html, /versioned (?:tool )?operations|10,000 concurrent sessions/);
  assert.match(html, /<h2 id="pricing-title">Pricing<\/h2>/);
  assert.match(html, /Active computer[\s\S]*From \$0\.12 \/ hour/);
  assert.match(html, /0\.5 vCPU \+ 1 GB memory[\s\S]*Billed per second/);
  assert.match(html, />Storage<[\s\S]*\$0\.03 \/ GB-month/);
  assert.match(html, /Web search[\s\S]*\$0\.003 \/ query/);
  assert.match(html, /Bring your own key/);
  assert.match(html, /Join the alpha/);
  assert.match(html, /first six months after launch/i);
  assert.match(html, /confirm the discount before billing starts/i);
  assert.doesNotMatch(html, /A light engine leaves the model room to work|How the closest products draw the boundary|Claude Managed Agents|2,002/i);
  assert.doesNotMatch(html, /demo-copy|demo-flow|section-index|Aex \/ Alpha|01 \/ SDK|02 \/ Product/i);
  assert.doesNotMatch(html, /Suspended computer|State kept without active compute|\$0\.10/i);
  assert.doesNotMatch(html, /Founding beta|Join the beta|eu-west-1|Linux workspace|Suspended machine/i);
  assert.doesNotMatch(html, /Agent backend for AI apps|The session backend for AI apps|simple, elegant|From one tool to a finished result|Long-lived by design|The infrastructure between a prompt|Pay for the work|The brain remembers/i);
  await access(new URL("public/og.png", templateRoot));
  assert.doesNotMatch(html, /\bAEX\b|\bBeta\b/);
  assert.match(html, /THINK SLOWLY LTD[\s\S]*17224795/i);
  assert.match(html, /Registered office:[\s\S]*71-75 Shelton Street[\s\S]*WC2H 9JQ/i);
  assert.doesNotMatch(html, /leakage-gate|Brain \/ Process/i);
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
  assert.match(dashboard, /OPENAI_API_KEY/);
  assert.doesNotMatch(dashboard, /AI_GATEWAY_API_KEY|ai-gateway\.vercel\.sh/);
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
