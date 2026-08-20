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
    price: "From $0.12 / hour",
    details: "Starts at 0.5 vCPU + 1 GB memory. Billed per second.",
  },
  {
    item: "Storage",
    price: "$0.03 / GB-month",
    details: "Working files and saved artifacts.",
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
            A simple, intuitive, session-oriented SDK for running AI workloads.
            Start a session with your model and tools, give it work, and get
            structured data.
          </p>
        </header>

        <nav className="site-links" aria-label="Get started">
          <a href="https://github.com/aexhq/aex/blob/main/docs/quickstart.md">Docs</a>
          <Link href="/dashboard">Dashboard</Link>
          <a href="https://github.com/aexhq">GitHub</a>
        </nav>

        <CapabilityDemo />

        <section className="site-section" id="architecture" aria-labelledby="architecture-title">
          <h2 id="architecture-title">Architecture</h2>
          <p>
            Aex keeps session state separate from the computer that runs tools.
            The design follows Anthropic&apos;s{" "}
            <a href="https://www.anthropic.com/engineering/managed-agents">
              brain and hands pattern
            </a>.
          </p>
          <div className="markdown-block">
            <h3>Brain</h3>
            <p>
              The Brain keeps the model loop and session state, including
              context, recovery, permissions, and child sessions.
            </p>
            <h3>Hands</h3>
            <p>
              Hands run tools, processes, and files in isolated workspaces.
              You can replace a Hand without losing the session.
            </p>
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
