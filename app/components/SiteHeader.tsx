import Link from "next/link";

export function SiteHeader({ dark = false }: { dark?: boolean }) {
  return (
    <header className={"site-header" + (dark ? " site-header-dark" : "")}>
      <div className="shell header-inner">
        <Link className="wordmark" href="/" aria-label="aex home">
          aex<span>.</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/#system">System</Link>
          <Link href="/#benchmarks">Benchmarks</Link>
          <Link href="/#security">Security</Link>
        </nav>
        <Link className="header-dashboard" href="/dashboard">
          Dashboard <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}
