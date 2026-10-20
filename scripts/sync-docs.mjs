// Copies Brain's documentation and its session OpenAPI contract into content/ before the site builds.
//
// The prose lives in aexhq/brain next to the code it describes, so a behaviour change and its page
// land in one pull request. Nothing in content/ is edited here; it is replaced on every build.
//
// Set BRAIN_REPO_PATH to build against a local checkout instead of the pinned ref.
import { execFileSync } from "node:child_process";
import { cp, mkdtemp, readFile, rm, readdir, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const contentDocs = join(root, "content", "docs");
const contentContract = join(root, "content", "contract");
const openapi = "openapi.json";

async function sourceDir() {
  const local = process.env.BRAIN_REPO_PATH;
  if (local) {
    console.log(`docs: using local checkout ${local}`);
    return { dir: local, cleanup: async () => {} };
  }

  const lock = JSON.parse(await readFile(join(root, "docs.lock.json"), "utf8"));
  const dir = await mkdtemp(join(tmpdir(), "brain-docs-"));
  console.log(`docs: cloning ${lock.repo} at ${lock.ref}`);
  execFileSync("git", ["init", "--quiet", dir], { stdio: "inherit" });
  execFileSync("git", ["-C", dir, "remote", "add", "origin", lock.repo], { stdio: "inherit" });
  execFileSync("git", ["-C", dir, "fetch", "--depth", "1", "origin", lock.ref], { stdio: "inherit" });
  execFileSync("git", ["-C", dir, "checkout", "--quiet", "--detach", "FETCH_HEAD"], { stdio: "inherit" });
  return { dir, cleanup: () => rm(dir, { recursive: true, force: true }) };
}

const { dir, cleanup } = await sourceDir();
try {
  await rm(contentDocs, { recursive: true, force: true });
  await rm(contentContract, { recursive: true, force: true });
  await cp(join(dir, "website", "content", "docs"), contentDocs, { recursive: true });
  // Mount upstream links under the hosted Brain section without changing its prose.
  async function mountedLinks(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await mountedLinks(path);
      else if (entry.name.endsWith(".mdx")) {
        const text = await readFile(path, "utf8");
        await writeFile(path, text.replace(/([("'=])\/docs(?=[/\)"'#])/g, "$1/brain/docs").replaceAll("(/openapi.json)", "(/brain/openapi.json)"));
      }
    }
  }
  await mountedLinks(contentDocs);
  await cp(
    join(dir, "api", openapi),
    join(contentContract, openapi),
  );
  await mkdir(join(root, "public", "brain"), { recursive: true });
  await cp(join(contentContract, openapi), join(root, "public", "brain", openapi));
  console.log("docs: synced published MDX and the Brain OpenAPI contract");
} finally {
  await cleanup();
}
