import type { Metadata } from "next";
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
  return (
    <main className="dashboard-page">
      <SiteHeader />
      <DashboardClient initialMode={mode === "invite" ? "invite" : "waitlist"} />
      <SiteFooter />
    </main>
  );
}
