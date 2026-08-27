import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "The hosted Aex service is not open yet. Request access, or sign in if you have been invited.",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const cookieStore = await cookies();
  return (
    <main className="dashboard-page">
      <SiteHeader />
      <DashboardClient
        hasDashboardSession={cookieStore.has("aex_account")}
        initialMode={mode === "invite" ? "invite" : "waitlist"}
      />
      <SiteFooter />
    </main>
  );
}
