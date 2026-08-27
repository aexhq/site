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
    item: "Models",
    price: "Provider cost",
    details: "Exact AI Gateway receipt, passed through without Aex markup.",
  },
  {
    item: "Aex alpha",
    price: "$0",
    details: "No platform subscription or compute surcharge during alpha.",
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
            Aex keeps hosted account policy separate from Brain&apos;s execution kernel.
            Every Agentloop uses one universal Component contract, models are remote
            bindings, and Tool implementations execute in remote Environments.
          </p>

          <figure className="architecture-diagram">
            <figcaption className="sr-only">
              Your app uses the Aex control plane to reach Brain. Brain journals each
              session to disk, runs an Agentloop Component, calls a remote model, and
              sends Tool operations to their bound Environment.
            </figcaption>
            <div className="architecture-grid">
              <article className="architecture-card architecture-database">
                <h3>Journal</h3>
                <p>Records ordered session events on disk.</p>
              </article>
              <div className="architecture-arrow architecture-database-link" aria-hidden="true">
                ↑
              </div>

              <article className="architecture-card architecture-storage">
                <h3>Telemetry</h3>
                <p>Publishes bounded logs, metrics, and live events.</p>
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
                <h3>Brain Server</h3>
                <p>Owns live context, journal order, and execution.</p>
              </article>
              <div className="architecture-arrow architecture-brain-link" aria-hidden="true">
                ↔
              </div>

              <article className="architecture-card architecture-extensions">
                <h3>Agentloop</h3>
                <p>Runs universal capability-pure Component policy.</p>
              </article>
              <div className="architecture-arrow architecture-extensions-link" aria-hidden="true">
                ↔
              </div>

              <article className="architecture-card architecture-environment">
                <h3>Environment</h3>
                <p>Owns tool runtime, files, isolation, and lifecycle.</p>
              </article>
            </div>
          </figure>
        </section>

        <section className="site-section" id="features" aria-labelledby="features-title">
          <h2 id="features-title">Features</h2>
          <p>
            Session execution, extension policy, and remote capabilities stay
            independently replaceable.
          </p>

          <div className="feature-groups">
            <section className="feature-group" aria-labelledby="agentloop-extension-features-title">
              <h3 id="agentloop-extension-features-title">Agentloop extensions</h3>
              <ul>
                <li>Explicit agent-loop policy such as Pi or Codex.</li>
                <li>Automatic context management and compaction.</li>
                <li>Cache-stable prompts for lower latency.</li>
              </ul>
            </section>

            <section className="feature-group" aria-labelledby="model-extension-features-title">
              <h3 id="model-extension-features-title">Model bindings</h3>
              <ul>
                <li>Brain calls one OpenAI-compatible remote gateway.</li>
                <li>Provider streaming and exact usage receipts become session events.</li>
                <li>Credentials remain server-side runtime bindings.</li>
              </ul>
            </section>

            <section className="feature-group" aria-labelledby="tool-extension-features-title">
              <h3 id="tool-extension-features-title">Tool definitions</h3>
              <ul>
                <li>Typed inputs and outputs fixed at session creation.</li>
                <li>Definitions are model presentation, separate from implementations.</li>
                <li>Every Tool binds explicitly to one remote Environment.</li>
              </ul>
            </section>

            <section className="feature-group" aria-labelledby="environment-extension-features-title">
              <h3 id="environment-extension-features-title">Environment extensions</h3>
              <ul>
                <li>Adapters manage setup, execution, cancellation, and teardown.</li>
                <li>Complete sealed bindings make routing process-independent.</li>
                <li>Several sessions can share one logical Environment.</li>
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
            Alpha members prepay only the exact model-gateway cost. We&apos;ll publish
            and communicate any future platform pricing before it takes effect.
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
