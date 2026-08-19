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
    "Add an agent to your product with one API. AEX keeps its model, conversation, tools, and Linux workspace together.";
  const socialImage = new URL("/og.png", metadataBase);
  return {
    metadataBase,
    title: {
      default: "aex — the session backend for AI apps",
      template: "%s · aex",
    },
    description,
    openGraph: {
      title: "aex — the session backend for AI apps",
      description,
      images: [
        {
          url: socialImage,
          width: 1740,
          height: 904,
          alt: "aex. Your agent keeps its place.",
        },
      ],
      type: "website",
      url: metadataBase,
    },
    twitter: {
      card: "summary_large_image",
      title: "aex — the session backend for AI apps",
      description,
      images: [socialImage],
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
