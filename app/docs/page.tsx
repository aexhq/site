import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Start an Aex session, place typed tools, work with temporary sandbox files, and save durable objects.",
};

const startExample = `import { Aex, tool } from "@aexhq/sdk";
import { z } from "zod";

const catalog = new Map([["sku_123", { inStock: 7 }]]);
const lookupStock = tool(
  z.object({ sku: z.string() }),
  async function lookupStock({ sku }) {
    return catalog.get(sku) ?? { inStock: 0 };
  },
).client();

const aex = new Aex({
  apiKey: process.env.AEX_API_KEY!,
  client: { id: "store-api" },
});

const session = await aex.sessions.create({
  model: {
    provider: "openai",
    name: "gpt-5.4",
    apiKey: process.env.OPENAI_API_KEY!,
  },
  tools: [lookupStock],
});

console.log(await session.send("Can we fulfill 3 units of sku_123?"));
aex.close();`;

const serverToolExample = `export default tool(
  z.object({ path: z.string() }),
  async function processDocument({ path }, context) {
    return { path, workspace: context.workspace };
  },
)
  .describe("Process one document in managed compute.")
  .server(import.meta.url, { env: ["PROCESSOR_TOKEN"] });`;

const storageExample = `const state = await session.sandbox.create();
if (!state.generation) throw new Error("sandbox is not live");

const generation = state.generation;
await session.sandbox.files.upload(
  "/workspace/input.txt",
  "hello",
  { generation },
);

await session.storage.copyFromSandbox({
  path: "/workspace/input.txt",
  key: "outputs/input.txt",
  sandboxGeneration: generation,
});

await session.storage.copyToSandbox({
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
            <p>Create an API key in the dashboard, then install the Node 22 SDK and Zod.</p>
            <pre className="site-code" aria-label="Install the Aex SDK">
              <code>npm install @aexhq/sdk @aexhq/tools zod</code>
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
              Tool names, schemas, placement, and network policy are sealed when
              the session is created. Model output cannot add or widen them.
            </p>
            <dl className="docs-definitions">
              <div>
                <dt><code>.client()</code></dt>
                <dd>Runs in your connected Node application. Closures and application credentials stay there.</dd>
              </div>
              <div>
                <dt><code>.server(import.meta.url)</code></dt>
                <dd>Runs the exported function in the root tree&apos;s lazy managed computer.</dd>
              </div>
              <div>
                <dt><code>@aexhq/tools</code></dt>
                <dd>Adds explicit engine capabilities such as shell, files, storage, web, and isolated extra sandboxes.</dd>
              </div>
            </dl>
            <pre className="site-code" aria-label="Define a server tool">
              <code>{serverToolExample}</code>
            </pre>
            <p>
              A server tool receives only its declared environment names. Each
              binding runs as a separate unprivileged user in hosted compute;
              local mode is intentionally unsandboxed.
            </p>
          </section>

          <section id="network" className="docs-section" aria-labelledby="docs-network-title">
            <h2 id="docs-network-title">Seal outbound network</h2>
            <p>
              Managed compute starts with no outbound network. Choose{" "}
              <code>{`{ outbound: "public" }`}</code> for supported public
              destinations or an allowlist for narrower hosts, CIDRs, and ports.
              Private, metadata, and Aex infrastructure stay blocked. This policy
              does not govern code placed with <code>.client()</code>.
            </p>
          </section>

          <section id="files" className="docs-section" aria-labelledby="docs-files-title">
            <h2 id="docs-files-title">Temporary files, durable objects</h2>
            <p>
              The default sandbox is shared by a root and its children, but its
              filesystem can disappear. Every live file operation and both copy
              directions require the current generation. Reads never restore an
              old filesystem.
            </p>
            <pre className="site-code" aria-label="Copy between sandbox files and durable storage">
              <code>{storageExample}</code>
            </pre>
            <p>
              Use <code>session.storage</code> for data that must survive sandbox
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
              network, and resource ceilings, and shares the default sandbox.
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
                  <tr><th scope="row">Managed tool terminal value</th><td>92 KiB canonical JSON</td></tr>
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
