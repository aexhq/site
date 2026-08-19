import type { Metadata } from "next";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { TopupStatusClient } from "../TopupStatusClient";

export const metadata: Metadata = { title: "Checkout return", robots: { index: false, follow: false } };

export default function TopupSuccessPage() {
  return <main><SiteHeader /><TopupStatusClient /><SiteFooter /></main>;
}
