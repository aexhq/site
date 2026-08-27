import Link from "next/link";
import type { ReactNode } from "react";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader({ children }: { children?: ReactNode }) {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="wordmark" href="/" aria-label="Aex home">
          <span className="wordmark-mark" aria-hidden="true" />
          <span>Aex</span>
        </Link>
        <nav aria-label="Main navigation">
          {children}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
