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
const session = await aex.sessions.create({
  agentloop: pi({ env: brainEnv({ name: "brain" }) }),
  model: {
    provider: "openai", name: "gpt-4.1-mini",
    apiKey: process.env.OPENAI_API_KEY,
  },
  tools: [lookup({ env: hostEnv({ name: "app" }) })],
});
const registration = await aex.register();
try {
  await session.send("Look up item 42.");
  for await (const event of session.events()) console.log(event);
} finally {
  await session.end();
  registration.pump.stop();
  await registration.pump.closed;
}
// Keep history until retention expires, or explicitly await session.delete().`;
export default function Docs() {
  return <main><SiteHeader /><article className="shell preview-dashboard"><h1>Get started</h1>
    <h2>CLI</h2><p>The dashboard, SDK and CLI use the same Aex HTTP API.</p><pre><code>{`npm install -g @aexhq/cli@0.40.0
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
    <pre><code>npm install @aexhq/sdk@0.73.0 @aexhq/agentloop-pi@5.1.0 zod@4</code></pre>
    <p>Set <code>AEX_API_KEY</code> and your provider&apos;s <code>OPENAI_API_KEY</code> in your application environment. Keep both on your server.</p>
    <pre style={{ overflowX: "auto", margin: "1.5rem 0" }}><code>{example}</code></pre>
    <p>SDK 0.73 uses Brain SDK 0.22 with Pi, Codex and Tools 5.1. The existing Wasm interface remains compatible.</p>
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
    <p>The SDK prompts for JSON and validates it locally. Two additional correction turns are allowed by default; zero disables retries. Exhaustion throws StructuredOutputError. Ordinary sends keep returning session state.</p>
    <p>Corrections run in your client and use the session&apos;s existing Agentloop and tools. Use one caller for sends during the operation. Raw attempts remain visible in history and streams. <Link href="/brain/docs/guides/structured-output">Read the full structured-output contract</Link>.</p>
    <h2>Where code runs</h2><p>The Agentloop runs in hosted Brain. This example&apos;s lookup function runs in your application through hostEnv. To host a Tool, supply a precompiled Brain-compatible Wasm Component and place it in brainEnv.</p>
    <p>Hosted Components have bounded memory and execution time, and no access to server secrets, host files or native network grants. Customer-selected HTTP Environments are not enabled in this release.</p>
    <p>Prepare application Tool dependencies before registering hostEnv. Extensions do not declare dependency strings; each Environment owns preparation and resource access. Hosted brainEnv configuration must be empty.</p>
    <h2>Official extensions</h2>
    <p><a href="https://github.com/aexhq/extensions/tree/main/packages/tools-mcp">@aexhq/tools-mcp</a> connects selected MCP Tools through your application&apos;s hostEnv. It preserves structured failures and original JSON Schemas, including conditional schemas and local references accepted by the validators. Invalid input fails before a remote call; unresolved external references fail during setup.</p>
    <p>For standalone Brain, <a href="https://github.com/aexhq/extensions/tree/main/packages/env-local">@aexhq/env-local</a> supplies a Docker workspace with retained files and prepared Python projects, and <a href="https://github.com/aexhq/extensions/tree/main/packages/env-browser">@aexhq/env-browser</a> supplies browser actions and screenshots. These HTTP Environments need an operator deployment. Pi and Codex 5.1 present their image results to the model.</p>
    <h2>Events and storage</h2><p>Brain retains committed session history. Subscribe with session.stream(), reconnect from a committed sequence, and store application data wherever you choose. Account storage figures include active reservations.</p>
    <p>This preview uses customer model keys and one serving node. Maintenance interrupts live work. PostgreSQL holds account and ownership data; Brain retains its journal on persistent disk.</p>
    <p><Link href="/brain/docs">Brain documentation</Link> · <Link href="/brain/docs/reference/api">Session API reference</Link> · <a href="mailto:support@aex.dev">Support</a></p>
  </article><SiteFooter /></main>;
}
