import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { brainRepoUrl, discordUrl } from "../site-copy";

const title = "Brain";
const tagline = "The durable session kernel for AI agents.";

export const metadata: Metadata = {
  title,
  description: tagline,
};

const features = [
  [
    "Sessions survive crashes",
    "Brain writes each step to disk before it runs. Kill the process mid-turn, start it again, and the session carries on from where it stopped.",
  ],
  [
    "Tools run wherever you want",
    "Brain never executes tool code. It calls whatever you bind the tool to — a sandbox VM, a browser tab, your own backend, the user's laptop.",
  ],
  [
    "Any language",
    "Agent loops compile to WebAssembly. Tools and environments talk to Brain over plain HTTP. One tool in Rust and another in Node, in the same session.",
  ],
  [
    "Any agent loop",
    "Pi, Codex-style, or your own. Brain is not an agent — it is what agents run on, and the loop we ship has no privileges yours doesn't.",
  ],
  [
    "Any model",
    "Anthropic and OpenAI wire formats, gateways, your own keys. The model is pinned when the session starts, so nothing swaps it out mid-conversation.",
  ],
  [
    "The loop is sealed off",
    "An agent loop gets an observation and returns a decision. No network, no filesystem, no secrets, no clock. Brain performs every effect.",
  ],
  [
    "More than one machine",
    "Environments are addressed by a stable name, so two sessions on two servers can share one workspace when you want them to.",
  ],
  [
    "Server or library",
    "Run the binary with a SQLite file, or embed the brain crate in your own Rust service and supply your own storage and transport.",
  ],
  [
    "Everything is an event log",
    "A session is an ordered, replayable log of what happened. Live streaming sits on top and drops events rather than stalling a turn.",
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
  ["Shipped", "Four-part kernel: agent loop, model, tool, environment"],
  ["Shipped", "WebAssembly agent loop pipeline"],
  ["Shipped", "SQLite log, crash recovery, writing to disk before acting"],
  ["Shipped", "HTTP/SSE session API and the TypeScript SDK"],
  ["Shipped", "Remote environment contract with the official adapters"],
  ["In progress", "Storage split apart from sandboxing"],
  ["In progress", "Benchmarks and the cross-session isolation test, rebuilt on the current kernel"],
  ["In progress", "A frozen v1 API and tagged releases"],
  ["Next", "MCP client"],
  ["Next", "Subagents"],
  ["Next", "File access and workspace sync"],
  ["Next", "Web search and fetch"],
  ["Next", "crates.io publication"],
  ["Later", "Sessions spread across machines, sharing environments"],
  ["Later", "Checkpoint and restore"],
  ["Later", "Custom images, scoped credentials, network metering"],
  ["Later", "Hosted Brain"],
] as const;

const installExample = `npm install @aexhq/brain @aexhq/brain-pi @aexhq/env-aws-microvm @aexhq/tools`;

const sessionExample = `import { Brain } from "@aexhq/brain";
import { awsMicroVm } from "@aexhq/env-aws-microvm";
import { pi } from "@aexhq/brain-pi";
import { bash, read, write } from "@aexhq/tools";

const brain = new Brain({ baseUrl: "http://127.0.0.1:8080" });
const workspace = awsMicroVm({ region: "eu-west-2" });

const session = await brain.sessions.create({
  model: {
    provider: "vercel-ai-gateway",
    name: "openai/gpt-5-mini",
    apiKey: process.env.VERCEL_AI_GATEWAY_API_KEY!,
  },
  brain: pi(),
  tools: [read().useIn(workspace), write().useIn(workspace), bash().useIn(workspace)],
});

await session.send("Read README.md and summarize it.");
for await (const event of session.events()) console.log(event);`;

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
          <Link href="/brain/docs/api">API Reference</Link>
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
            Brain runs agent sessions. It holds the conversation, decides what happens next, calls
            the model, hands out tool calls, and writes all of it to a durable log. That is the
            entire job.
          </p>
          <p>
            Four things plug in, and all four are yours to replace: the agent loop, the model, the
            tools, and the environment tools run in. The packages we ship use the same interface you
            would — nothing built in gets a shortcut.
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
            The benchmark measures the engine, not a model: it drives the real HTTP and SSE paths
            with an instant scripted provider and an in-process echo environment, so nothing here is
            model latency. The harness is being rebuilt against the current kernel, so the numbers
            below are not filled in yet.
          </p>
          <div className="table-scroll">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">&nbsp;</th>
                  <th scope="col">Brain</th>
                  <th scope="col">LangGraph Server</th>
                  <th scope="col">Temporal-backed loop</th>
                  <th scope="col">Plain in-process loop</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">First visible byte, one session</th>
                  <td>TBD</td>
                  <td>TBD</td>
                  <td>TBD</td>
                  <td>TBD</td>
                </tr>
                <tr>
                  <th scope="row">Complete text turn, one session</th>
                  <td>TBD</td>
                  <td>TBD</td>
                  <td>TBD</td>
                  <td>TBD</td>
                </tr>
                <tr>
                  <th scope="row">Throughput, 64 sessions</th>
                  <td>TBD</td>
                  <td>TBD</td>
                  <td>TBD</td>
                  <td>TBD</td>
                </tr>
                <tr>
                  <th scope="row">Memory per live session</th>
                  <td>TBD</td>
                  <td>TBD</td>
                  <td>TBD</td>
                  <td>TBD</td>
                </tr>
                <tr>
                  <th scope="row">Survives process death mid-turn</th>
                  <td>yes</td>
                  <td>TBD</td>
                  <td>TBD</td>
                  <td>no</td>
                </tr>
                <tr>
                  <th scope="row">Tool code isolated from the kernel</th>
                  <td>yes</td>
                  <td>TBD</td>
                  <td>TBD</td>
                  <td>no</td>
                </tr>
              </tbody>
            </table>
          </div>
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
