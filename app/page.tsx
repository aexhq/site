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
        <nav className="site-links" aria-label="Primary">
          <a href={orgRepoUrl}>GitHub</a>
          <Link href="/brain">Brain</Link>
        </nav>
      </article>

      <SiteFooter />
    </main>
  );
}
