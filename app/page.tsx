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
        <p>Build from a minimal core: choose your agent loop, connect your tools, and control
          where they run. Aex hosts the session, keeping its history and progress independent
          of the environments executing your tools.</p>
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
