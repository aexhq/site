import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { ReactNode } from "react";
import { source } from "@/lib/source";
import { brainRepoUrl } from "../../site-copy";
import "./docs.css";

export default function BrainDocsLayout({ children }: { children: ReactNode }) {
  return (
    <RootProvider
      theme={{
        // Fumadocs' palette and Shiki dark tokens live under a literal `.dark` selector,
        // while the rest of the site keys off `data-theme`. Set both.
        attribute: ["class", "data-theme"],
        storageKey: "aex-theme",
        defaultTheme: "system",
        enableSystem: true,
      }}
      search={{ options: { type: "static" } }}
    >
      <DocsLayout
        tree={source.pageTree}
        nav={{ title: "Aex Brain", url: "/brain" }}
        githubUrl={brainRepoUrl}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
