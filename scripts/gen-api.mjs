// Generates the API reference from Brain's session contract.
//
// The pages are output, never input: editing them by hand would be overwritten on the next build,
// which is the point. The contract is the only place the API is described.
import { rm, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateFiles } from "fumadocs-openapi";
import { createOpenAPI } from "fumadocs-openapi/server";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = join(root, "content", "docs", "reference", "api");

// Relative, so the generated pages stay portable between a laptop and CI.
const openapi = createOpenAPI({
  input: ["content/contract/session/v1/openapi.yaml"],
});
const [{ bundled: contract }] = Object.values(await openapi.getSchemas());
const operations = Object.values(contract.paths).flatMap((path) =>
  Object.values(path).filter((operation) => operation.operationId),
);
const groups = contract.tags.map((tag) => ({
  title: tag.name,
  pages: operations.filter((operation) => operation.tags?.includes(tag.name)).map((operation) => operation.operationId),
})).filter((group) => group.pages.length > 0);

await rm(out, { recursive: true, force: true });
await generateFiles({
  input: openapi,
  output: out,
  per: "operation",
  groupBy: "none",
  index: {
    items: [
      {
        path: "index.mdx",
        title: "API",
        description: "Sessions, messages, events and integration endpoints.",
        only: groups.flatMap((group) => group.pages.map((page) => `${page}.mdx`)),
      },
    ],
    url: (file) => `/brain/docs/reference/api/${basename(file, extname(file))}`,
  },
});

const metaPath = join(out, "meta.json");
// Sidebar groups follow the contract's task tags without changing existing operation URLs.
await writeFile(metaPath, `${JSON.stringify({
  title: "API",
  pages: ["index", ...groups.flatMap((group) => [`---${group.title}---`, ...group.pages])],
}, null, 2)}\n`);

console.log("docs: generated the API reference from session/v1/openapi.yaml");
