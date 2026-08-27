// Generates the API reference from Brain's session contract.
//
// The pages are output, never input: editing them by hand would be overwritten on the next build,
// which is the point. The contract is the only place the API is described.
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { generateFiles } from "fumadocs-openapi";
import { createOpenAPI } from "fumadocs-openapi/server";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = join(root, "content", "docs", "reference", "api");

// Relative, so the generated pages stay portable between a laptop and CI.
const openapi = createOpenAPI({
  input: ["content/contracts/session/v1/openapi.yaml"],
});

await rm(out, { recursive: true, force: true });
await generateFiles({
  input: openapi,
  output: out,
  per: "operation",
  groupBy: "none",
  meta: true,
  index: {
    items: [
      {
        path: "index.mdx",
        title: "API",
        description: "Every session endpoint, generated from the contract.",
      },
    ],
    url: { baseUrl: "/brain/docs/reference/api", contentDir: out },
  },
});

const metaPath = join(out, "meta.json");
const meta = JSON.parse(await readFile(metaPath, "utf8"));
await writeFile(metaPath, `${JSON.stringify({ title: "API", ...meta }, null, 2)}\n`);

console.log("docs: generated the API reference from session/v1/openapi.yaml");
