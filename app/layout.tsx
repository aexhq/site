import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

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

  const description =
    "A full agent runtime with 1.4 ms platform-added TTFT and isolated Lambda MicroVM workspaces.";
  return {
    metadataBase,
    title: {
      default: "aex — agent sessions, kept alive",
      template: "%s · aex",
    },
    description:
      "A session-oriented runtime for agents: one brain, one isolated workspace, durable state, and measured overhead.",
    openGraph: {
      title: "aex — agent sessions, kept alive",
      description,
      images: [
        {
          url: "/og.png",
          width: 1732,
          height: 909,
          alt: "aex. Agent sessions, kept alive. 1.4 ms platform-added TTFT.",
        },
      ],
      type: "website",
      url: "/",
    },
    twitter: {
      card: "summary_large_image",
      title: "aex — agent sessions, kept alive",
      description,
      images: ["/og.png"],
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
