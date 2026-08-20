import type { Metadata } from "next";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { TopupStatusClient } from "../TopupStatusClient";

export const metadata: Metadata = { title: "Checkout return", robots: { index: false, follow: false } };

type PageProps = {
  searchParams: Promise<{ session_id?: string | string[] }>;
};

export default async function TopupSuccessPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const checkoutSessionId = Array.isArray(query.session_id)
    ? query.session_id[0]
    : query.session_id;
  return (
    <main>
      <SiteHeader />
      <TopupStatusClient checkoutSessionId={checkoutSessionId} />
      <SiteFooter />
    </main>
  );
}
