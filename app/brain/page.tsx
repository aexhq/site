import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { brainRepoUrl, discordUrl } from "../site-copy";

const title = "Brain";
const tagline = "A minimal, extensible, distributed agent runtime.";

export const metadata: Metadata = {
  title,
  description: tagline,
};

const features = [
  [
    "Tools run wherever you want",
    "One session can use Tools in a browser, a sandbox, and the native Brain Environment. Each invocation explicitly names an authorized Tool and Environment.",
  ],
  [
    "Built for low overhead",
    "Prepared code is reused, each invocation gets a fresh Wasm store, and session execution is released between turns. Transcripts and recorded Events remain readable from disk while execution is suspended.",
  ],
  [
    "Any model",
    "Anthropic and OpenAI wire formats, gateways, your own keys. The model is pinned when the session starts, so nothing swaps it out mid-conversation.",
  ],
  [
    "Any Agentloop",
    "Pi, Codex-style, or your own: each Agentloop runs in a selected Environment through the same execution interface. Brain journals its model and Tool effects.",
  ],
  [
    "Components, not source bundles",
    "brainEnv runs packaged WebAssembly Components in a managed pool of worker processes. Remote Environments interpret their own implementation descriptors and can provide other runtimes.",
  ],
  [
    "Placement is explicit",
    "Every factory placement names an Environment, including hostEnv for application functions. A Tool can have several authorized placements; the Agentloop can choose privately or expose that choice to the model.",
  ],
  [
    "Everything is an event log",
    "A session is an ordered, replayable log of what happened, and a running turn streams the model's output token by token. A live subscriber that falls behind drops, and the turn keeps its pace.",
  ],
  [
    "Conversations outlive processes",
    "Sessions rebuild from their own journal on restart, an interrupted turn says so with a turn_failed event whose code is interrupted, and a conversation can be handed to a new session as history — on another machine if you like.",
  ],
  [
    "Server or library",
    "Run the binary with its local-disk store, or embed the brain crate in your own Rust service and supply your own storage and transport.",
  ],
] as const;

const parts = [
  [
    "Agentloop",
    "An implementation and configuration, placed in an Environment",
    "Executes it with scoped model, dispatch, events, emit, and telemetry services",
  ],
  [
    "Model",
    "A binding: provider, model name, key",
    "Pins it for the life of the session and makes the call",
  ],
  [
    "Tool",
    "A canonical schema and implementations placed in named Environments",
    "Validates the selected pair and schemas, journals the intent, then dispatches once",
  ],
  [
    "Environment",
    "Execution and lifecycle mechanisms for Agentloops and Tools",
    "Sets it up, validates requirements, invokes, cancels, and detaches",
  ],
] as const;

const roadmap = [
  ["Shipped", "Four-part runtime: Agentloop, Model, Tool, Environment"],
  ["Shipped", "Prebuilt Components with explicit Environment placement"],
  ["Shipped", "One canonical journal with restart recovery and derived projections"],
  ["Shipped", "HTTP/SSE session API and the TypeScript SDK"],
  ["Shipped", "hostEnv for application and browser functions"],
  ["Shipped", "Environment driver contract with the official adapters"],
  ["Shipped", "End-to-end benchmark harness against other runtimes"],
  ["Shipped", "Native workspaces isolated by session and Environment"],
  ["Shipped", "Turn-end suspension and transcript reads without activation"],
  ["Shipped", "Agentloop Event reads and model-visible environment failures"],
  ["Shipped", "Independent provider routes and a lazy Environment example"],
  ["Shipped", "brain-sessions and a separate native worker pool"],
  ["Shipped", "Multiple authorized Tool placements and optional model-visible selection"],
  ["Next", "Tenant resource limits, fairness, and stronger isolation"],
  ["Later", "External commit services and suspension during model or tool waits"],
  ["Next", "Multimodal input — images and files on send"],
  ["Next", "File access and workspace sync"],
  ["Next", "crates.io publication"],
  ["Later", "Sessions spread across machines, sharing environments"],
  ["Later", "Session export and import"],
  ["Later", "Custom images, scoped credentials, network metering"],
] as const;

const installExample = `npm install @aexhq/brain @aexhq/agentloop-pi zod`;

const sessionExample = `import { Brain, brainEnv, hostEnv, tool } from "@aexhq/brain";
import { pi } from "@aexhq/agentloop-pi";
import { z } from "zod";

const lookupOrder = tool({
  name: "lookup_order",
  description: "Look up an order by id.",
  input: z.object({ id: z.string() }),
  run: async ({ id }, ctx) => ctx.finish({ id, status: "shipped" }),
});

const brain = new Brain({ baseUrl: "http://127.0.0.1:8080", token: "quickstart" });

const session = await brain.sessions.create({
  model: {
    provider: "openai",
    name: "gpt-5-mini",
    apiKey: process.env.OPENAI_API_KEY!,
  },
  agentloop: pi({ env: brainEnv({ name: "brain" }) }),
  tools: [lookupOrder({ env: hostEnv({ name: "app" }) })],
  system: "Answer briefly and directly.",
});

await session.send("Explain what a session runtime does, in one sentence.");
for await (const event of session.events()) console.log(event);

await session.end();
await session.delete();`;

const runExample = `docker run --rm -p 127.0.0.1:8080:8080 \\
  -e BRAIN_LISTEN=0.0.0.0:8080 -e BRAIN_API_TOKEN=quickstart \\
  -v brain-data:/var/lib/brain ghcr.io/aexhq/brain:latest`;

export default function BrainPage() {
  return (
    <main>
      <SiteHeader>
        <Link href="/brain/docs">Docs</Link>
      </SiteHeader>

      <article className="site-overview prose-shell">
        <header className="site-intro">
          <h1>{title}</h1>
          <p>{tagline}</p>
        </header>

        <nav className="site-links" aria-label="Brain">
          <Link href="/brain/docs">Docs</Link>
          <Link href="/brain/docs/reference/api">API Reference</Link>
          <a href={brainRepoUrl}>GitHub</a>
          <a href={discordUrl}>Discord</a>
        </nav>

        <section className="site-section" id="what-it-is" aria-labelledby="what-it-is-title">
          <h2 id="what-it-is-title">What it is</h2>
          <p>
            Brain is a minimal, extensible, distributed agent runtime. Build AI-native
            apps from Agentloops, models, Tools, and Environments. Every implementation is explicitly
            placed. A Tool with <code>run</code> uses <code>hostEnv</code> in the application
            process that declared it. Brain
            owns session records, model effects, and routing; extension code runs in
            the host you chose.
          </p>
          <p>
            The name comes from Anthropic&apos;s split of{" "}
            <a href="https://www.anthropic.com/engineering/managed-agents">
              the brain from the hands
            </a>
            . Agentloops make decisions; Brain executes and records their requests. Environments host placed
            Agentloops and Tools in a sandbox, the native worker pool, or a remote service. Application
            functions use the same session abstraction through hostEnv. The small-and-extensible shape follows{" "}
            <a href="https://github.com/earendil-works/pi">Pi</a>.
          </p>
        </section>

        <section className="site-section" id="features" aria-labelledby="features-title">
          <h2 id="features-title">Features</h2>
          <dl className="site-feature-list">
            {features.map(([name, detail]) => (
              <div className="site-feature" key={name}>
                <dt>{name}</dt>
                <dd>{detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="site-section" id="benchmark" aria-labelledby="benchmark-title">
          <h2 id="benchmark-title">Performance</h2>
          <p>
            Brain targets low startup and resume latency and low CPU and memory use when many
            sessions share a machine. Admission, session creation, activation, and history reads
            are separate operations. Callers decide Environment lifetime; providers implement lifecycle
            mechanisms and can allocate on the first execution.
          </p>
          <p>
            CI checks journal growth, worker concurrency, history reads without activation, and
            turn-end memory release. A disposable checkpoint avoids decoding unchanged history;
            its index and transcript still grow with the session. Earlier comparison numbers
            describe the previous architecture and are archived in the{" "}
            <Link href="/brain/docs/reference/benchmarks">benchmark documentation</Link>.
          </p>
        </section>

        <section className="site-section" id="architecture" aria-labelledby="architecture-title">
          <h2 id="architecture-title">Architecture</h2>
          <p>
            Brain is standalone and cloud independent. Assemble four primitives through public
            contracts. Aex can consume Brain like any third party; platform workflow durability
            and provisioning are separate concerns. Interrupted turns are recorded for the caller
            to resolve, and tool or environment failures are never retried automatically.
          </p>
          <div className="table-scroll">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">Kind</th>
                  <th scope="col">You supply</th>
                  <th scope="col">Brain does</th>
                </tr>
              </thead>
              <tbody>
                {parts.map(([kind, supply, does]) => (
                  <tr key={kind}>
                    <th scope="row">{kind}</th>
                    <td>{supply}</td>
                    <td>{does}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="site-section" id="roadmap" aria-labelledby="roadmap-title">
          <h2 id="roadmap-title">Roadmap</h2>
          <dl className="site-definition-list">
            {roadmap.map(([status, item]) => (
              <div key={item}>
                <dt>{status}</dt>
                <dd>{item}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          className="site-section"
          id="getting-started"
          aria-labelledby="getting-started-title"
        >
          <h2 id="getting-started-title">Getting started</h2>
          <p>
            Drive a session from TypeScript. The Agentloop is placed in Brain&apos;s built-in native
            Environment; the Tool runs in this Node process through hostEnv.
          </p>
          <pre className="site-code" aria-label="Install the Brain packages">
            <code>{installExample}</code>
          </pre>
          <pre className="site-code" aria-label="Create a Brain session">
            <code>{sessionExample}</code>
          </pre>
          <p>Or run the server first:</p>
          <pre className="site-code" aria-label="Run Brain with Docker">
            <code>{runExample}</code>
          </pre>
          <p>
            Guides, concepts, and the generated API reference are in the{" "}
            <Link href="/brain/docs">documentation</Link>.
          </p>
        </section>

        <section className="site-section" id="license" aria-labelledby="license-title">
          <h2 id="license-title">License</h2>
          <p>
            MIT. The source is at <a href={brainRepoUrl}>github.com/aexhq/brain</a>.
          </p>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}
