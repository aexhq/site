import type { Metadata } from "next";
import Link from "next/link";
import { CapabilityDemo } from "./components/CapabilityDemo";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { WaitlistForm } from "./components/WaitlistForm";

export const metadata: Metadata = {
  title: "Agent backend for AI apps",
  description:
    "A simple, elegant, session-oriented SDK for running agent workloads with tools and structured output.",
};

const capabilities = [
  {
    index: "01",
    title: "Long-lived by design",
    body: "Keep sending work to the same durable session. Conversation, tool history, and recovery state stay together.",
  },
  {
    index: "02",
    title: "A real computer",
    body: "Give the agent an isolated workspace with shell and file tools without building a sandbox control plane.",
  },
  {
    index: "03",
    title: "Tools you own",
    body: "Bundle a typed function beside official Aex tools. The exact capability set is sealed when the session starts.",
  },
  {
    index: "04",
    title: "Structured by default",
    body: "Put a Zod schema on send() and receive validated application data, with one bounded repair when needed.",
  },
  {
    index: "05",
    title: "Parallel when useful",
    body: "Let one turn delegate bounded work to child agents while the session engine keeps ownership and cancellation clear.",
  },
  {
    index: "06",
    title: "Bring your model",
    body: "Use your provider key directly or route through Vercel AI Gateway. Aex adds no markup to model usage.",
  },
] as const;

const benchmarks = [
  { value: "1.4 ms", label: "p50 first visible byte" },
  { value: "2,002", label: "turns/s at 64 sessions" },
  { value: "21–31 KiB", label: "private memory per session" },
  { value: "≈3,430/s", label: "tool calls in the loop" },
] as const;

const comparisons = [
  {
    name: "Aex",
    href: "https://github.com/aexhq/aex",
    unit: "Session",
    state: "Conversation, context, and turn journal",
    computer: "Versioned managed Hand",
  },
  {
    name: "Claude Managed Agents",
    href: "https://www.anthropic.com/engineering/managed-agents",
    unit: "Session",
    state: "Durable session log",
    computer: "Decoupled hands and sandboxes",
  },
  {
    name: "LangSmith Deployment",
    href: "https://docs.langchain.com/langsmith/deployment",
    unit: "Thread + run",
    state: "Checkpoints, thread state, and store",
    computer: "Separate sandbox API",
  },
  {
    name: "E2B",
    href: "https://e2b.dev/docs/sandbox",
    unit: "Sandbox",
    state: "Sandbox filesystem and memory",
    computer: "Core product boundary",
  },
  {
    name: "Daytona",
    href: "https://www.daytona.io/docs/en/persistence/",
    unit: "Sandbox",
    state: "Sandbox filesystem and memory",
    computer: "Core product boundary",
  },
] as const;

const prices = [
  {
    meter: "Active 1 GB computer",
    rate: "$0.12 / hour",
    detail: "0.5 vCPU + 1 GB memory, billed per second",
  },
  {
    meter: "Suspended computer",
    rate: "$0.10 / GB-month",
    detail: "State kept without active compute",
  },
  {
    meter: "Workspace storage",
    rate: "$0.03 / GB-month",
    detail: "Synced working files and persisted artifacts",
  },
  {
    meter: "Web search",
    rate: "$0.003 / query",
    detail: "Only when the managed search tool is used",
  },
  {
    meter: "Models",
    rate: "Bring your own key",
    detail: "No Aex model markup",
  },
] as const;

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <article className="site-overview landing-shell">
        <header className="landing-hero">
          <p className="site-kicker">Aex / Alpha</p>
          <h1>Agent backend for AI apps</h1>
          <p>
            A simple, elegant, session-oriented SDK for running your agent
            workloads. Start a session with your model and tools, give it work,
            and get back structured data.
          </p>
          <nav className="hero-actions" aria-label="Get started">
            <a className="button button-primary" href="https://github.com/aexhq/aex/blob/main/docs/quickstart.md">
              Read the docs <span aria-hidden="true">↗</span>
            </a>
            <Link className="button" href="/dashboard">
              Dashboard <span aria-hidden="true">→</span>
            </Link>
            <a className="button button-link" href="https://github.com/aexhq">
              GitHub <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </header>

        <CapabilityDemo />

        <section className="landing-section" id="product" aria-labelledby="product-title">
          <div className="section-heading">
            <p className="section-index">02 / Product</p>
            <div>
              <h2 id="product-title">The infrastructure between a prompt and a finished job.</h2>
              <p>Small primitives that compose without turning your application into an orchestration framework.</p>
            </div>
          </div>
          <div className="capability-grid">
            {capabilities.map((capability) => (
              <article key={capability.title}>
                <span>{capability.index}</span>
                <h3>{capability.title}</h3>
                <p>{capability.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section" id="benchmarks" aria-labelledby="benchmarks-title">
          <div className="section-heading">
            <p className="section-index">03 / Benchmarks</p>
            <div>
              <h2 id="benchmarks-title">A light engine leaves the model room to work.</h2>
              <p>Measured engine overhead, published with a reproducible harness instead of blended into model latency.</p>
            </div>
          </div>
          <div className="benchmark-grid">
            {benchmarks.map((benchmark) => (
              <article key={benchmark.label}>
                <strong>{benchmark.value}</strong>
                <span>{benchmark.label}</span>
              </article>
            ))}
          </div>
          <p className="benchmark-note">
            Release build on a 4-vCPU Graviton3 c7g.xlarge, 18 August 2026,
            using an instant scripted provider and in-process echo Hand. These
            numbers measure Aex Brain—not a model or remote sandbox.{" "}
            <a href="https://github.com/aexhq/brain/blob/main/BENCHMARKS.md">Methodology and reproduction steps</a>.
          </p>

          <div className="comparison-block">
            <div>
              <h3>How the closest products draw the boundary</h3>
              <p>
                Vendor latency tests measure different work. This comparison
                uses each product&apos;s primary public abstraction instead of
                presenting a false speed league table.
              </p>
            </div>
            <div className="table-scroll">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>Platform</th>
                    <th>Primary unit</th>
                    <th>Durable state</th>
                    <th>Computer boundary</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((comparison) => (
                    <tr key={comparison.name}>
                      <th scope="row"><a href={comparison.href}>{comparison.name}</a></th>
                      <td>{comparison.unit}</td>
                      <td>{comparison.state}</td>
                      <td>{comparison.computer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="site-small">Product boundaries checked against vendor documentation on 20 August 2026.</p>
          </div>
        </section>

        <section className="landing-section" id="architecture" aria-labelledby="architecture-title">
          <div className="section-heading">
            <p className="section-index">04 / Architecture</p>
            <div>
              <h2 id="architecture-title">The brain remembers. The hands do the work.</h2>
              <p>
                Inspired by Anthropic&apos;s{" "}
                <a href="https://www.anthropic.com/engineering/managed-agents">
                  managed-agent architecture
                </a>, Aex keeps durable reasoning state separate from replaceable execution.
              </p>
            </div>
          </div>

          <div className="architecture-map" aria-label="Aex Brain and Hands architecture">
            <article className="architecture-node architecture-app">
              <span>Your application</span>
              <strong>Aex SDK</strong>
              <p>Creates sessions, sends work, receives events and typed results.</p>
            </article>
            <div className="architecture-connector" aria-hidden="true">
              <span>session API</span>
            </div>
            <article className="architecture-node architecture-brain">
              <span>Brain</span>
              <strong>Durable agent state</strong>
              <p>Model loop, context, journal, recovery, authorization, and child-session graph.</p>
            </article>
            <div className="architecture-connector" aria-hidden="true">
              <span>versioned operations</span>
            </div>
            <article className="architecture-node architecture-hands">
              <span>Hands</span>
              <strong>Replaceable execution</strong>
              <p>Isolated tools, processes, files, progress, cancellation, and workspace lifecycle.</p>
            </article>
          </div>

          <div className="architecture-outcomes">
            <p><span>01</span> A failed worker does not become lost conversation state.</p>
            <p><span>02</span> Brain never needs sandbox placement or infrastructure credentials.</p>
            <p><span>03</span> Hands never decides what the agent remembers or is allowed to do.</p>
          </div>
        </section>

        <section className="landing-section" id="pricing" aria-labelledby="pricing-title">
          <div className="section-heading">
            <p className="section-index">05 / Pricing</p>
            <div>
              <h2 id="pricing-title">Pay for the work, not another seat.</h2>
              <p>No subscription and no model markup. Alpha credit is prepaid, metered, and unused credit is refundable.</p>
            </div>
          </div>
          <div className="table-scroll">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Meter</th>
                  <th>Rate</th>
                  <th>How it works</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((price) => (
                  <tr key={price.meter}>
                    <th scope="row">{price.meter}</th>
                    <td>{price.rate}</td>
                    <td>{price.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="site-small">
            The 1 GB active rate combines the public memory and vCPU meters.
            Larger shapes scale from the same components. See the{" "}
            <a href="https://api.aex.dev/v1/rates">live rate card</a> for machine-readable prices.
            The alpha has no uptime SLA.
          </p>
        </section>

        <section className="alpha-panel" id="alpha" aria-labelledby="alpha-title">
          <div>
            <p className="section-index">06 / Early access</p>
            <h2 id="alpha-title">Join the alpha</h2>
            <p>
              Help shape Aex before launch. Alpha members receive discounted
              Aex platform rates for the first six months after launch. We&apos;ll
              publish the exact discount before paid access begins.
            </p>
          </div>
          <div>
            <WaitlistForm />
            <p className="site-small">
              Already invited?{" "}
              <Link href="/dashboard?mode=invite">Finish setup in the dashboard</Link>.
            </p>
          </div>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}
