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
    "Brain never executes tool code. It calls whatever you bind the tool to — a sandbox VM, a browser tab driving the DOM, your own backend, the user's laptop — and one session can span several at once.",
  ],
  [
    "Built for low overhead",
    "Session state lives in memory and the journal is written behind the turn: sub-millisecond session creation, ~14 KiB per idle session. The numbers are measured, and CI holds them.",
  ],
  [
    "Any model",
    "Anthropic and OpenAI wire formats, gateways, your own keys. The model is pinned when the session starts, so nothing swaps it out mid-conversation.",
  ],
  [
    "Any agent loop",
    "Pi, Codex-style, or your own — and sessions can create sessions for subagent work. Brain is not an agent; it is what agents run on, and the loop we ship has no privileges yours doesn't.",
  ],
  [
    "The loop is sealed off",
    "An agent loop compiles to WebAssembly and runs in a standalone runtime. No network, no filesystem, no secrets, no clock — Brain performs every effect.",
  ],
  [
    "Any language",
    "Agent loops compile to WebAssembly. Tools and environments talk to Brain over plain HTTP. One tool in Rust and another in Node, in the same session.",
  ],
  [
    "Everything is an event log",
    "A session is an ordered, replayable log of what happened, and a running turn streams the model's output token by token. Live streaming drops rather than stalling a turn.",
  ],
  [
    "Conversations outlive processes",
    "Sessions rebuild from their own journal on restart, an interrupted turn says so with a turn_interrupted event, and a conversation can be handed to a new session as history — on another machine if you like.",
  ],
  [
    "Server or library",
    "Run the binary — the journal is the only thing it writes — or embed the brain crate in your own Rust service and supply your own storage and transport.",
  ],
] as const;

const parts = [
  [
    "Agent loop",
    "The policy: given what just happened, what next",
    "Runs it in a WebAssembly sandbox and carries out the decision",
  ],
  [
    "Model",
    "A binding: provider, model name, key",
    "Pins it for the life of the session and makes the call",
  ],
  [
    "Tool",
    "A name, description, schema, and where it runs",
    "Logs the call and sends it to the bound environment",
  ],
  [
    "Environment",
    "Somewhere tool calls actually execute",
    "Sets it up, attaches, calls, cancels, tears it down",
  ],
] as const;

const roadmap = [
  ["Shipped", "Four-part runtime: agent loop, model, tool, environment"],
  ["Shipped", "WebAssembly agent loop pipeline"],
  ["Shipped", "Append-only segment log with best-effort restart recovery"],
  ["Shipped", "HTTP/SSE session API and the TypeScript SDK"],
  ["Shipped", "Remote environment contract with the official adapters"],
  ["Shipped", "End-to-end benchmark harness against other runtimes"],
  ["In progress", "Cross-session isolation test"],
  ["In progress", "A frozen v1 API and tagged releases"],
  ["Next", "Multimodal input — images and files on send"],
  ["Next", "File access and workspace sync"],
  ["Next", "crates.io publication"],
  ["Later", "Sessions spread across machines, sharing environments"],
  ["Later", "Checkpoint and restore"],
  ["Later", "Custom images, scoped credentials, network metering"],
] as const;

const installExample = `npm install @aexhq/brain @aexhq/agentloop-pi`;

const sessionExample = `import { Brain } from "@aexhq/brain";
import { pi } from "@aexhq/agentloop-pi";

const brain = new Brain({ baseUrl: "http://127.0.0.1:8080" });

const session = await brain.sessions.create({
  model: {
    provider: "openai",
    name: "gpt-5-mini",
    apiKey: process.env.OPENAI_API_KEY!,
  },
  agentloop: pi(),
  system: "Answer briefly and directly.",
});

await session.send("Explain what a session runtime does, in one sentence.");
for await (const event of session.events()) console.log(event);

await session.end();
await session.delete();`;

const runExample = `docker run --rm -p 8080:8080 -v brain-data:/var/lib/brain ghcr.io/aexhq/brain:latest`;

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

        <p className="callout-note">
          Brain is under early development. Contracts are replaced in place until the first stable
          release, and there is no upgrade path from earlier builds. APIs, package names, and wire
          formats will change without notice.
        </p>

        <section className="site-section" id="what-it-is" aria-labelledby="what-it-is-title">
          <h2 id="what-it-is-title">What it is</h2>
          <p>
            Brain is a minimal, blazingly fast agent runtime. Build your own AI-native apps, with
            tools that run anywhere from a client browser to a server sandbox. Run any agentloop,
            from pi to codex. Deploy flexibly as a Docker image or an embedded Rust crate. Secure
            by design, with Wasm-isolated agentloop and tool execution. Scale easily with minimal
            memory overhead. Instant observability with real-time events — and the packages we
            ship use the same interface you would, so nothing built in gets a shortcut.
          </p>
          <p>
            The name comes from Anthropic&apos;s split of{" "}
            <a href="https://www.anthropic.com/engineering/managed-agents">
              the brain from the hands
            </a>
            . Brain is the brain: it decides. Environments are the hands — a sandbox, a browser,
            your backend, someone&apos;s laptop — where the work actually happens. The
            small-and-extensible shape follows{" "}
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
            the numbers can be re-run rather than trusted.
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
                  <td>25 ms</td>
                  <td>51 ms</td>
                  <td>1049 ms</td>
                  <td>1257 ms</td>
                </tr>
                <tr>
                  <th scope="row">Time to first token</th>
                  <td>≤25 ms</td>
                  <td>9.6 ms</td>
                  <td>48.6 ms</td>
                  <td>874.4 ms</td>
                </tr>
                <tr>
                  <th scope="row">New session</th>
                  <td>0.6 ms</td>
                  <td>1.9 ms</td>
                  <td>0.7 ms</td>
                  <td>3.7 ms</td>
                </tr>
                <tr>
                  <th scope="row">Cold start</th>
                  <td>25 ms</td>
                  <td>10 ms</td>
                  <td>2.5 s</td>
                  <td>5.98 s</td>
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
            Brain&apos;s first-token figure is an upper bound — under an instant scripted model the
            turn completes before a delta reaches the stream. Cold-start figures other than
            Brain&apos;s come from each project&apos;s own published numbers. The full charts,
            including OpenFang, CrewAI, and AutoGen, are in the{" "}
            <a href={`${brainRepoUrl}#benchmarks`}>repository README</a>.
          </p>
        </section>

        <section className="site-section" id="architecture" aria-labelledby="architecture-title">
          <h2 id="architecture-title">Architecture</h2>
          <p>Brain owns the session. Four kinds of component plug into it.</p>
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
          <p>Drive a session from TypeScript:</p>
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
