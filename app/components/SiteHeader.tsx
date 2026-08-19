import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="wordmark" href="/" aria-label="Aex home">Aex</Link>
        <nav aria-label="Main navigation">
          <a href="https://github.com/aexhq/aex/blob/main/docs/quickstart.md">Docs</a>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/status">Status</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </div>
    </header>
  );
}
