import type { Metadata } from "next";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Read your aex balance, usage, sessions, and API keys.",
};

export default function DashboardPage() {
  return (
    <main className="dashboard-page">
      <SiteHeader dark />
      <DashboardClient />
      <SiteFooter />
    </main>
  );
}
