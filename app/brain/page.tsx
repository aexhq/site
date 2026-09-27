import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { brainRepoUrl } from "../site-copy";

const tagline = "Build your agent the way you want. Working across your systems";
const description = "Brain is an open-source agent runtime with pluggable loops, models, tools and execution environments. Use a ready-made loop or write your own context management and tool-calling logic. Run tools in your application, browser or remote environment, and interact with the agent through one API.";
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
          <p>For example, a support agent could use tools you provide to look up an order in your
            backend, check a delivery page in a browser and update a support ticket. Each tool
            runs where it can access the resources it needs.</p>
        </section>
        <nav className="site-links" aria-label="Brain">
          <Link href="/brain/docs/quickstart">Run your first agent</Link>
          <Link href="/brain/docs">Docs</Link>
          <a href={brainRepoUrl}>GitHub</a>
        </nav>

        <section className="site-section" aria-labelledby="features-title">
          <h2 id="features-title">Why use Brain?</h2>
          <dl className="site-feature-list">
            <div className="site-feature"><dt>Control the agent&apos;s behavior</dt>
              <dd>Use a ready-made loop or define the context, model calls and tool sequencing
                yourself. Official extensions use the same public interfaces as yours.</dd></div>
            <div className="site-feature"><dt>Connect work across your systems</dt>
              <dd>Connect application functions, HTTP services, browser actions and remote
                execution. Choose where the loop and each tool run when creating a session.</dd></div>
            <div className="site-feature"><dt>Run it as a service</dt>
              <dd>Your application sends work, follows progress and retrieves results through
                Brain&apos;s API. Run Brain yourself, or use <Link href="/docs">Aex for hosting</Link>.</dd></div>
          </dl>
        </section>

        <section className="site-section" id="getting-started" aria-labelledby="getting-started-title">
          <h2 id="getting-started-title">Try an order lookup</h2>
          <p>The <Link href="/brain/docs/quickstart">quickstart</Link> connects an agent to a function
            in your application. It includes the server command, compatible package versions,
            a complete program and the expected result.</p>
          <p>You need Docker, Node.js 22 or newer and an OpenAI API key. Model calls use your
            provider account. Application functions run in your process; keep it connected while
            those tools are needed.</p>
        </section>

        <section className="site-section" aria-labelledby="build-title">
          <h2 id="build-title">Build your application</h2>
          <ul>
            <li><Link href="/brain/docs/concepts/sessions">Send messages, follow progress and retrieve results</Link></li>
            <li><Link href="/brain/docs/guides/write-a-tool">Connect your application&apos;s tools</Link></li>
            <li><Link href="/brain/docs/concepts/environment">Choose where tools run</Link></li>
            <li><Link href="/brain/docs/concepts/agent-loop">Choose or customize an agent loop</Link></li>
            <li><Link href="/brain/docs/reference/configuration">Configure a self-hosted server</Link></li>
          </ul>
        </section>

        <section className="site-section" aria-labelledby="status-title">
          <h2 id="status-title">Project status</h2>
          <p>Brain is in early preview. APIs and compatibility may change before 1.0. Committed
            history survives a server restart with storage intact; interrupted work is reported
            as failed and is not automatically resumed or retried. History does not restore lost
            browser or sandbox files.</p>
          <p>MIT licensed. Read the <Link href="/brain/docs/reference/api">API reference</Link>,
            <Link href="/brain/docs/reference/benchmarks"> benchmarks</Link>, or
            <a href={`${brainRepoUrl}/blob/main/CONTRIBUTING.md`}> contributor guide</a>.</p>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
