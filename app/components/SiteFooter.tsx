import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <Link className="wordmark footer-wordmark" href="/" aria-label="aex home">
          aex<span>.</span>
        </Link>
        <p>Your agent keeps its place.</p>
        <div>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/dashboard">Dashboard</Link>
          <a href="https://github.com/aexhq" rel="noreferrer" target="_blank">
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
