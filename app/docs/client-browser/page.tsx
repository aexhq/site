import Link from "next/link";
import { SiteHeader } from "../../components/SiteHeader";
import { SiteFooter } from "../../components/SiteFooter";
export const metadata = { title: "Run tools in the user\u2019s browser tab" };
export default function Page() {
  return (
    <main>
      <SiteHeader>
        <Link href="/dashboard">Dashboard</Link>
      </SiteHeader>
      <article className="site-overview prose-shell">
        <header className="site-intro">
          <h1>Run tools in the user’s browser tab</h1>
          <p>
            Attach DOM callbacks through a user gesture while Aex retains the
            session. Keep account and model-provider keys on your backend.
          </p>
        </header>
        <section className="site-section">
          <h2>Authorize one composition</h2>
          <p>
            Authenticate your application user before issuing scoped access for
            an exact HTTPS frontend origin. Local HTTP origins are supported for
            development.
          </p>
          <pre className="site-code">
            <code>
              {
                'const descriptor = { name: "selection", description: "Read selected text", input_schema: { type: "object", properties: {}, additionalProperties: false } };\nconst access = await aex.clients.grant({\n  origin: "https://your-app.example", tools: [descriptor],\n  session: {\n    harness: "pi", config: { model: "openai/gpt-4.1-mini", tools: [] },\n    model_credential: { api_key: process.env.OPENAI_API_KEY },\n  },\n});\n// Return only access to your authorized frontend, with Cache-Control: no-store.\n'
              }
            </code>
          </pre>
        </section>
        <section className="site-section">
          <h2>Attach from the tab</h2>
          <pre className="site-code">
            <code>
              {
                'import { Aex, Tool } from "@aexhq/sdk";\nconst client = new Aex({ clientAccess: access });\nconst tools = [Tool({ ...descriptor, run: () => window.getSelection()?.toString() ?? "" })];\nbutton.addEventListener("click", () => {\n  client.attachTab({ create: { ...access.session, runtime_tools: tools } }).then(attached => {\n    // Use attached.session; await attached.detach() to disconnect.\n  });\n});\n'
              }
            </code>
          </pre>
          <p>
            Create within five minutes. The model credential stays private and
            is absent from the grant response. A backend restart before creation
            requires fresh authorization.
          </p>
          <p>
            After creation, read <code>await client.clients.composition()</code>{" "}
            for its bound session. A later user gesture explicitly calls{" "}
            <code>client.attachTab(&#123;session:id,tools&#125;)</code>. An
            uncertain creation is never silently repeated.
          </p>
        </section>
        <section className="site-section">
          <h2>Disconnect and revoke</h2>
          <p>
            Use <code>detach()</code> or <code>client.close()</code> explicitly.
            Closing the tab removes callbacks and keeps the session. There is no
            automatic idle disconnect or hidden callback replay. Grant expiry,
            parent-key revocation and account suspension deny reconnects and
            close active streams.
          </p>
          <p>
            Use an <Link href="/docs/application">Application endpoint</Link>{" "}
            for backend work, or an account-authorized managed remote browser
            for automation. See the{" "}
            <a href="https://github.com/aexhq/aex/blob/main/docs/client-browser.md">
              browser guide
            </a>
            .
          </p>
        </section>
      </article>
      <SiteFooter />
    </main>
  );
}
