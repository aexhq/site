// Copies Brain's documentation and its session OpenAPI contract into content/ before the site builds.
//
// The prose lives in aexhq/brain next to the code it describes, so a behaviour change and its page
// land in one pull request. Nothing in content/ is edited here; it is replaced on every build.
//
// Set BRAIN_REPO_PATH to build against a local checkout instead of the pinned ref.
import { execFileSync } from "node:child_process";
import { cp, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const contentDocs = join(root, "content", "docs");
const contentContract = join(root, "content", "contract");
// Rendered by `cargo run -p brain-http --bin brain-http-contract` in the Brain repository; never hand-written.
const openapi = "session/v1/openapi.yaml";

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
  await cp(join(dir, "docs"), contentDocs, { recursive: true });
  await cp(
    join(dir, "crates", "brain-http", "generated", "contract", openapi),
    join(contentContract, openapi),
  );
  console.log("docs: synced docs/ and the session OpenAPI contract into content/");
} finally {
  await cleanup();
}
