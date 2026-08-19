import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";

export const metadata: Metadata = { title: "Checkout cancelled", robots: { index: false, follow: false } };

export default function TopupCancelledPage() {
  return (
    <main>
      <SiteHeader />
      <section className="topup-return shell">
        <p className="section-index">CHECKOUT / CANCELLED</p>
        <h1>No charge was made.</h1>
        <p>You can return to the dashboard and start a new checkout whenever you’re ready.</p>
        <Link className="button button-primary" href="/dashboard">Return to dashboard <span aria-hidden="true">→</span></Link>
      </section>
      <SiteFooter />
    </main>
  );
}
