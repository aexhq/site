import Link from "next/link";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";
export const metadata = { title: "Application tools over HTTPS" };
export default function Page() {
  return (
    <main>
      <SiteHeader>
        <Link href="/dashboard">Dashboard</Link>
      </SiteHeader>
      <article className="site-overview prose-shell">
        <header className="site-intro">
          <h1>Application tools over HTTPS</h1>
          <p>
            Keep backend tools available after a connected SDK caller exits.
            Your service owns execution; Aex records dispatch and durable
            completion.
          </p>
        </header>
        <section className="site-section">
          <h2>Declare and serve a tool</h2>
          <pre className="site-code">
            <code>{"npm install @aexhq/sdk@1.0.0"}</code>
          </pre>
          <pre className="site-code">
            <code>
              {
                'import { Application, createApplicationHandler } from "@aexhq/sdk";\nconst descriptor = { name: "lookup", description: "Look up an item", input_schema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] }, output_schema: { type: "string" } };\nconst handler = createApplicationHandler({\n  credential: process.env.APPLICATION_TOKEN,\n  tools: [{ ...descriptor, run: ({ id }) => `Item ${id}` }],\n});\n// Serve handler(request) from your HTTPS route.\nconst tools = [Application({\n  endpoint: "https://your-service.example/tools",\n  credential: process.env.APPLICATION_TOKEN,\n  tools: [descriptor],\n})];\n// Pass tools to aex.sessions.create(...).\n'
              }
            </code>
          </pre>
          <p>
            Keep a distinct random credential of at least 32 characters on your
            backend. Endpoints require HTTPS on port 443. Private destinations,
            redirects and oversized requests or results are rejected.
          </p>
        </section>
        <section className="site-section">
          <h2>Commit a result before exiting</h2>
          <p>
            Return JSON from a handler, report progress with{" "}
            <code>await context.progress(value)</code>, or call{" "}
            <code>await context.finish(value)</code>. A finish is acknowledged
            after durable storage, so its caller can then exit. Repeating an
            identical finish is safe; changing an acknowledged result fails.
          </p>
          <p>
            Aex records dispatch before contacting your endpoint. Lost
            acknowledgements retain an explicit uncertain outcome and never
            cause automatic redispatch. Completion URLs are scoped capabilities
            for the configured gateway, without account keys. Session deletion
            invalidates them and removes cached private results after active
            work stops.
          </p>
          <p>
            See the{" "}
            <a href="https://github.com/aexhq/aex/blob/main/docs/http-tools.md">
              Application guide
            </a>{" "}
            for boundaries and self-hosted gateway configuration.
          </p>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
