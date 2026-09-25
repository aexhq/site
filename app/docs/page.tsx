import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

export const metadata = {
  title: "Get started",
  description: "Connect your model and tools, then run your first AI agent on Aex.",
};

const example = `import { Aex, brainEnv, tool } from "@aexhq/sdk";
import { pi } from "@aexhq/agentloop-pi";
import { z } from "zod";

const lookupOrder = tool({
  name: "lookup_order",
  description: "Look up an order by id.",
  input: z.object({ id: z.string() }),
  run: ({ id }, ctx) => ctx.finish({ id, status: "shipped" }),
});

const aex = new Aex({ apiKey: process.env.AEX_API_KEY });
try {
  const session = await aex.sessions.create({
    environmentLifecycle: { default: "automatic" },
    model: { provider: "openai", name: "gpt-4.1-mini", apiKey: process.env.OPENAI_API_KEY },
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
  await aex.close();
}`;

export default function Docs() {
  return (
    <main>
      <SiteHeader><Link href="/dashboard">Dashboard</Link></SiteHeader>
      <article className="site-overview prose-shell">
        <header className="site-intro">
          <h1>Run your first agent on Aex</h1>
          <p>Aex hosts the agent session while your application supplies a model key and tools.
            This example asks an agent to look up an order and prints its answer.</p>
        </header>

        <section className="site-section" aria-labelledby="keys-title">
          <h2 id="keys-title">1. Get your keys</h2>
          <p>You need Node.js 22 or newer and an OpenAI API key. Sign in to the
            <Link href="/dashboard"> dashboard</Link> and create an Aex API key. Save it when
            it appears; the secret is shown only once.</p>
          <pre className="site-code"><code>{`export AEX_API_KEY="your-aex-key"
export OPENAI_API_KEY="your-openai-key"`}</code></pre>
          <p>In PowerShell, use <code>$env:AEX_API_KEY = &quot;your-aex-key&quot;</code> and
            <code> $env:OPENAI_API_KEY = &quot;your-openai-key&quot;</code>. Keep keys on your server
            and out of source control. Your model provider bills calls separately.</p>
        </section>

        <section className="site-section" aria-labelledby="install-title">
          <h2 id="install-title">2. Install</h2>
          <pre className="site-code"><code>{`mkdir aex-example
cd aex-example
npm init -y
npm install @aexhq/sdk@0.82.0 @aexhq/agentloop-pi@7.2.0 zod@4`}</code></pre>
        </section>

        <section className="site-section" aria-labelledby="run-title">
          <h2 id="run-title">3. Add a tool and run the agent</h2>
          <p>Save this as <code>order.mjs</code>. The same API works in TypeScript.</p>
          <pre className="site-code"><code>{example}</code></pre>
          <pre className="site-code"><code>node order.mjs</code></pre>
          <p>The transcript includes the lookup result and an answer that order A-1001 has shipped.
            Replace the sample lookup with your own data. Add more <code>session.send(...)</code>
            calls before <code>session.end()</code> to continue the conversation.</p>
          <p>The loop runs on Aex. The lookup runs in your application through <code>hostEnv</code>,
            so keep its process connected while the agent needs it. Ending the session keeps history;
            <code> session.delete()</code> removes an ended session.</p>
        </section>

        <section className="site-section" aria-labelledby="next-title">
          <h2 id="next-title">Build your application</h2>
          <ul>
            <li><Link href="/brain/docs/concepts/sessions">Sessions:</Link> follow live output, reconnect and stop work.</li>
            <li><Link href="/brain/docs/guides/write-a-tool">Tools:</Link> connect your API or database.</li>
            <li><Link href="/brain/docs/guides/write-a-loop">Agent loops:</Link> customize how the agent works.</li>
            <li><Link href="/brain/docs/guides/environment-control">Environment control:</Link> choose automatic setup and optional model diagnostics.</li>
            <li><Link href="/brain/docs/guides/structured-output">Structured output:</Link> get a validated JSON answer.</li>
            <li><a href="https://github.com/aexhq/aex/blob/main/docs/attachments.md">Images and PDFs:</a> upload with a scoped grant and verify completion. Model file support varies.</li>
            <li><a href="https://github.com/aexhq/aex/blob/main/docs/http-tools.md">Serverless application tools:</a> call your existing API while Aex runs the turn.</li>
            <li><a href="https://github.com/aexhq/aex/blob/main/docs/environments.md">Managed tools:</a> use a sandbox profile granted to your account.</li>
          </ul>
          <p>Aex uses Brain&apos;s session and extension APIs. Import shared helpers from
            <code> @aexhq/sdk</code> when following the Brain guides.</p>
          <p>Use <code>session.submit()</code> when your request must return before the work finishes.
            Save its turn sequence and use <code>session.outcome(sequence)</code> from a later request.
            HTTP tools run as short authenticated calls to an account-approved endpoint in your API;
            saved conversations can call them again on later turns. Your app hosts its business functions
            and checks current user access. Inline <code>hostEnv</code> tools need their process connected.</p>
        </section>

        <section className="site-section" aria-labelledby="cli-title">
          <h2 id="cli-title">Use the CLI</h2>
          <pre className="site-code"><code>{`npm install -g @aexhq/cli@0.48.0
aex login
aex keys create "My application"
aex usage`}</code></pre>
          <p>Login opens your browser on the same computer. See the
            <a href="https://github.com/aexhq/aex/blob/main/packages/cli/README.md"> command guide</a>
            for keys, account management and billing.</p>
        </section>

        <section className="site-section" id="pricing" aria-labelledby="pricing-title">
          <h2 id="pricing-title">Hosting prices and limits</h2>
          <p>Model hosting is offered at <strong>$0.22 per million input + output tokens</strong>.
            Managed compute, attachment storage and downloads have separate prices.
            You supply your model key and pay that provider separately.</p>
          <p>The dashboard shows your exact offered and accepted prices. Existing preview accounts
            stay in preview until they accept a pricebook. Prepaid services require accepted prices
            and credits. Set a monthly spending limit; there are no automatic topups.</p>
          <p>Spending controls can interrupt work but do not cap your separate model-provider bill.
            Read the <a href="https://github.com/aexhq/aex/blob/main/docs/billing.md">billing guide</a>
            for charges, estimates and refunds.</p>
          <p>Aex is in early preview. APIs and limits may change. Maintenance can interrupt work;
            saved history remains available, and uncertain actions are not automatically retried.</p>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
