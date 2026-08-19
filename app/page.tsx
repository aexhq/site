import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { WaitlistForm } from "./components/WaitlistForm";

export const metadata: Metadata = {
  title: "The session backend for AI apps",
  description:
    "Start a durable AI session, give it work, and get back text or validated data.",
};

const product = [
  {
    title: "Sessions",
    body: "One durable identity holds the conversation, model, tools, and working files. Send another message whenever you need to continue.",
  },
  {
    title: "Tools",
    body: "Every session starts with a computer and a small, useful toolset. Additional capabilities compose into the same session model over time.",
  },
  {
    title: "Output",
    body: "Use send() for text or output() for data validated against your Zod schema. Schema handling and one bounded repair stay outside the session conversation.",
  },
];

const example = `import { Aex } from "@aexhq/sdk";
import { z } from "zod";

const aex = new Aex({ apiKey: "aex_sk_..." });
const session = await aex.sessions.create({
  model: {
    provider: "anthropic",
    name: "claude-sonnet-5",
    apiKey: "sk-ant-...",
  },
});

const result = await session.output(
  z.object({ summary: z.string(), nextSteps: z.array(z.string()) }),
  "Review this repository.",
);`;

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <article className="site-overview prose-shell">
        <p className="site-kicker">Alpha</p>

        <header className="site-intro">
          <h1>The session backend for AI apps.</h1>
          <p>
            Start a session. Give it work. Get back text or validated data.
            Aex keeps the context and working files, and manages the computer
            for you.
          </p>
        </header>

        <nav className="site-links" aria-label="Get started">
          <a href="https://github.com/aexhq/aex/blob/main/docs/quickstart.md">
            Read the quickstart
          </a>
          <Link href="/dashboard">Open the dashboard</Link>
        </nav>

        <pre className="site-code" aria-label="Aex SDK example">
          <code>{example}</code>
        </pre>

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
            No subscription and no model markup. Alpha credit is prepaid and
            unused credit is refundable.
          </p>
          <dl className="site-definition-list">
            <div><dt>Active computer</dt><dd>$0.12 / hour</dd></div>
            <div><dt>Stored working files</dt><dd>$0.03 / GB-month</dd></div>
            <div><dt>Web search</dt><dd>$0.003 / query</dd></div>
            <div><dt>Models</dt><dd>Bring your own key</dd></div>
          </dl>
          <p className="site-small">
            See the <a href="https://api.aex.dev/v1/rates">live rate card</a>{" "}
            for complete metering details. The alpha has no uptime SLA.
          </p>
        </section>

        <section className="site-section" id="alpha" aria-labelledby="alpha-title">
          <h2 id="alpha-title">Join the alpha</h2>
          <p>
            Access opens in small batches while the production service settles.
            Joining the list is not a paid registration and we will only use
            your email to manage alpha access.
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
