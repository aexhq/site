import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
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
let api;
let apiRequests = [];

before(async () => {
  api = createServer(async (req, res) => {
    let body = ""; for await (const chunk of req) body += chunk;
    apiRequests.push({ path: req.url, authorization: req.headers.authorization, body: body ? JSON.parse(body) : undefined });
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(req.url === "/v1/account" ? { email: "cli@example.com" } : { code: "one-time-code" }));
  });
  await new Promise(resolve => api.listen(0, "127.0.0.1", resolve));
  server = spawn(
    process.execPath,
    [nextBin, "start", "--hostname", "127.0.0.1", "--port", String(port)],
    { cwd: projectRoot, env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", AEX_SITE_ORIGIN: origin, AEX_API_BASE_URL: `http://127.0.0.1:${api.address().port}`, AEX_OAUTH_GOOGLE_CLIENT_ID: "fixture-client" }, stdio: ["ignore", "pipe", "pipe"] },
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
  if (api) await new Promise(resolve => api.close(resolve));
  if (!server || server.exitCode !== null) return;
  server.kill();
  await Promise.race([once(server, "exit"), new Promise((resolve) => setTimeout(resolve, 5_000))]);
});

test("CLI login uses account API grants and denies cross-origin approval and unsafe redirects", async () => {
  const input = { redirect_uri: "http://127.0.0.1:34567/callback", code_challenge: "a".repeat(43), state: "b".repeat(43) };
  const query = new URLSearchParams(input);
  const page = await render(`/cli?${query}`);
  assert.match(await page.text(), /Continue with Google/);
  const approved = await render(`/cli?${query}`, { headers: { cookie: "aex_account=account-fixture" } });
  assert.match(await approved.text(), /Authorize CLI/);
  assert.match(await (await render("/cli?redirect_uri=https://evil.example")).text(), /Invalid login request/);
  assert.equal((await render("/api/auth/login?returnTo=https://evil.example")).status, 400);
  const login = await render(`/api/auth/login?returnTo=${encodeURIComponent(`/cli?${query}`)}`, { redirect: "manual" });
  assert.equal(login.status, 307);
  assert.equal(new URL(login.headers.get("location")).hostname, "accounts.google.com");
  const body = { code_challenge: input.code_challenge, redirect_uri: input.redirect_uri };
  const post = (extra = {}) => render("/api/control/auth/grants", { method: "POST", headers: { origin, cookie: "aex_account=account-fixture", "content-type": "application/json", ...extra }, body: JSON.stringify(body) });
  assert.equal((await post({ origin: "https://evil.example" })).status, 403);
  assert.equal((await post({ cookie: "" })).status, 401);
  const response = await post();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).code, "one-time-code");
  assert.deepEqual(apiRequests.at(-1), { path: "/v1/auth/grants", authorization: "Bearer account-fixture", body });
  assert.equal(response.headers.get("cache-control"), "no-store");
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
  assert.match(text, /A minimal, extensible, distributed agent runtime\./);
  assert.match(text, /extensible, distributed agent runtime/);

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
  assert.match(text, /including hostEnv for application functions/);
  assert.match(text, /agentloop: pi\(\{ env: brainEnv\(\{ name: (?:"|&quot;)brain(?:"|&quot;) \}\) \}\)/);
  assert.match(text, /token: &quot;quickstart&quot;/);
  assert.match(text, /BRAIN_LISTEN=0\.0\.0\.0:8080/);
  assert.match(text, /ghcr\.io\/aexhq\/brain:latest/);
  assert.match(text, /MIT/);
  assert.match(html, /href="\/brain\/docs"/);
  assert.match(html, /href="\/brain\/docs\/reference\/api"/);
  assert.match(html, /href="https:\/\/github\.com\/aexhq\/brain"/);
  assert.doesNotMatch(text, /env-aws-microvm|VERCEL_AI_GATEWAY_API_KEY/);

  assert.match(text, /Transcripts and recorded Events remain readable from disk/);
  assert.match(text, /Multiple authorized Tool placements and optional model-visible selection/);
  assert.match(html, /href="\/brain\/docs\/reference\/benchmarks"/);
  assert.doesNotMatch(text, /14 KiB|sub-millisecond session creation/);
  assert.doesNotMatch(text, /Apache/i);
});

test("serves the hosted SDK quickstart", async () => {
  const response = await render("/docs");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /@aexhq\/sdk@0.71.0/);
  assert.match(html, /hostEnv/);
  assert.match(html, /customer-selected HTTP Environments/i);
});

test("serves the Brain documentation, generated API pages, and a static search index", async () => {
  const intro = await render("/brain/docs");
  assert.equal(intro.status, 200);
  const introText = (await intro.text()).replace(/<[^>]*>/g, " ");
  assert.match(introText, /Brain runs agent sessions/);
  assert.match(introText, /Quickstart/);

  const concept = await render("/brain/docs/concepts/agent-loop");
  assert.equal(concept.status, 200);
  assert.match(
    (await concept.text()).replace(/<[^>]*>/g, " "),
    /Brain accepts an already-built WebAssembly Component/,
  );

  // Generated from Brain's crates/brain-http/generated/contract/session/v1/openapi.yaml, never written by hand.
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

test("dashboard has exactly the three requested navigation items and self-service sign-in", async () => {
  const response = await render("/dashboard");
  assert.equal(response.status, 200);
  const html = await response.text();
  const nav=html.match(/<nav[^>]*aria-label="Dashboard"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert.ok(nav);
  assert.equal((nav.match(/<(?:a|button)\b/g) ?? []).length,3);
  for(const label of ["API keys","Docs","Account / Billing / Usage"]) assert.ok(nav.includes(label));
  assert.match(html,/Continue with Google/);
  assert.doesNotMatch(html,/Join the alpha|aex_iv_|Top up|Recovery token/);
  const signedIn=await render("/dashboard",{headers:{cookie:"aex_account=aex_account_test"}});
  assert.match(await signedIn.text(),/Loading account/);
});

test("customer proxy denies retired routes, cross-origin mutations and missing sessions",async()=>{
  assert.equal((await render("/api/control/keys")).status,401);
  assert.equal((await render("/api/control/topups")).status,404);
  assert.equal((await render("/api/control/accounts",{method:"POST"})).status,404);
  assert.equal((await render("/api/control/keys",{method:"POST",headers:{origin:"https://attacker.example",cookie:"aex_account=test"},body:'{"name":"x"}'})).status,403);
  assert.equal((await render("/api/control/keys",{method:"POST",body:'{"name":"x"}'})).status,403);
  assert.equal((await render("/api/control/keys?url=https://attacker.example")).status,404);
  const callback=await render("/api/auth/callback/google?code=forged&state=forged",{redirect:"manual"});
  assert.equal(callback.status,307);
  assert.match(callback.headers.get("location"),/dashboard\?error=signin/);
  assert.doesNotMatch(callback.headers.get("set-cookie")??"",/aex_account=/);
  const source=await readFile(new URL("../app/dashboard/DashboardClient.tsx",import.meta.url),"utf8");
  assert.doesNotMatch(source,/localStorage|sessionStorage/);
});

test("retired checkout routes are unavailable",async()=>{
  for(const path of ["/topup/success","/topup/cancelled"]) assert.equal((await render(path)).status,404);
});
