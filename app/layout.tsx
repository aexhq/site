import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { siteDescription, siteSocialTitle } from "./site-copy";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "aex.dev";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  let metadataBase = new URL("https://aex.dev");
  try {
    metadataBase = new URL(protocol + "://" + host);
  } catch {
    // Keep the canonical fallback when a malformed Host header reaches a preview.
  }

  return {
    metadataBase,
    title: {
      default: siteSocialTitle,
      template: "%s · Aex",
    },
    description: siteDescription,
    openGraph: {
      title: siteSocialTitle,
      description: siteDescription,
      type: "website",
      url: metadataBase,
    },
    twitter: {
      card: "summary",
      title: siteSocialTitle,
      description: siteDescription,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
