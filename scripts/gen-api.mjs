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
const out = join(root, "content", "docs", "api", "generated");

// Relative, so the generated pages stay portable between a laptop and CI.
const openapi = createOpenAPI({
  input: ["content/contract/openapi.json"],
});
const [{ bundled: contract }] = Object.values(await openapi.getSchemas());
const groups = ["sessions", "executors", "health", "tools"].map(prefix => ({
  title: prefix[0].toUpperCase() + prefix.slice(1),
  pages: Object.entries(contract.paths).filter(([path]) => path.split("/")[1] === prefix).flatMap(([, path]) => Object.values(path).filter(operation => operation.operationId).map(operation => operation.operationId)),
})).filter(group => group.pages.length);

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
    url: (file) => `/brain/docs/api/generated/${basename(file, extname(file))}`,
  },
});

const metaPath = join(out, "meta.json");
// Sidebar groups follow the contract's task tags without changing existing operation URLs.
await writeFile(metaPath, `${JSON.stringify({
  title: "API",
  pages: ["index", ...groups.flatMap((group) => [`---${group.title}---`, ...group.pages])],
}, null, 2)}\n`);

console.log("docs: generated the API reference from api/openapi.json");
