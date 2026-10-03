import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { getRootDirs } from "@next/eslint-plugin-next/dist/utils/get-root-dirs.js";

test("Next lint resolves directory roots without expanding their children", async () => {
  const root = await mkdtemp(path.join(tmpdir(), "aex-lint-roots-"));
  try {
    const web = path.join(root, "web").replaceAll("\\", "/");
    const admin = path.join(root, "admin").replaceAll("\\", "/");
    await mkdir(path.join(web, "app"), { recursive: true });
    await mkdir(admin);
    await writeFile(path.join(root, "file.txt"), "fixture");
    const roots = rootDir => getRootDirs({ cwd: root, settings: { next: { rootDir } } }).map(directory => path.resolve(directory));
    assert.deepEqual(roots(undefined), [root]);
    assert.deepEqual(roots(web), [path.resolve(web)]);
    assert.deepEqual(roots(path.relative(process.cwd(), web)), [path.resolve(web)]);
    assert.deepEqual(roots(`${root.replaceAll("\\", "/")}/*`).sort(), [admin, web].map(directory => path.resolve(directory)));
    assert.deepEqual(roots([web, admin]), [web, admin].map(directory => path.resolve(directory)));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
