import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { brainRepoUrl, discordUrl } from "../site-copy";

const title = "Brain";
const tagline = "A minimal, blazing fast, extensible agent runtime.";

export const metadata: Metadata = {
  title,
  description: tagline,
};

const features = [
  [
    "Tools run wherever you want",
    "A Tool is either resident in the application process that declared its callback, or explicitly placed in an Environment. One session can mix an application-resident Tool with a Component in a sandbox without hiding where either runs.",
  ],
  [
    "Built for low overhead",
    "Session state lives in memory while effect intents are durably committed before dispatch: sub-millisecond session creation, ~14 KiB per idle session. The numbers are measured, and CI holds them.",
  ],
  [
    "Any model",
    "Anthropic and OpenAI wire formats, gateways, your own keys. The model is pinned when the session starts, so nothing swaps it out mid-conversation.",
  ],
  [
    "Any Agentloop",
    "Pi, Codex-style, or your own — each Agentloop is a prebuilt Component bound to an explicit Environment. Brain is not an agent; it is what agents run on, and the loop we ship has no privileges yours doesn't.",
  ],
  [
    "Components, not source bundles",
    "Brain accepts prebuilt WebAssembly Components. It does not compile application source or infer dependencies: brainWasm() is the built-in native placement, and Environment extensions provide other hosts.",
  ],
  [
    "Placement is explicit",
    "Factories for placed extensions require { env }. Resident Tools omit it and remain in the host that declared them, while Brain records and seals every Environment binding when the session is created.",
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
    "A Component and configuration, bound to an Environment",
    "Admits the Component, activates it through that binding, and carries out its decisions",
  ],
  [
    "Model",
    "A binding: provider, model name, key",
    "Pins it for the life of the session and makes the call",
  ],
  [
    "Tool",
    "A model-facing schema and either a resident callback or a placed implementation",
    "Routes it to its registered resident host or bound Environment, then journals and dispatches calls",
  ],
  [
    "Environment",
    "Explicit placement and authority for Agentloops and placed Tools",
    "Sets it up, validates requirements, invokes, cancels, and detaches",
  ],
] as const;

const roadmap = [
  ["Shipped", "Four-part runtime: Agentloop, Model, Tool, Environment"],
  ["Shipped", "Prebuilt Components with explicit Environment placement"],
  ["Shipped", "One canonical journal with restart recovery and derived projections"],
  ["Shipped", "HTTP/SSE session API and the TypeScript SDK"],
  ["Shipped", "Resident Tool hosts for application and client callbacks"],
  ["Shipped", "Environment driver contract with the official adapters"],
  ["Shipped", "End-to-end benchmark harness against other runtimes"],
  ["Shipped", "Cross-session native workspace isolation"],
  ["In progress", "A frozen v1 API and tagged releases"],
  ["Next", "Multimodal input — images and files on send"],
  ["Next", "File access and workspace sync"],
  ["Next", "crates.io publication"],
  ["Later", "Sessions spread across machines, sharing environments"],
  ["Later", "Session export and import"],
  ["Later", "Custom images, scoped credentials, network metering"],
] as const;

const installExample = `npm install @aexhq/brain @aexhq/agentloop-pi zod`;

const sessionExample = `import { Brain, brainWasm, tool } from "@aexhq/brain";
import { pi } from "@aexhq/agentloop-pi";
import { z } from "zod";

const lookupOrder = tool({
  name: "lookup_order",
  description: "Look up an order by id.",
  input: z.object({ id: z.string() }),
  run: async ({ id }) => ({ id, status: "shipped" }),
});

const brain = new Brain({ baseUrl: "http://127.0.0.1:8080", token: "quickstart" });

const session = await brain.sessions.create({
  model: {
    provider: "openai",
    name: "gpt-5-mini",
    apiKey: process.env.OPENAI_API_KEY!,
  },
  agentloop: pi({ env: brainWasm() }),
  tools: [lookupOrder()],
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
            Brain is a minimal, blazingly fast, extensible agent runtime server. Build AI-native
            apps from Agentloops, models, Tools, and Environments. Each Agentloop is a prebuilt
            Component, and every placed extension is bound explicitly to an Environment. A Tool
            with <code>run</code> stays resident in the application process that declared it. Brain
            owns the durable session, journal, model effects, and routing; extension code runs in
            the host you chose.
          </p>
          <p>
            The name comes from Anthropic&apos;s split of{" "}
            <a href="https://www.anthropic.com/engineering/managed-agents">
              the brain from the hands
            </a>
            . Brain is the brain: it decides. Environments are explicit hands for placed
            Agentloops and Tools — a sandbox, local process, or remote service — while resident
            Tools stay with your application. The small-and-extensible shape follows{" "}
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
          <h2 id="benchmark-title">Benchmark</h2>
          <p>
            The benchmark measures the engine, not a model: every subject is driven through its own
            public API on the same machine, against the same scripted model, so nothing here is
            model latency. Medians on an AWS c7g.xlarge; the harness lives in the repository, so
            the numbers can be re-run on your own hardware.
          </p>
          <div className="table-scroll">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">&nbsp;</th>
                  <th scope="col">Brain</th>
                  <th scope="col">ZeroClaw</th>
                  <th scope="col">LangGraph Server</th>
                  <th scope="col">OpenClaw</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Turn round-trip</th>
                  <td>40 ms</td>
                  <td>53 ms</td>
                  <td>1.22 s</td>
                  <td>3.33 s</td>
                </tr>
                <tr>
                  <th scope="row">Time to first token</th>
                  <td>2.9 ms</td>
                  <td>10.6 ms</td>
                  <td>207 ms</td>
                  <td>1.33 s</td>
                </tr>
                <tr>
                  <th scope="row">New session</th>
                  <td>0.76 ms</td>
                  <td>2.2 ms</td>
                  <td>0.66 ms</td>
                  <td>5.4 ms</td>
                </tr>
                <tr>
                  <th scope="row">Journal growth per 100 turns</th>
                  <td>0.23 MiB</td>
                  <td>—</td>
                  <td>—</td>
                  <td>—</td>
                </tr>
                <tr>
                  <th scope="row">Memory per idle session</th>
                  <td>14 KiB</td>
                  <td>50 MiB</td>
                  <td>—</td>
                  <td>490 MiB</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Brain&apos;s first-token figure is a real measurement: the scripted provider delays
            its first token deliberately and the probe subtracts the delay. The full charts compare agent
            runtimes only — with AgentScope Runtime, Letta, Awaken, and OpenFang beside the
            columns here — in the{" "}
            <a href={`${brainRepoUrl}#benchmarks`}>repository README</a>.
          </p>
        </section>

        <section className="site-section" id="architecture" aria-labelledby="architecture-title">
          <h2 id="architecture-title">Architecture</h2>
          <p>Brain owns the session. Four extension roles plug into it.</p>
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
            Environment; the Tool remains resident in this Node process.
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
