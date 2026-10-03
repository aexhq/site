import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";

export const metadata = {
  title: "Get started",
  description: "Connect your model and tools, then run your first AI agent on Aex.",
};

const example = `import { Aex, tool } from "@aexhq/sdk";
import { pi } from "@aexhq/agentloop-pi";
import { z } from "zod";

const lookupOrder = tool({
  name: "lookup_order",
  description: "Look up an order by id.",
  input: z.object({ id: z.string() }),
  run: ({ id }, ctx) => ctx.finish({ id, status: "shipped" }),
});

const aex = new Aex({ apiKey: process.env.AEX_API_KEY });
aex.sessions.create({
  model: { provider: "openai", name: "gpt-4.1-mini", apiKey: process.env.OPENAI_API_KEY },
  agentloop: pi(),
  tools: [lookupOrder()],
}).then(async session => {
  const after = session.state.lastSequence;
  await session.send("Look up order A-1001. Has it shipped?");
  for await (const event of session.events(after)) {
    if (event.type === "turn_failed") throw new Error(JSON.stringify(event.data));
  }
  console.log(JSON.stringify(await session.transcript(), null, 2));
  console.log("Session:", session.id);
}).catch(error => {
  console.error(error);
  process.exitCode = 1;
});`;

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
npm install @aexhq/sdk@0.88.0 @aexhq/agentloop-pi@9.0.0 zod@4.4.3`}</code></pre>
        </section>

        <section className="site-section" aria-labelledby="run-title">
          <h2 id="run-title">3. Add a tool and run the agent</h2>
          <p>Save this as <code>order.mjs</code>. The same API works in TypeScript.</p>
          <pre className="site-code"><code>{example}</code></pre>
          <pre className="site-code"><code>node order.mjs</code></pre>
          <p>The transcript includes the lookup result and an answer that order A-1001 has shipped.
            Replace the sample lookup with your own data. Add more <code>session.send(...)</code>
            calls in the callback to continue the conversation.</p>
          <p>The loop runs on Aex and the lookup runs in your application. After five idle seconds,
            the client releases its tool connection so this script can exit. A later send through
            the same live client reconnects automatically. The session and its history remain available.</p>
          <p>Use <code>connectionIdleTimeoutMs: 0</code> on <code>new Aex(...)</code> when other callers
            or future autonomous events need these tools. Event subscriptions stay open until you stop them.
            Explicit <code>aex.close()</code> disposes of the client; <code>session.end()</code> finishes
            the conversation and <code>session.delete()</code> removes its history.</p>
        </section>

        <section className="site-section" aria-labelledby="next-title">
          <h2 id="next-title">Build your application</h2>
          <ul>
            <li><Link href="/brain/docs/concepts/sessions">Sessions:</Link> follow live output, reconnect and stop work.</li>
            <li><Link href="/brain/docs/guides/write-a-tool">Tools:</Link> connect your API or database.</li>
            <li><Link href="/brain/docs/guides/write-a-loop">Agent loops:</Link> customize how the agent works.</li>
            <li><Link href="/brain/docs/guides/environment-control">Environment control:</Link> choose automatic setup and optional model diagnostics.</li>
            <li><a href="#structured-output">Structured output:</a> get a validated JSON answer.</li>
            <li><a href="https://github.com/aexhq/aex/blob/main/docs/attachments.md">Images and PDFs:</a> upload with a scoped grant and verify completion. Model file support varies.</li>
            <li><a href="/docs/application">Application tools:</a> run tools in your deployed server or serverless backend.</li>
            <li><a href="/docs/client-browser">Client browser tools:</a> work in the user&apos;s connected tab with scoped access.</li>
            <li><a href="https://github.com/aexhq/aex/blob/main/docs/environments.md">Managed tools:</a> use a sandbox profile granted to your account.</li>
          </ul>
          <p>Aex uses Brain&apos;s session and extension APIs. Import shared helpers from
            <code> @aexhq/sdk</code> when following the Brain guides.</p>
          <p>Use <code>session.submit()</code> when your request must return before the work finishes.
            Save its turn sequence and use <code>session.outcome(sequence)</code> from a later request.
            Declare your backend with <code>aex.environments.application()</code> and place ordinary
            tools there. Aex admits the endpoint when you call <code>sessions.create()</code>;
            saved conversations can call it again on later turns. Your app hosts its business functions
            and checks current user access. Inline <code>hostEnv</code> tools need their process connected.</p>
        </section>

        <section className="site-section" aria-labelledby="preparation">
          <h2 id="preparation">Prepare code before requests arrive</h2>
          <p>Aex prepares hosted loop and tool code during session setup. To move that work into
            application startup, await preparation once and reuse the returned loop:</p>
          <pre className="site-code"><code>{`const loop = await aex.prepare(pi());
const session = await aex.sessions.create({ model, agentloop: loop, tools });`}</code></pre>
          <p>Pi and Codex share a runtime and load their smaller program bundles separately.
            Preparation can serve several sessions; ending a conversation does not unload it.
            Imports remain passive, and preparation failures reject before session creation.</p>
          <p>Read the <Link href="/brain/docs/reference/environment-runtime#prepare-before-creating-sessions">Environment
            preparation reference</Link> for startup configuration, worker readiness and custom programs.</p>
        </section>

        <section className="site-section" aria-labelledby="structured-output">
          <h2 id="structured-output">Structured output</h2>
          <p>Use a typed answer when your application needs data it can validate and use directly.
            Inside the callback, pass a Zod schema with the message:</p>
          <pre className="site-code"><code>{`const answer = await session.send("Return the order status", {
  output: { type: z.object({ id: z.string(), status: z.string() }), maxRetries: 2 },
});
console.log(answer.status);`}</code></pre>
          <p>Aex adds schema instructions to the prompt, parses the completed turn&apos;s assistant
            answer as JSON and validates it locally. The return type follows the schema.
            Ordinary sends return session state. Pi and Codex emit the assistant output this needs.</p>
          <p><code>maxRetries</code> counts additional correction turns and defaults to two.
            Zero checks one answer. Invalid JSON or schema issues trigger a request for a complete
            corrected answer; Markdown fences and surrounding prose fail parsing. Zod defaults,
            transforms and async refinements apply to the returned value. Exhaustion throws
            <code> StructuredOutputError</code> with <code>attempts</code>, <code>lastOutput</code> and
            <code> issues</code>. Provider and transport failures do not trigger corrections.</p>
          <p>Keep the calling process alive and coordinate exclusive sends during the operation.
            Each attempt is a separate durable turn, can call tools and remains visible in history
            and streams. Local validation does not change a completed server turn. A top-level
            <code> signal</code> cancels active work and stops further corrections. An
            <code> idempotencyKey</code> lets unchanged requests and validation feedback reuse their
            completed turns; the whole operation is not atomic.</p>
          <p>For a short-lived caller using <code>submit()</code>, configure output validation in
            the hosted Agentloop instead. That separate policy uses JSON Schema and cannot run your
            local Zod refinements. See the <a href="https://github.com/aexhq/aex/blob/main/packages/sdk/README.md#structured-output">SDK guide</a>
            for both contracts, error handling, replay and a complete example.</p>
          <p>Starting with Brain SDK 0.34 and Aex SDK 0.84, this prompt and correction policy belongs
            to Aex. Existing Aex typed sends keep their syntax. Import their types and errors from
            <code> @aexhq/sdk</code>. Aex clients and handles now use composition; use
            <code> AexSessionHandle</code> for explicit handle types. The
            <a href="https://github.com/aexhq/aex/blob/main/packages/sdk/README.md#migrating-from-brain-sdk-typed-sends"> migration guide</a>
            also shows how to wrap an existing standalone Brain handle.</p>
        </section>

        <section className="site-section" aria-labelledby="cli-title">
          <h2 id="cli-title">Use the CLI</h2>
          <pre className="site-code"><code>{`npm install -g @aexhq/cli@0.50.5
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
