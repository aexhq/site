import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <p>AEX is an independent developer tool in founding beta.</p>
        <nav aria-label="Footer navigation">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/status">Status</Link>
          <a href="mailto:support@aex.dev">Support</a>
          <a href="https://github.com/aexhq">GitHub</a>
        </nav>
      </div>
    </footer>
  );
}
