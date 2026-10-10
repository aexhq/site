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
        <p>Start from a minimal core: pick your agent loop, connect your tools and decide where
          each one runs. Aex hosts the session, so its history and progress live apart from the
          environments running your tools.</p>
        <nav className="site-links" aria-label="Primary">
          <Link href="/docs">Get started</Link>
          <Link href="/dashboard">Dashboard</Link>
          <a href={orgRepoUrl}>GitHub</a>
        </nav>
        <p className="home-detail">Rather run it yourself? <Link href="/brain">Brain</Link> is
          our open-source agent runtime. Aex adds hosting, accounts and usage tracking.</p>
        <p className="home-detail">Early preview. Bring your own model key.
          <Link href="/docs#pricing"> See hosting prices and limits</Link>.</p>
      </article>
      <SiteFooter />
    </main>
  );
}
