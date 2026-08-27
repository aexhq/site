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
        attribute: "data-theme",
        storageKey: "aex-theme",
        defaultTheme: "light",
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
