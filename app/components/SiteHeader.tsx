import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="wordmark" href="/" aria-label="Aex home">
          <span className="wordmark-mark" aria-hidden="true" />
          <span>Aex</span>
        </Link>
        <nav aria-label="Main navigation">
          <a href="https://github.com/aexhq/aex/blob/main/docs/quickstart.md">Docs</a>
          <Link href="/#architecture">Architecture</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/dashboard">Dashboard</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
