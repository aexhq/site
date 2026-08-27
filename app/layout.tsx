import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteDescription, siteSocialTitle } from "./site-copy";

const themeInitializer = `
  (() => {
    try {
      const storedTheme = window.localStorage.getItem("aex-theme");
      const theme = storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      document.documentElement.dataset.theme = theme;
    } catch {}
  })();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Resolved at build time, not per request. Reading headers() here would opt every
// page out of static generation.
function resolveMetadataBase(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_URL;
  const candidate = explicit ?? (vercel ? `https://${vercel}` : "https://aex.dev");
  try {
    return new URL(candidate);
  } catch {
    return new URL("https://aex.dev");
  }
}

export function generateMetadata(): Metadata {
  const metadataBase = resolveMetadataBase();

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
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Aex.",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteSocialTitle,
      description: siteDescription,
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
