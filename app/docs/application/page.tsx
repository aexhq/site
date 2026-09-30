import Link from "next/link";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";

export const metadata = { title: "Application tools", description: "Run Aex tools in your own backend or serverless function." };
const declaration = `// tools.ts
import { tool } from "@aexhq/sdk";
import { z } from "zod";
export const lookupOrder = tool({
  name: "lookup_order",
  description: "Look up an order",
  input: z.object({ id: z.string() }),
  run: ({ id }, ctx) => ctx.finish({ id, status: "shipped" }),
});`;
const handler = `import { createToolHandler } from "@aexhq/env-http/handler";
import { lookupOrder } from "./tools.js";
export const POST = createToolHandler({
  tools: [lookupOrder()],
  authorize: async (request, invocation) => {
    await verifyApplicationCredential(request);
    await requireCurrentSessionOwner(invocation.sessionId);
  },
});`;
const creation = `import { Aex } from "@aexhq/sdk";
import { pi } from "@aexhq/agentloop-pi";
import { lookupOrder } from "./tools.js";
const aex = new Aex({ apiKey: process.env.AEX_API_KEY! });
const app = aex.environments.application({
  name: "orders",
  endpoint: "https://your-app.example/api/agent-tools",
  credential: process.env.AGENT_TOOLS_SECRET!,
  timeoutMs: 30_000,
});
const session = await aex.sessions.create({
  model: { provider: "openai", name: "gpt-4.1-mini", apiKey: process.env.OPENAI_API_KEY! },
  agentloop: pi(),
  tools: [lookupOrder({ env: app })],
});
await saveSessionOwner(session.id, authenticatedUser);
const sequence = await session.submit("Look up order A-1001");
await aex.close();`;
export default function ApplicationTools() {
  return <main>
    <SiteHeader><Link href="/docs">Get started</Link></SiteHeader>
    <article className="site-overview prose-shell">
      <header className="site-intro"><h1>Run tools in your application backend</h1>
        <p>Use an Application environment when tools need your database or server dependencies.
          Aex invokes your HTTPS endpoint for each tool call. Persistent servers and serverless functions
          use the same API; the request that submitted the turn can finish immediately.</p></header>
      <section className="site-section"><h2>Define your tools</h2>
        <pre className="site-code"><code>npm install @aexhq/sdk@0.87.0 @aexhq/env-http@0.3.2 @aexhq/agentloop-pi@8.0.0 zod@4.4.3</code></pre>
        <pre className="site-code"><code>{declaration}</code></pre></section>
      <section className="site-section"><h2>Mount one handler</h2>
        <p>The handler accepts a Web Request and returns a Response. Mount it in your existing POST
          route; for example, Hono can pass <code>c.req.raw</code>.</p>
        <pre className="site-code"><code>{handler}</code></pre>
        <p>The two authorization helpers are application code: verify the endpoint credential, then
          resolve the session&apos;s owner and current permissions from your database. Tool arguments
          must not choose the authenticated user or tenant.</p></section>
      <section className="site-section"><h2>Create and run the session</h2>
        <pre className="site-code"><code>{creation}</code></pre>
        <p>Use a randomly generated endpoint secret of at least 32 characters. Save the authenticated
          owner before the first turn. Configure the same tool options in the handler and session;
          Aex checks their contracts before dispatch. No catalog lookup or operator registration is required.</p>
        <p>Later, create another Aex client and use <code>aex.sessions.get(id)</code> and
          <code> session.outcome(sequence)</code> to read the committed outcome.</p></section>
      <section className="site-section"><h2>Completion and lifetime</h2>
        <p><code>await ctx.finish(value)</code> waits for durable acknowledgment. Configured options,
          schemas, optional model-facing content and <code>ctx.emitResult()</code> follow the ordinary
          Tool lifecycle. This handler currently provides completion services; model calls, arbitrary
          events and Environment control inside the handler are unavailable.</p>
        <p>Calls must fit the endpoint&apos;s request lifetime. The default timeout is 30 seconds and
          the maximum is five minutes. For longer work, start a durable application job, finish with
          its identifier, and inspect it in a later tool call.</p>
        <p>Endpoints must use public HTTPS on port 443. Redirects are refused. A session retains its
          endpoint and sealed credential; create a new session to change them. Keep old credentials
          valid while retained sessions still need them.</p>
        <p>Closing the submitting client does not cancel a submitted turn. Lost replies never cause
          automatic retries, and cancellation cannot undo a committed mutation. Use application
          operation keys and receipts to resolve uncertain business outcomes.</p>
        <p>For tools that read the user&apos;s current page, use <Link href="/docs/client-browser">clientBrowser</Link>.</p>
      </section>
    </article><SiteFooter />
  </main>;
}
