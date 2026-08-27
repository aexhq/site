import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";
import { OpenAPIPage } from "@/lib/openapi-page";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return { ...defaultMdxComponents, OpenAPIPage, APIPage: OpenAPIPage, ...components };
}
