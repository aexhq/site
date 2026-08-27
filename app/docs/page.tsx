import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Run universal Agentloop Components with remote models, Tools, and Environments on Aex.",
};

const startExample = `import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { Aex } from "@aexhq/sdk";
import { packageUrl as piPackage } from "@aexhq/loop-pi";
import { definitions } from "@aexhq/tools";
import { awsMicrovm } from "@aexhq/env-aws-microvm";

const aex = new Aex({ apiKey: process.env.AEX_API_KEY! });
const loop = await aex.brain.admitAgentloop(await readFile(piPackage), randomUUID());
const environment = awsMicrovm({ id: "workspace", lifecyclePolicy: "session" });
const selected = [definitions.bash, definitions.read, definitions.write];
const session = await aex.sessions.create({
  agentloop_digest: loop.digest,
  model: { binding_id: "vercel-ai-gateway", model: "openai/gpt-5.4" },
  presentation: {
    system: "Work carefully and verify changes.",
    tools: selected.map((tool) => tool.definition),
  },
  environments: [environment],
  tool_bindings: selected.map((tool) => ({
    name: tool.definition.name,
    environment_id: environment.environment_id,
    remote_tool_id: tool.remoteToolId,
    grant: {},
  })),
  metadata: {},
}, { idempotencyKey: randomUUID() });

await session.send("Inspect the workspace.", { idempotencyKey: randomUUID() });`;

const eventsExample = `let cursor = 0;
for await (const event of session.events(cursor)) {
  await persist(event);
  cursor = event.sequence;
  await saveCursor(cursor);
}`;

const lifecycleExample = `await session.cancel({ idempotencyKey: randomUUID() });
await session.end({ idempotencyKey: randomUUID() });
await session.delete({ idempotencyKey: randomUUID() });`;

export default function Docs() {
  return (
    <main>
      <SiteHeader />
      <div className="shell docs-layout">
        <aside className="docs-nav" aria-label="Documentation sections">
          <p>On this page</p>
          <nav>
            <a href="#start">Start</a>
            <a href="#agentloop">Agentloop</a>
            <a href="#tools">Tools</a>
            <a href="#environments">Environments</a>
            <a href="#events">Events</a>
            <a href="#lifecycle">Lifecycle</a>
            <a href="#limits">Limits</a>
          </nav>
        </aside>

        <article className="docs-content">
          <header className="docs-intro">
            <p className="site-kicker">Documentation</p>
            <h1>Build with Aex</h1>
            <p>
              Aex runs a universal Agentloop over an in-memory context, journals every meaningful
              transition, calls a remote model gateway, and routes Tool operations to remote Environments.
            </p>
          </header>

          <section id="start" className="docs-section" aria-labelledby="docs-start-title">
            <h2 id="docs-start-title">Start</h2>
            <p>Create an API key in the dashboard, then install the SDK and selected extensions.</p>
            <pre className="site-code" aria-label="Install the Aex SDK"><code>npm install @aexhq/sdk @aexhq/loop-pi @aexhq/tools @aexhq/env-aws-microvm</code></pre>
            <pre className="site-code" aria-label="Create and use an Aex session"><code>{startExample}</code></pre>
            <div className="docs-note">
              Mutating requests use stable idempotency keys. Reuse a key only for the same logical
              request, including after a caller-process restart.
            </div>
          </section>

          <section id="agentloop" className="docs-section" aria-labelledby="docs-agentloop-title">
            <h2 id="docs-agentloop-title">One Agentloop extension pipeline</h2>
            <p>
              Brain has no native or built-in loop path. Every loop is admitted as the same
              capability-pure WebAssembly Component. Package tooling generates the WIT boundary, so
              extension authors write ordinary language code instead of hand-writing an ABI.
            </p>
            <p>
              An Agentloop computes the next decision from an observation. It cannot open sockets,
              read secrets, call a Tool directly, or keep hidden host resources. Brain performs the
              selected model or Tool operation and activates the loop again with the result.
            </p>
          </section>

          <section id="tools" className="docs-section" aria-labelledby="docs-tools-title">
            <h2 id="docs-tools-title">Separate Tool presentation from execution</h2>
            <p>
              The model sees stable Tool names, descriptions, and schemas. A binding maps each name
              to a remote Tool identifier in one Environment. Tool implementation code never runs in
              Brain, so it can live in a sandbox, browser, service, or user machine.
            </p>
          </section>

          <section id="environments" className="docs-section" aria-labelledby="docs-environments-title">
            <h2 id="docs-environments-title">Let adapters manage Environment lifecycle</h2>
            <p>
              An Environment adapter handles setup, attachment, execution, cancellation, detachment,
              and teardown. Every command carries the complete sealed binding and stable operation
              identity. Process-local connections are only caches, so several sessions can resolve
              the same logical Environment consistently.
            </p>
          </section>

          <section id="events" className="docs-section" aria-labelledby="docs-events-title">
            <h2 id="docs-events-title">Recover from the journal</h2>
            <pre className="site-code" aria-label="Consume durable session events"><code>{eventsExample}</code></pre>
            <p>
              Cursor reads come from the durable session journal. Live telemetry is bounded and
              best effort: it retries briefly, then drops rather than blocking execution or growing
              without limit. Bridge durable cursor reads into your own queue for at-least-once delivery.
            </p>
          </section>

          <section id="lifecycle" className="docs-section" aria-labelledby="docs-lifecycle-title">
            <h2 id="docs-lifecycle-title">Cancel, end, and delete explicitly</h2>
            <pre className="site-code" aria-label="Manage a session lifecycle"><code>{lifecycleExample}</code></pre>
            <p>Cancel targets active work, end closes the session, and delete removes its retained journal.</p>
          </section>

          <section id="limits" className="docs-section" aria-labelledby="docs-limits-title">
            <h2 id="docs-limits-title">Useful boundaries</h2>
            <div className="table-scroll">
              <table className="docs-table">
                <thead><tr><th>Boundary</th><th>Hosted release</th></tr></thead>
                <tbody>
                  <tr><th scope="row">Control request</th><td>64 KiB</td></tr>
                  <tr><th scope="row">Brain request and response</th><td>32 MiB</td></tr>
                  <tr><th scope="row">Concurrent retained sessions</th><td>Account policy</td></tr>
                  <tr><th scope="row">Session creates</th><td>Account hourly policy</td></tr>
                  <tr><th scope="row">Telemetry queue</th><td>Bounded; drops under sustained pressure</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <nav className="docs-more" aria-label="More documentation">
            <a href="https://github.com/aexhq/aex/blob/main/docs/quickstart.md">Full quickstart</a>
            <a href="https://github.com/aexhq/brain/blob/main/contracts/session/v1/openapi.yaml">Session API</a>
            <a href="https://github.com/aexhq/aex/blob/main/contracts/control/v1/openapi.yaml">Control API</a>
            <Link href="/dashboard">Open dashboard</Link>
          </nav>
        </article>
      </div>
      <SiteFooter />
    </main>
  );
}
