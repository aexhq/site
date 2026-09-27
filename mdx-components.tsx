import defaultMdxComponents from "fumadocs-ui/mdx";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import type { MDXComponents } from "mdx/types";
import { OpenAPIPage } from "@/lib/openapi-page";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return { ...defaultMdxComponents, Tab, Tabs, OpenAPIPage, APIPage: OpenAPIPage, ...components };
}
