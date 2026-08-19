import type { Metadata } from "next";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { StatusClient } from "./StatusClient";

export const metadata: Metadata = { title: "Status", robots: { index: true, follow: true } };

export default function StatusPage() {
  return (
    <main>
      <SiteHeader />
      <article className="legal-page prose-shell">
        <p className="site-kicker">Production · eu-west-1</p>
        <h1>Service status</h1>
        <p>
          Current reachability from this site. Independent AWS health checks
          also probe the website and API and email the operator when either
          fails or recovers.
        </p>
        <StatusClient />
        <h2>Incidents</h2>
        <p>No incidents have been published.</p>
        <p className="site-small">
          If something looks wrong, email <a href="mailto:support@aex.dev">support@aex.dev</a>.
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}
