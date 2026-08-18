import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", String(process.pid) + "-" + String(Date.now()));
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost" + path, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the public benchmark record", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Agent sessions, kept alive · aex<\/title>/i);
  assert.match(html, /Platform-added TTFT/);
  assert.match(html, /1\.4<span>ms<\/span>/);
  assert.match(html, /2,002/);
  assert.match(html, /≈3,430 calls\/s/);
  assert.match(html, /leakage-gate/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("server-renders the token-in-memory dashboard entry", async () => {
  const response = await render("/dashboard");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Dashboard · aex<\/title>/i);
  assert.match(html, /The bill is a fold, not a guess\./);
  assert.match(html, /aex_at_/);
  assert.match(html, /Token kept in memory only/);
  assert.doesNotMatch(html, /localStorage|sessionStorage/);
});

test("dashboard proxy is a fixed read allowlist", async () => {
  const proxy = await readFile(
    new URL("../app/api/control/[...path]/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(proxy, /allowedReads = new Set/);
  assert.match(proxy, /https:\/\/api-dev\.aex\.dev/);
  assert.match(proxy, /upstream\.protocol !== "https:"/);
  assert.match(proxy, /redirect: "manual"/);
  assert.doesNotMatch(proxy, /request\.nextUrl\.searchParams\.get\(["'](?:url|origin|host)/);
  await assert.rejects(access(new URL("../app/_sites-preview", templateRoot)));
});
