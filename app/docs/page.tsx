import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { SiteFooter } from "../components/SiteFooter";
export const metadata = { title: "Docs", description: "Create your first hosted Brain session with the Aex SDK." };
const example = `import { Aex, brainEnv, hostEnv, tool } from "@aexhq/sdk";
import { pi } from "@aexhq/agentloop-pi";
import { z } from "zod";

const aex = new Aex({ apiKey: process.env.AEX_API_KEY });
const lookup = tool({
  name: "lookup", description: "Look up an item",
  input: z.object({ id: z.string() }),
  run: async ({ id }) => ({ id, name: "Example item" }),
});
try {
  const session = await aex.sessions.create({
    agentloop: pi({ env: brainEnv({ name: "brain" }) }),
    model: {
      provider: "openai", name: "gpt-4.1-mini",
      apiKey: process.env.OPENAI_API_KEY,
    },
    tools: [lookup({ env: hostEnv({ name: "app" }) })],
  });
  await session.send("Look up item 42.");
  for await (const event of session.events()) console.log(event);
  await session.end();
  // History remains until retention expires or session.delete().
} finally {
  await aex.close();
}
`;
export default function Docs() {
  return <main><SiteHeader /><article className="shell preview-dashboard"><h1>Get started</h1>
    <h2>CLI</h2><p>The dashboard, SDK and CLI use the same Aex HTTP API.</p><pre><code>{`npm install -g @aexhq/cli@0.42.3
aex login
aex keys create "My application"
aex keys list
aex keys rename KEY_ID "New name"
aex keys revoke KEY_ID
aex account
aex billing
aex usage
aex docs
aex logout`}</code></pre><p>Login opens your browser for sign-in or registration. Authorize the CLI on the same computer, then return to your terminal. Results are JSON. Account sessions expire after seven days; API key secrets are shown only at creation.</p>
    <h2>SDK</h2><p>Create an API key in your <Link href="/dashboard">dashboard</Link>, then install the SDK and a compatible Agentloop.</p>
    <pre><code>npm install @aexhq/sdk@0.75.3 @aexhq/agentloop-pi@6.1.3 zod@4</code></pre>
    <p>Set <code>AEX_API_KEY</code> and your provider&apos;s <code>OPENAI_API_KEY</code> in your application environment. Keep both on your server.</p>
    <pre style={{ overflowX: "auto", margin: "1.5rem 0" }}><code>{example}</code></pre>
    <p>SDK 0.75 uses Brain SDK 0.24 with Pi, Codex and Tools 6.1. Upgrade the matching packages together; existing sessions retain their admitted loop and tool schemas.</p>
    <p><code>await aex.models()</code> returns Brain&apos;s full supported model catalogue and known capabilities. Aex passes model discovery and validation through to Brain. For DeepSeek, select <code>provider: &quot;deepseek&quot;, name: &quot;deepseek-flash&quot;</code> with your DeepSeek API key. See the <Link href="/brain/docs/concepts/model">model contract</Link> for supported protocols and media.</p>
    <h2>Session and client lifetime</h2>
    <p><code>session.interrupt()</code> stops the current turn while keeping the session available. <code>session.end()</code> finishes the conversation and keeps history. <code>session.delete()</code> removes an ended or failed session. SDK <code>interrupt()</code> replaces <code>cancel()</code>.</p>
    <p><code>await aex.close()</code> releases client connections and local handlers. It is safe to repeat and leaves stored sessions available. The shared host connection stays open until close, including after failed creation, so creation belongs inside the try/finally scope. The official loops explain unanswered calls after interruption without automatically replaying them.</p>
    <h2>Tool outcomes</h2>
    <p>A host Tool can return ordinary output or an Outcome directly. Structured errors preserve code, message, retryable and details. Tool deadlines produce <code>timeout</code>; explicit cancellation produces <code>cancelled</code>. Use <code>unknown</code> when a dispatched operation has no reliable result. All three are failed Tool results, and timeout or cancellation does not promise rollback.</p>
    <p>The top-level status values <code>ok</code>, <code>error</code>, <code>timeout</code>, <code>cancelled</code> and <code>unknown</code> declare outcomes. Malformed outcomes fail validation. Only successful values pass through the output schema. <Link href="/brain/docs/guides/write-a-tool#return-values-and-outcomes">Read the return-value contract and example</Link>.</p>
    <h2>Structured output</h2>
    <p>Request a typed answer on an individual send by supplying a Zod schema.</p>
    <pre><code>{`const person = await session.send("Ada is 37 years old. Extract her details.", {
  output: {
    type: z.object({ name: z.string(), age: z.number() }),
    maxRetries: 2,
  },
});
// person: { name: string; age: number }`}</code></pre>
    <p>The SDK prompts for JSON and validates it locally. Two additional correction turns are allowed by default; zero disables retries. Exhaustion throws StructuredOutputError. No terminal Tool is required. Ordinary sends keep returning session state; idle alone does not establish turn success.</p>
    <p>Corrections run in your client and use the session&apos;s existing Agentloop and tools. Use one caller for sends during the operation. Raw attempts remain visible in history and streams. <Link href="/brain/docs/guides/structured-output">Read the full structured-output contract</Link>.</p>
    <h2>Where code runs</h2><p>The Agentloop runs in hosted Brain. This example&apos;s lookup function runs in your application through hostEnv. To host a Tool, supply a precompiled Brain-compatible Wasm Component and place it in brainEnv.</p>
    <p>Hosted Components have bounded memory and execution time, and no access to server secrets, host files or native network grants. Customer-selected HTTP Environments are not enabled in this release.</p>
    <p>Prepare application Tool dependencies before registering hostEnv. Extensions do not declare dependency strings; each Environment owns preparation and resource access. Hosted brainEnv configuration must be empty.</p>
    <p>Defaulted Tool arguments are optional in the model schema; Zod applies defaults and transforms before calling the handler. Ordinary objects strip extra fields and strict objects reject them. Pi dispatches in parallel; Tools and their Environments coordinate shared resources.</p>
    <h2>Images and PDFs</h2>
    <p>Publish bytes through <code>aex.attachments.upload()</code> and send the returned media as native model input. For Tool output, use the same media in the official loop envelope:</p>
    <pre><code>{`const attachment = await aex.attachments.upload(session.id, pngBytes, {
  contentType: "image/png", idempotencyKey: "chart-once",
});
await session.send({ message: "Explain this chart", media: [attachment.media] });

// Inside a Tool handler, publish using context.sessionId and return:
return { type: "aex_tool_output", version: 1, content: "Chart ready", media: [attachment.media] };`}</code></pre>
    <p>Images and PDFs use HTTPS URLs; JSON/base64 remains ordinary data. Tool-result media keeps its call ID and source order, including parallel batches with failed siblings. Keep attachments available while later turns need them; deleting or expiring one revokes future reads. <a href="https://github.com/aexhq/aex/blob/main/examples/image-tool.mjs">See the complete image Tool example</a> and <a href="https://github.com/aexhq/aex/blob/main/docs/attachments.md">attachment limits and lifetime</a>.</p>
    <h2>Official extensions</h2>
    <p><a href="https://github.com/aexhq/extensions/tree/main/packages/tools-mcp">@aexhq/tools-mcp</a> connects selected MCP Tools through your application&apos;s hostEnv. It preserves structured failures and original JSON Schemas, including conditional schemas and local references accepted by the validators. Invalid input fails before a remote call; unresolved external references fail during setup.</p>
    <p>For standalone Brain, <a href="https://github.com/aexhq/extensions/tree/main/packages/env-local">@aexhq/env-local</a> supplies a Docker workspace with retained files and prepared Python projects, and <a href="https://github.com/aexhq/extensions/tree/main/packages/env-browser">@aexhq/env-browser</a> supplies browser actions and screenshots. These HTTP Environments need an operator deployment. MCP, Docker and browser extensions are version 0.3; Pi and Codex present their media results to the model.</p>
    <p>Loop authors can run <code>npm run test:logic:watch -w packages/loop-pi</code> in the extensions checkout for quick policy edits. Full Component tests and compiled journeys still gate release.</p>
    <h2>Events and storage</h2><p>Brain retains committed session history. Subscribe with session.stream(), reconnect from a committed sequence, and store application data wherever you choose. Account storage figures include active reservations.</p>
    <p>This preview uses customer model keys and one serving node. Maintenance interrupts live work. PostgreSQL holds account and ownership data; Brain retains its journal on persistent disk. By default, idle session execution and the guest heap are released; shared workers, caches, connections and Environment resources can remain alive.</p>
    <p><Link href="/brain/docs">Brain documentation</Link> · <Link href="/brain/docs/reference/api">Session API reference</Link> · <a href="mailto:support@aex.dev">Support</a></p>
  </article><SiteFooter /></main>;
}
