import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { WaitlistForm } from "./components/WaitlistForm";

export const metadata: Metadata = {
  title: "The session backend for AI apps",
  description:
    "Add an agent to your product with one API. AEX keeps its model, conversation, tools, and Linux workspace together.",
};

const product = [
  {
    title: "One session",
    body: "The conversation, model calls, tools, files, and artifacts share one durable identity. Your application has one thing to create, observe, and resume.",
  },
  {
    title: "A Linux workspace",
    body: "Each session can work in an isolated machine. Compute can stop between turns while the workspace and session state stay in place.",
  },
  {
    title: "Your model key",
    body: "Use OpenAI or Anthropic with your own provider key. AEX encrypts it for the session and adds no markup to model usage.",
  },
  {
    title: "Your app stays yours",
    body: "Keep your frontend, database, authentication, and deployment. Call AEX only for the agent runtime behind your product.",
  },
];

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <article className="site-overview prose-shell">
        <p className="site-kicker">Founding beta · eu-west-1</p>

        <header className="site-intro">
          <h1>The session backend for AI apps.</h1>
          <p>
            Add an agent to your product with one API. AEX keeps its model,
            conversation, tools, and Linux workspace together, so it can stop
            and resume without losing its place.
          </p>
        </header>

        <nav className="site-links" aria-label="Get started">
          <a href="https://github.com/aexhq/aex/blob/main/docs/quickstart.md">
            Read the quickstart
          </a>
          <Link href="/dashboard">Open the dashboard</Link>
        </nav>

        <dl className="site-feature-list" id="product">
          {product.map((feature) => (
            <div className="site-feature" key={feature.title}>
              <dt>{feature.title}</dt>
              <dd>{feature.body}</dd>
            </div>
          ))}
        </dl>

        <section className="site-section" id="pricing" aria-labelledby="pricing-title">
          <h2 id="pricing-title">Pricing</h2>
          <p>
            There is no subscription and no model markup. Founding beta credit
            is prepaid and unused credit is refundable.
          </p>
          <dl className="site-definition-list">
            <div><dt>Active 1 GB session</dt><dd>$0.12 / hour</dd></div>
            <div><dt>Durable workspace</dt><dd>$0.03 / GB-month</dd></div>
            <div><dt>Models</dt><dd>Bring your own key</dd></div>
            <div><dt>Top-up</dt><dd>$10–$1,000 USD</dd></div>
          </dl>
          <p className="site-small">
            The beta has one session shape and no uptime SLA. See the{" "}
            <a href="https://api.aex.dev/v1/rates">live rate card</a> for the
            machine-readable source of truth.
          </p>
        </section>

        <section className="site-section" id="beta" aria-labelledby="beta-title">
          <h2 id="beta-title">Join the founding beta</h2>
          <p>
            Access opens in small batches while the production service settles.
            Joining the list is not a paid registration and we will only use
            your email to manage beta access.
          </p>
          <WaitlistForm />
          <p className="site-small">
            Already invited? <Link href="/dashboard?mode=invite">Finish setup in the dashboard</Link>.
          </p>
        </section>
      </article>

      <SiteFooter />
    </main>
  );
}
