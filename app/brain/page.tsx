import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { brainRepoUrl } from "../site-copy";

const tagline = "Run AI agents. Keep their conversations and progress.";
export const metadata: Metadata = { title: "Brain", description: tagline };

const runExample = `docker run --rm -p 127.0.0.1:8080:8080 \\
  -e BRAIN_LISTEN=0.0.0.0:8080 -e BRAIN_API_TOKEN=quickstart \\
  -v brain-data:/var/lib/brain ghcr.io/aexhq/brain:latest`;
const sessionExample = `import { Brain, brainEnv, tool } from "@aexhq/brain";
import { pi } from "@aexhq/agentloop-pi";
import { z } from "zod";

const lookupOrder = tool({
  name: "lookup_order",
  description: "Look up an order by id.",
  input: z.object({ id: z.string() }),
  run: ({ id }, ctx) => ctx.finish({ id, status: "shipped" }),
});

const brain = new Brain({ baseUrl: "http://127.0.0.1:8080", token: "quickstart" });
try {
  const session = await brain.sessions.create({
    model: { provider: "openai", name: "gpt-5-mini", apiKey: process.env.OPENAI_API_KEY },
    agentloop: pi({ env: brainEnv({ name: "brain" }) }),
    tools: [lookupOrder()],
  });
  try {
    await session.send("Look up order A-1001. Has it shipped?");
    console.log(JSON.stringify(await session.transcript(), null, 2));
    console.log("Session:", session.id);
  } finally {
    await session.end();
  }
} finally {
  await brain.close();
}`;

export default function BrainPage() {
  return (
    <main>
      <SiteHeader><Link href="/brain/docs">Docs</Link></SiteHeader>
      <article className="site-overview prose-shell">
        <header className="site-intro">
          <h1>Brain</h1>
          <p>{tagline}</p>
        </header>
        <nav className="site-links" aria-label="Brain">
          <Link href="/brain/docs/quickstart">Quickstart</Link>
          <Link href="/brain/docs">Docs</Link>
          <a href={brainRepoUrl}>GitHub</a>
        </nav>

        <section className="site-section" id="what-it-is" aria-labelledby="what-it-is-title">
          <h2 id="what-it-is-title">What is Brain?</h2>
          <p>Brain is an open-source server for AI agents. Connect your model and tools, send a
            message, and read the answer. Brain saves the conversation, tool results and progress
            so your app can return to them later.</p>
          <p>Run it on your own infrastructure, or use <Link href="/docs">Aex for hosting</Link>.</p>
        </section>

        <section className="site-section" aria-labelledby="features-title">
          <h2 id="features-title">What you can do</h2>
          <dl className="site-feature-list">
            <div className="site-feature"><dt>Connect your application</dt>
              <dd>Give the agent functions that look up orders, search data or call your APIs.</dd></div>
            <div className="site-feature"><dt>Follow the work</dt>
              <dd>Stream output, inspect tool results and read saved history after reconnecting.</dd></div>
            <div className="site-feature"><dt>Choose the behavior</dt>
              <dd>Bring your model key. Use Pi or Codex loops, or write your own logic and tools.</dd></div>
          </dl>
        </section>

        <section className="site-section" id="getting-started" aria-labelledby="getting-started-title">
          <h2 id="getting-started-title">Try an order lookup</h2>
          <p>You need Docker, Node.js 22 or newer, and an OpenAI API key. Start Brain:</p>
          <pre className="site-code" aria-label="Run Brain with Docker"><code>{runExample}</code></pre>
          <p>In another terminal, install the packages:</p>
          <pre className="site-code" aria-label="Install the Brain packages"><code>npm install @aexhq/brain@0.30.0 @aexhq/agentloop-pi@7.1.0 zod@4</code></pre>
          <p>Set <code>OPENAI_API_KEY</code> in your environment and save this as <code>order.mjs</code>:</p>
          <pre className="site-code" aria-label="Create a Brain session"><code>{sessionExample}</code></pre>
          <p>Run <code>node order.mjs</code>. The transcript includes the lookup result and an answer
            that order A-1001 has shipped. Replace the sample lookup with your own data.</p>
          <p>The lookup runs in your app, so keep that process connected while its tools are needed.
            The <Link href="/brain/docs/quickstart">full quickstart</Link> explains setup and the next steps.</p>
        </section>

        <section className="site-section" aria-labelledby="build-title">
          <h2 id="build-title">Build your agent</h2>
          <ul>
            <li><Link href="/brain/docs/concepts/sessions">Send messages, stream output and read history</Link></li>
            <li><Link href="/brain/docs/guides/write-a-tool">Write a tool in JavaScript, TypeScript, Rust or Python</Link></li>
            <li><Link href="/brain/docs/guides/write-a-loop">Customize the agent loop</Link></li>
            <li><Link href="/brain/docs/concepts/environment">Choose a browser or sandbox environment</Link></li>
          </ul>
        </section>

        <section className="site-section" aria-labelledby="why-title">
          <h2 id="why-title">Why Brain?</h2>
          <p>An agent needs more than a model call. Conversations need history, tools need results,
            and your app needs to know when work stops. Brain handles that session lifecycle while
            you choose the model, tools and agent behavior.</p>
          <p>Brain is in early preview. APIs may change before 1.0. Saved history survives a server
            restart; interrupted work is reported as failed and is not automatically retried.</p>
          <p>MIT licensed. Read the <Link href="/brain/docs/reference/api">API reference</Link>,
            <Link href="/brain/docs/reference/benchmarks"> benchmarks</Link>, or
            <a href={`${brainRepoUrl}/blob/main/CONTRIBUTING.md`}> contributor guide</a>.</p>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
