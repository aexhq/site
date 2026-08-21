import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Join Aex, add credit, create API keys, and see exact usage.",
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
