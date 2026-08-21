import type { Metadata } from "next";
import Link from "next/link";
import { CapabilityDemo } from "./components/CapabilityDemo";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { WaitlistForm } from "./components/WaitlistForm";
import { siteDescription, siteHeadline } from "./site-copy";

export const metadata: Metadata = {
  title: siteHeadline,
  description: siteDescription,
};

const prices = [
  {
    item: "Active computer",
    price: "$0.12 / hour",
    details: "0.5 vCPU + 1 GiB memory. Billed per second.",
  },
  {
    item: "Storage",
    price: "$0.03 / GB-month",
    details: "Explicitly saved session objects.",
  },
  {
    item: "Web search",
    price: "$0.003 / query",
    details: "You pay only when you use it.",
  },
  {
    item: "Models",
    price: "Bring your own key",
    details: "Aex adds no markup.",
  },
] as const;

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <article className="site-overview prose-shell">
        <header className="site-intro">
          <h1>{siteHeadline}</h1>
          <p>
            High-performance, reliable, and simple infrastructure for running AI
            workloads. Start a session with your models and tools, give it work,
            and get back structured data.
          </p>
        </header>

        <nav className="site-links" aria-label="Get started">
          <Link href="/docs">Docs</Link>
          <Link href="/dashboard">Dashboard</Link>
          <a href="https://github.com/aexhq/aex">GitHub</a>
          <a href="https://discord.gg/Qk2YnHMHVb">Discord</a>
        </nav>

        <CapabilityDemo />

        <section className="site-section" id="architecture" aria-labelledby="architecture-title">
          <h2 id="architecture-title">Architecture</h2>
          <p>
            Aex keeps durable session state separate from the computers that run
            tools, so each layer can scale and recover independently. The design
            is inspired by Anthropic&apos;s{" "}
            <a href="https://www.anthropic.com/engineering/managed-agents">
              brain and hands pattern
            </a>.
          </p>

          <figure className="architecture-diagram">
            <figcaption className="sr-only">
              Your app sends work to the Brain. The Brain persists its journal
              in a database and exchanges tool operations with Hands. Hands run
              those operations in a sandbox, which can copy files to durable
              storage explicitly.
            </figcaption>
            <div className="architecture-grid">
              <article className="architecture-card architecture-database">
                <h3>Database</h3>
                <p>Persists durable session journals.</p>
              </article>
              <div className="architecture-arrow architecture-database-link" aria-hidden="true">
                ↑
              </div>

              <article className="architecture-card architecture-storage">
                <h3>Storage</h3>
                <p>Keeps explicitly saved session objects.</p>
              </article>
              <div className="architecture-arrow architecture-storage-link" aria-hidden="true">
                ↑
              </div>

              <article className="architecture-card architecture-app">
                <h3>Your app</h3>
                <p>Starts sessions and consumes typed results.</p>
              </article>
              <div className="architecture-arrow architecture-app-link" aria-hidden="true">
                →
              </div>

              <article className="architecture-card architecture-brain">
                <h3>Brain</h3>
                <p>Owns the model loop, context, and recovery.</p>
              </article>
              <div className="architecture-arrow architecture-brain-link" aria-hidden="true">
                ↔
              </div>

              <article className="architecture-card architecture-hands">
                <h3>Hands</h3>
                <p>Runs typed tool operations for the Brain.</p>
              </article>
              <div className="architecture-arrow architecture-hands-link" aria-hidden="true">
                ↔
              </div>

              <article className="architecture-card architecture-sandbox">
                <h3>Sandbox</h3>
                <p>Isolates processes, files, secrets, and network.</p>
              </article>
            </div>
          </figure>
        </section>

        <section className="site-section" id="features" aria-labelledby="features-title">
          <h2 id="features-title">Features</h2>
          <p>
            Durable orchestration, replaceable execution, and isolated compute
            are separate pieces of the same session.
          </p>

          <div className="feature-groups">
            <section className="feature-group" aria-labelledby="brain-features-title">
              <h3 id="brain-features-title">Brain</h3>
              <ul>
                <li>
                  Models from OpenAI, Anthropic, OpenRouter, and more.
                </li>
                <li>Automatic context management and compaction.</li>
                <li>Durable child sessions for delegated work.</li>
                <li>Cache-stable prompts for lower latency.</li>
                <li>Append-only recovery across process restarts.</li>
              </ul>
            </section>

            <section className="feature-group" aria-labelledby="hands-features-title">
              <h3 id="hands-features-title">Hands</h3>
              <ul>
                <li>Runs typed tools, commands, and files.</li>
                <li>Streams progress and cancellation.</li>
                <li>Durable receipts make retries and recovery explicit.</li>
                <li>Supports managed and customer-hosted tools.</li>
              </ul>
            </section>

            <section className="feature-group" aria-labelledby="sandbox-features-title">
              <h3 id="sandbox-features-title">Sandbox</h3>
              <ul>
                <li>A lazy workspace plus isolated extras.</li>
                <li>Session-scoped secrets and network policy.</li>
                <li>Explicit copies to durable storage.</li>
                <li>Per-second compute.</li>
              </ul>
            </section>
          </div>
        </section>

        <section className="site-section" id="pricing" aria-labelledby="pricing-title">
          <h2 id="pricing-title">Pricing</h2>
          <p>No subscription or model markup. Unused alpha credit is refundable.</p>
          <div className="table-scroll">
            <table className="pricing-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((price) => (
                  <tr key={price.item}>
                    <th scope="row">{price.item}</th>
                    <td>{price.price}</td>
                    <td>{price.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="site-small">
            See the <a href="https://api.aex.dev/v1/rates">live rate card</a> for current pricing.
            The alpha has no uptime SLA.
          </p>
        </section>

        <section className="site-section alpha-section" id="alpha" aria-labelledby="alpha-title">
          <h2 id="alpha-title">Join the alpha</h2>
          <p>
            Alpha members get discounted platform rates for the first six
            months after launch. We&apos;ll confirm the discount before billing starts.
          </p>
          <WaitlistForm />
          <p className="site-small">
            Already invited?{" "}
            <Link href="/dashboard?mode=invite">Finish setup in the dashboard</Link>.
          </p>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}
