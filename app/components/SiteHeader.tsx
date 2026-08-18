export function SiteHeader({ dark = false }: { dark?: boolean }) {
  return (
    <header className={"site-header" + (dark ? " site-header-dark" : "")}>
      <div className="shell header-inner">
        <a className="wordmark" href="/" aria-label="aex home">
          aex<span>.</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="/#system">System</a>
          <a href="/#benchmarks">Benchmarks</a>
          <a href="/#security">Security</a>
        </nav>
        <a className="header-dashboard" href="/dashboard">
          Dashboard <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}
