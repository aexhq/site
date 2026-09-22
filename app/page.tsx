import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { orgRepoUrl, siteDescription, siteHeadline } from "./site-copy";

export const metadata: Metadata = {
  title: siteHeadline,
  description: siteDescription,
};

export default function Home() {
  return (
    <main className="home">
      <SiteHeader />
      <article className="home-hero">
        <h1>{siteHeadline}</h1>
        <p>Aex hosts your agent sessions. Bring your model key, connect tools from your app,
          and send a message. Follow the output as it arrives and return to saved conversations later.</p>
        <nav className="site-links" aria-label="Primary">
          <Link href="/docs">Get started</Link>
          <Link href="/dashboard">Dashboard</Link>
          <a href={orgRepoUrl}>GitHub</a>
        </nav>
        <p className="home-detail">Prefer to run it yourself? <Link href="/brain">Brain</Link> is
          our open-source agent server. Aex adds hosting, accounts and usage tracking.</p>
        <p className="home-detail">Early preview. Bring your own model-provider key.
          <Link href="/docs#pricing"> Hosting prices and limits</Link>.</p>
      </article>
      <SiteFooter />
    </main>
  );
}
