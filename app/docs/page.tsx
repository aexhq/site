import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Start an Aex session, compose Agentloop, Model, Tool, and Environment extensions, and save durable objects.",
};

const startExample = `import { awsMicrovm } from "@aexhq/env-aws-microvm";
import { pi } from "@aexhq/loop-pi";
import { openai } from "@aexhq/model-openai";
import { Aex } from "@aexhq/sdk";
import { bash, read, write } from "@aexhq/tools";

const workspace = awsMicrovm();
const aex = new Aex({ apiKey: process.env.AEX_API_KEY! });

const session = await aex.sessions.create({
  model: {
    component: openai(),
    provider: "openai",
    name: "gpt-5.4",
    apiKey: process.env.OPENAI_API_KEY!,
  },
  agentloop: pi(),
  environments: { workspace },
  tools: [bash(), read(), write()],
  network: { outbound: "none" },
});

console.log(await session.send("Review the customer record."));
aex.close();`;

const applicationToolExample = `export const processDocument = tool(
  z.object({ path: z.string() }),
  async function processDocument({ path }) {
    return process(path);
  },
)
  .describe("Process one document.")
  .client({ registration: "document-processor-v1" });`;

const storageExample = `const state = await session.sandbox.create();
if (!state.generation) throw new Error("sandbox is not live");

const generation = state.generation;
await session.sandbox.files.upload("/workspace/input.txt", "hello", { generation });

await session.storage.copyFromSandbox({
  environment: "workspace",
  path: "/workspace/input.txt",
  key: "outputs/input.txt",
  sandboxGeneration: generation,
});

await session.storage.copyToSandbox({
  environment: "workspace",
  key: "outputs/input.txt",
  path: "/workspace/restored.txt",
  sandboxGeneration: generation,
});`;

const lifecycleExample = `await session.end();
// The session is now ending; its journal and storage remain.

await session.delete();
// Resolves after the durable deletion job confirms physical cleanup.`;

export default function Docs() {
  return (
    <main>
      <SiteHeader />

      <div className="shell docs-layout">
        <aside className="docs-nav" aria-label="Documentation sections">
          <p>On this page</p>
          <nav>
            <a href="#start">Start</a>
            <a href="#tools">Tools</a>
            <a href="#network">Network</a>
            <a href="#files">Files and storage</a>
            <a href="#children">Child sessions</a>
            <a href="#lifecycle">Lifecycle</a>
            <a href="#limits">Limits</a>
          </nav>
        </aside>

        <article className="docs-content">
          <header className="docs-intro">
            <p className="site-kicker">Documentation</p>
            <h1>Build with Aex</h1>
            <p>
              Aex keeps a model session durable and starts isolated compute only
              when a selected tool needs it. Bring your own model key, fix the
              tools and network policy at creation, then send work.
            </p>
          </header>

          <section id="start" className="docs-section" aria-labelledby="docs-start-title">
            <h2 id="docs-start-title">Start</h2>
            <p>Create an API key in the dashboard, then install the SDK and the extensions this session uses.</p>
            <pre className="site-code" aria-label="Install the Aex SDK">
              <code>npm install @aexhq/sdk @aexhq/env-app @aexhq/env-aws-microvm @aexhq/loop-pi @aexhq/model-openai @aexhq/tools zod</code>
            </pre>
            <pre className="site-code" aria-label="Create and use an Aex session">
              <code>{startExample}</code>
            </pre>
            <p>
              <code>session.send()</code> returns text. Pass a Zod schema as{" "}
              <code>output</code> when the caller needs validated typed data. A
              session keeps its history, so another <code>send()</code> continues
              the same conversation.
            </p>
            <div className="docs-note">
              Hosted create and message requests use stable idempotency keys. The
              SDK creates them automatically; supply <code>idempotencyKey</code>{" "}
              when a retry must survive your own process restart.
            </div>
          </section>

          <section id="tools" className="docs-section" aria-labelledby="docs-tools-title">
            <h2 id="docs-tools-title">Place tools deliberately</h2>
            <p>
              A session has no default loop or environment. Tool names, schemas,
              bindings, and network policy are sealed when it is created. Model
              output cannot add or widen them.
            </p>
            <dl className="docs-definitions">
              <div>
                <dt><code>agentloop: pi()</code></dt>
                <dd>Selects the imported component that owns agent-loop policy.</dd>
              </div>
              <div>
                <dt><code>model.component: openai()</code></dt>
                <dd>Selects the imported component that implements provider streaming and event mapping.</dd>
              </div>
              <div>
                <dt><code>environments</code></dt>
                <dd>Names opaque references such as <code>app()</code> and <code>awsMicrovm()</code>.</dd>
              </div>
              <div>
                <dt><code>@aexhq/tools</code></dt>
                <dd>Adds prepared tools such as shell, files, and subagents. Each tool binds to one compatible environment.</dd>
              </div>
            </dl>
            <pre className="site-code" aria-label="Define an application tool">
              <code>{applicationToolExample}</code>
            </pre>
            <p>
              Application Tools stay in your process and route through exactly one
              declared <code>app()</code> Environment. Official managed Tool components
              carry one immutable runtime bundle and require exactly one declared
              execution Environment in the hosted MVP.
            </p>
          </section>

          <section id="network" className="docs-section" aria-labelledby="docs-network-title">
            <h2 id="docs-network-title">Seal outbound network</h2>
            <p>
              The AWS MicroVM environment starts with no outbound network. Choose{" "}
              <code>{`{ outbound: "public" }`}</code> for supported public
              destinations or an allowlist for narrower hosts, CIDRs, and ports.
              Private, metadata, and Aex infrastructure stay blocked. This policy
              does not govern code bound to an <code>app()</code> callback environment.
            </p>
          </section>

          <section id="files" className="docs-section" aria-labelledby="docs-files-title">
            <h2 id="docs-files-title">Temporary files, durable objects</h2>
            <p>
              The managed sandbox is shared by a root and its children, but its
              filesystem can disappear. Every live file operation and both copy
              directions require its current generation. Reads never restore an
              old filesystem.
            </p>
            <pre className="site-code" aria-label="Copy between environment files and durable storage">
              <code>{storageExample}</code>
            </pre>
            <p>
              Use <code>session.storage</code> for data that must survive environment
              loss. There is no automatic checkpoint or sync. Stream helpers avoid
              buffering large objects; an object may be at most 512 MiB, and hosted
              visible plus reserved storage is capped at 10 GiB per session and per account.
            </p>
            <div className="docs-note">
              A never-materialized sandbox returns 409. A stale, released, or
              expired generation returns 410. File APIs honor Unix permissions
              and do not bypass a tool&apos;s deliberate mode-0600 file.
            </div>
          </section>

          <section id="children" className="docs-section" aria-labelledby="docs-children-title">
            <h2 id="docs-children-title">Delegate with ordinary sessions</h2>
            <p>
              A child is an ordinary durable session with its own journal and
              lifecycle. It inherits the root&apos;s immutable model, tool, secret,
              network, environment declarations and bindings, and resource
              ceilings. The same opaque environment references address the
              root&apos;s logical environments.
              Forks point to a fixed parent-history boundary instead of copying a
              mutable transcript. Parents can message, follow up, wait, interrupt,
              or end a child explicitly.
            </p>
          </section>

          <section id="lifecycle" className="docs-section" aria-labelledby="docs-lifecycle-title">
            <h2 id="docs-lifecycle-title">End and delete are different</h2>
            <pre className="site-code" aria-label="End and delete a session">
              <code>{lifecycleExample}</code>
            </pre>
            <p>
              End recursively fences new work but retains the session record and
              stored objects. Delete is destructive and its cleanup job is retryable; it does not
              hold one HTTP request open while compute and object versions are removed.
            </p>
          </section>

          <section id="limits" className="docs-section" aria-labelledby="docs-limits-title">
            <h2 id="docs-limits-title">Useful boundaries</h2>
            <div className="table-scroll">
              <table className="docs-table">
                <thead>
                  <tr><th>Boundary</th><th>Hosted MVP</th></tr>
                </thead>
                <tbody>
                  <tr><th scope="row">Create request</th><td>24 MiB</td></tr>
                  <tr><th scope="row">Message request</th><td>192 KiB</td></tr>
                  <tr><th scope="row">Environment tool terminal value</th><td>92 KiB canonical JSON</td></tr>
                  <tr><th scope="row">Storage object</th><td>512 MiB</td></tr>
                  <tr><th scope="row">Session and account storage</th><td>10 GiB each</td></tr>
                </tbody>
              </table>
            </div>
            <p>
              Brain seals a conservative 32,768-token context window unless{" "}
              <code>model.contextWindowTokens</code> says otherwise. Provider
              replacement retries default to one; set the create option to zero
              when an ambiguous provider outcome must fail strictly.
            </p>
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
