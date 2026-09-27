import Link from "next/link";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";

export const metadata = { title: "Browser tab tools", description: "Use tools in the user's browser tab through ordinary Aex session creation." };
const composition = `// composition.ts
import { brainEnv, clientBrowser, tool } from "@aexhq/sdk";
import { pi } from "@aexhq/agentloop-pi";
import { z } from "zod";
const readSelection = tool({
  name: "read_selection",
  description: "Read the user's current text selection",
  input: z.object({}),
  run: (_, ctx) => ctx.finish(window.getSelection()?.toString() ?? ""),
});
export const composition = {
  agentloop: pi({ env: brainEnv({ name: "brain" }) }),
  tools: [readSelection({ env: clientBrowser({ name: "editor" }) })],
};
export const model = { provider: "openai", name: "gpt-4.1-mini" };`;
const backend = `import { Aex } from "@aexhq/sdk";
import { composition, model } from "./composition.js";
// Inside your authenticated application's bootstrap route:
await requireAuthorizedApplicationUser();
const aex = new Aex({ apiKey: process.env.AEX_API_KEY! });
try {
  const access = await aex.clients.grant({
    origin: "https://your-app.example",
    session: {
      ...composition,
      model: { ...model, apiKey: process.env.OPENAI_API_KEY! },
    },
  });
  return Response.json(access, { headers: { "cache-control": "no-store" } });
} finally {
  await aex.close();
}`;
const frontend = `import { Aex } from "@aexhq/sdk";
import { composition, model } from "./composition.js";
const access = await fetch("/api/agent-access", { method: "POST" }).then(r => r.json());
const aex = new Aex({ clientAccess: access });
const session = await aex.sessions.create({ ...composition, model });
await session.send("Summarize my selected text");`;
export default function BrowserTools() {
  return <main>
    <SiteHeader><Link href="/docs">Get started</Link></SiteHeader>
    <article className="site-overview prose-shell">
      <header className="site-intro"><h1>Run tools in the user&apos;s browser tab</h1>
        <p>Use <code>clientBrowser()</code> for tools that read or change the user&apos;s current page.
          Create sessions with <code>aex.sessions.create()</code>; the SDK opens the command stream
          and returns results. Account and model-provider keys stay on your backend.</p></header>
      <section className="site-section"><h2>Share the composition</h2>
        <pre className="site-code"><code>npm install @aexhq/sdk@0.85.0 @aexhq/agentloop-pi@7.2.4 zod@4.4.3</code></pre>
        <pre className="site-code"><code>{composition}</code></pre>
        <p>The backend prepares this declaration without running the browser function. Serve the
          Agentloop package&apos;s Wasm asset with your frontend; bundlers that support
          <code> new URL(..., import.meta.url)</code> can include it as an asset.</p></section>
      <section className="site-section"><h2>Authorize the application user</h2>
        <p>Your backend checks the user&apos;s permission to run this composition before issuing
          access. The authorization helper below belongs to your application.</p>
        <pre className="site-code"><code>{backend}</code></pre></section>
      <section className="site-section"><h2>Create the session in the browser</h2>
        <pre className="site-code"><code>{frontend}</code></pre>
        <p>The browser connects directly to Aex. The bootstrap route can finish immediately,
          including when it runs in a serverless function.</p></section>
      <section className="site-section"><h2>Access and reconnecting</h2>
        <p>Access fixes one origin, composition, host and resulting session. Repeating
          <code> sessions.create()</code> with that composition and access reattaches to the same
          session, including after an Aex restart. It cannot list other sessions, change model
          selection, admit unrelated components or manage the account.</p>
        <p>Create within five minutes. Pending provider credentials stay in server memory until
          creation; expiry or a restart before creation requires fresh backend authorization.
          An uncertain creation is never silently repeated.</p>
        <p>Access expires after one hour by default. <code>expiresAt</code> accepts Unix seconds up
          to 24 hours; revoke access earlier with <code>aex.clients.revoke(access.id)</code> on your
          backend. Parent-key revocation and account suspension also apply.</p>
        <p>Use your application&apos;s HTTPS origin. HTTP localhost is supported for development.</p>
        <p>Closing the tab removes its tools and may interrupt their work; the durable session remains.
          Call <code>aex.close()</code> when the page no longer needs its client. Use an
          <Link href="/docs/application"> Application environment</Link> for backend tools that must outlive the tab.</p>
        <p><code>hostEnv</code> remains available for connected processes. The <code>browser</code>
          extension controls an automation browser. A frontend that only sends messages needs no
          browser tool environment.</p>
      </section>
    </article><SiteFooter />
  </main>;
}
