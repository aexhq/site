import Link from "next/link";

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  return (
    <header className={"site-header" + (dark ? " site-header-dark" : "")}>
      <div className="shell header-inner">
        <Link className="wordmark" href="/" aria-label="aex home">aex</Link>
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
