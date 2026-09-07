import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { DashboardClient } from "./DashboardClient";
import { accountCookie } from "../../lib/control";
export const metadata: Metadata = { title: "Dashboard", description: "API keys, documentation, account and usage for hosted Brain sessions." };
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const parameters = await searchParams;
  const cookieStore = await cookies();
  return <main className="dashboard-page"><SiteHeader /><DashboardClient hasDashboardSession={cookieStore.has(accountCookie)} signInError={parameters.error === "signin"} /><SiteFooter /></main>;
}
