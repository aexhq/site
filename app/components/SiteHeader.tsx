import Link from "next/link";

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  return (
    <header className={"site-header" + (dark ? " site-header-dark" : "")}>
      <div className="shell header-inner">
        <Link className="wordmark" href="/" aria-label="aex home">
          aex<span>.</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/#product">Product</Link>
          <Link href="/#pricing">Pricing</Link>
          <a href="https://github.com/aexhq/aex/blob/main/docs/quickstart.md">
            Docs
          </a>
          <Link href="/#beta">Beta</Link>
        </nav>
        <Link className="header-dashboard" href="/dashboard">
          Dashboard <span aria-hidden="true">→</span>
        </Link>
      </div>
    </header>
  );
}
