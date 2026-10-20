import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { brainRepoUrl } from "../site-copy";

const tagline = "Build agents your way. Run their tools wherever the work lives.";
const description = "Brain is an open-source agent runtime. You choose the agent loop, the model, the tools and where each one runs. Brain saves the session and gives your application one API to drive it.";
export const metadata: Metadata = { title: "Brain", description };

export default function BrainPage() {
  return (
    <main>
      <SiteHeader><Link href="/brain/docs">Docs</Link></SiteHeader>
      <article className="site-overview prose-shell">
        <header className="site-intro">
          <h1>Brain</h1>
          <p>{tagline}</p>
        </header>
        <section className="site-section" aria-label="About Brain">
          <p>{description}</p>
          <p>Picture a support agent that looks up an order in your backend, checks a delivery page
            in a browser and updates a ticket. Each tool runs where it can reach what it needs.</p>
        </section>
        <nav className="site-links" aria-label="Brain">
          <Link href="/brain/docs/quickstart">Run your first agent</Link>
          <Link href="/brain/docs">Docs</Link>
          <a href={brainRepoUrl}>GitHub</a>
        </nav>

        <section className="site-section" aria-labelledby="features-title">
          <h2 id="features-title">Why Brain</h2>
          <dl className="site-feature-list">
            <div className="site-feature"><dt>Own the agent&apos;s behavior</dt>
              <dd>Start with a ready-made loop, or write your own context management, model calls
                and tool sequencing. Official loops use the same public interfaces as yours.</dd></div>
            <div className="site-feature"><dt>Run each tool where it belongs</dt>
              <dd>Your app&apos;s process, the user&apos;s browser tab, an HTTPS backend or a remote
                sandbox. Choose per tool when you create a session.</dd></div>
            <div className="site-feature"><dt>Drive it from your app</dt>
              <dd>Send messages, stream progress, submit background work and collect results later
                through one session API. Host it yourself, or let <Link href="/docs">Aex host it</Link>.</dd></div>
          </dl>
        </section>

        <section className="site-section" id="getting-started" aria-labelledby="getting-started-title">
          <h2 id="getting-started-title">Try an order lookup</h2>
          <p>The <Link href="/brain/docs/quickstart">quickstart</Link> gives an agent a function from
            your app and asks whether an order has shipped. It includes the server command, matching
            package versions, a complete program and the expected result.</p>
          <p>You need Docker, Node.js 24 and an OpenAI API key, which is billed by OpenAI.
            Your app&apos;s functions run in your process, so keep it connected while the agent needs them.</p>
        </section>

        <section className="site-section" aria-labelledby="build-title">
          <h2 id="build-title">Keep building</h2>
          <ul>
            <li><Link href="/brain/docs/guides/sessions">Send messages, stream progress and collect results</Link></li>
            <li><Link href="/brain/docs/tools">Connect your app&apos;s functions as tools</Link></li>
            <li><Link href="/brain/docs/tools">Choose where tools run</Link></li>
            <li><Link href="/brain/docs/adapters/harness">Pick or write an agent loop</Link></li>
            <li><Link href="/brain/docs/reference/configuration">Configure a self-hosted server</Link></li>
          </ul>
        </section>

        <section className="site-section" aria-labelledby="status-title">
          <h2 id="status-title">Project status</h2>
          <p>Brain 2.1 provides native Pi, Codex and OpenCode harnesses. Saved history survives a
            server restart when storage is intact. Interrupted work requires an explicit decision before it is
            resumed or retried, and history can&apos;t restore lost browser or sandbox files.</p>
          <p>MIT licensed. Explore the <Link href="/brain/docs/api">API reference</Link>,
            <Link href="/brain/docs/architecture"> architecture</Link> or
            <a href={`${brainRepoUrl}/blob/main/CONTRIBUTING.md`}> contributor guide</a>.</p>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
