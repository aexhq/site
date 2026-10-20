import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
export const metadata = { title: "Run your first agent on Aex" };
export default function Page() {
  return (
    <main>
      <SiteHeader>
        <Link href="/dashboard">Dashboard</Link>
      </SiteHeader>
      <article className="site-overview prose-shell">
        <header className="site-intro">
          <h1>Run your first agent on Aex</h1>
          <p>
            Connect your model and tools, run a hosted session, and keep its
            history.
          </p>
        </header>
        <section className="site-section">
          <h2>1. Get your keys</h2>
          <p>
            Use Node.js 24 and an OpenAI API key. Sign in to the{" "}
            <Link href="/dashboard">dashboard</Link>, create an Aex API key, and
            save it when shown. Keep both keys on your backend. Your model
            provider bills inference separately.
          </p>
          <pre className="site-code">
            <code>
              {
                'export AEX_API_KEY="your-aex-key"\nexport OPENAI_API_KEY="your-openai-key"'
              }
            </code>
          </pre>
        </section>
        <section className="site-section">
          <h2>2. Install</h2>
          <pre className="site-code">
            <code>{"npm install @aexhq/sdk@1.0.0"}</code>
          </pre>
        </section>
        <section className="site-section">
          <h2>3. Run an agent</h2>
          <p>
            Save this as order.mjs, then run node order.mjs. The harness runs on
            Aex; the lookup runs in your connected application.
          </p>
          <pre className="site-code">
            <code>
              {
                'import { Aex, ApiKey, Model, Tool } from "@aexhq/sdk";\n\nconst aex = new Aex({ apiKey: process.env.AEX_API_KEY, maxCostMicroUsd: 1000000 });\ntry {\n  const session = await aex.sessions.create({\n    harness: "pi",\n    model: Model("openai/gpt-4.1-mini", ApiKey(process.env.OPENAI_API_KEY)),\n    tools: [Tool({\n      name: "lookup_order",\n      description: "Look up an order by id",\n      input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"], additionalProperties: false },\n      run: ({ id }) => ({ id, status: "shipped" }),\n    })],\n  });\n  console.log((await session.send("Look up order A-1001. Has it shipped?")).output);\n  console.log("Session:", session.id);\n} finally {\n  await aex.close();\n}\n'
              }
            </code>
          </pre>
          <p>
            Closing the client disconnects callbacks and keeps the session. Save
            its ID and use <code>aex.sessions.get(id)</code> later. Explicitly
            rebind callbacks with <code>session.rebind(tools)</code> after
            reconnecting. <code>session.close()</code> keeps history;{" "}
            <code>session.delete()</code> waits for hosted cleanup before
            removing content.
          </p>
        </section>
        <section className="site-section">
          <h2>Choose a harness and tools</h2>
          <p>
            Select <code>pi</code>, <code>codex</code> or <code>opencode</code>{" "}
            as the harness. Aex installs and manages their native runtimes.{" "}
            <code>Tool(&#123; run &#125;)</code> functions stay in their
            declaring process.
          </p>
          <ul>
            <li>
              <Link href="/docs/application">Application endpoints</Link> keep
              tools available after the SDK caller exits.
            </li>
            <li>
              <Link href="/docs/client-browser">Attached browser tabs</Link> run
              DOM callbacks after an explicit user gesture.
            </li>
            <li>
              <a href="https://github.com/aexhq/aex/blob/main/docs/environments.md">
                Managed tools
              </a>{" "}
              provide authorized sandboxes, remote browsers and session
              inspection.
            </li>
            <li>
              <a href="https://github.com/aexhq/aex/blob/main/docs/attachments.md">
                Owned images and PDFs
              </a>{" "}
              reach all three native harnesses.
            </li>
          </ul>
          <p>
            <code>submit()</code> returns acceptance. <code>send()</code> waits
            for a completed turn and returns its output, events and session.
            History cursors are opaque strings. An uncertain action is never
            silently replayed.
          </p>
        </section>
        <section className="site-section" id="structured-output">
          <h2>Structured output</h2>
          <p>Install Zod 4.4.3 and validate the assistant answer locally:</p>
          <pre className="site-code">
            <code>
              {
                'import { z } from "zod";\nconst answer = await session.send("Return the order status", {\n  output: { type: z.object({ id: z.string(), status: z.string() }), maxRetries: 2 },\n});\nconsole.log(answer.status);'
              }
            </code>
          </pre>
          <p>
            The return type follows the schema. Invalid JSON or schema issues
            can trigger up to two additional correction turns by default. Zero
            retries validates one answer. Each correction is visible in history
            and can incur model and hosting charges. Provider failures and
            missing answers fail explicitly. Exhaustion throws{" "}
            <code>StructuredOutputError</code>.
          </p>
          <p>
            Keep the caller connected and sends exclusive during validation. An
            abort signal stops further corrections. Reusing an unchanged
            idempotency key reads completed receipts without repeating work. See
            the{" "}
            <a href="https://github.com/aexhq/aex/blob/main/packages/sdk/README.md">
              SDK guide
            </a>
            .
          </p>
        </section>
        <section className="site-section">
          <h2>Use the CLI</h2>
          <pre className="site-code">
            <code>
              {
                'npm install -g @aexhq/cli@1.0.0\naex login\naex keys create "My application"\naex usage'
              }
            </code>
          </pre>
        </section>
        <section className="site-section" id="pricing">
          <h2>Hosting prices and limits</h2>
          <p>
            Model hosting is offered at{" "}
            <strong>$0.22 per million input + output tokens</strong>. Managed
            compute, attachment storage and downloads have separate prices. Your
            model-provider bill remains separate.
          </p>
          <p>
            The dashboard shows your exact offered and accepted prices. Accept
            prices and fund required prepaid resources before work. Set a
            monthly spending limit; there are no automatic topups. The example
            sets a 1 USD hosting ceiling, not a price or a cap on provider
            charges.
          </p>
          <p>
            Aex is in early preview. Maintenance can interrupt work; retained
            history and explicit unknown usage support recovery. See the{" "}
            <a href="https://github.com/aexhq/aex/blob/main/docs/billing.md">
              billing guide
            </a>
            .
          </p>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
