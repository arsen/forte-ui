/* The four-path smoke matrix: scaffold each framework × Tailwind combination
 * into a temp directory with themed flags, point it at the WORKSPACE library
 * (the templates track the current guides, which track the current library —
 * the registry may lag behind both), and run the app's own `build`. This is
 * the drift alarm: when an upstream scaffolder moves a file, a Tailwind
 * release re-slots `@layer` statements again, or a guide edit forgets a
 * template, the matrix goes red before a user does.
 *
 * Deliberately NOT wired into `pnpm test` — it shells out to the network
 * (create-vite, create-next-app, registry installs) and takes minutes.
 *
 *   pnpm --filter create-forte-ui smoke           # all four paths
 *   pnpm --filter create-forte-ui smoke vite-tw   # just one
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pkgRoot = path.join(fileURLToPath(import.meta.url), "../..");
const cli = path.join(pkgRoot, "dist/index.js");
const reactPkg = path.resolve(pkgRoot, "../react");

const MATRIX = {
  "vite-tw": ["--framework", "vite", "--seed", "#e11d48", "--radius", "pill", "--font-sans", "Inter"],
  "vite-plain": ["--framework", "vite", "--no-tailwind", "--seed", "#0e7490"],
  "next-tw": ["--framework", "next", "--seed", "#6d43d4", "--font-sans", "Poppins", "--motion", "reduce"],
  "next-plain": ["--framework", "next", "--no-tailwind"],
};

const only = process.argv[2];
if (only && !(only in MATRIX)) {
  console.error(`unknown path "${only}" — expected one of: ${Object.keys(MATRIX).join(", ")}`);
  process.exit(1);
}

function run(cmd, args, cwd) {
  const res = spawnSync(cmd, args, { stdio: "inherit", cwd, shell: process.platform === "win32" });
  if (res.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed in ${cwd}`);
}

const work = fs.mkdtempSync(path.join(os.tmpdir(), "create-forte-ui-smoke-"));
console.log(`smoke matrix in ${work}\n`);

const failures = [];
for (const [name, flags] of Object.entries(MATRIX)) {
  if (only && name !== only) continue;
  console.log(`\n=== ${name} ===`);
  try {
    run("node", [cli, name, ...flags, "--yes", "--pm", "pnpm"], work);
    const dir = path.join(work, name);
    /* The published registry may not carry the newest components the starter
     * pages use yet; the templates are written against the workspace. */
    run("pnpm", ["add", `@forte-ui/react@file:${reactPkg}`], dir);
    run("pnpm", ["build"], dir);
    console.log(`=== ${name} OK`);
  } catch (error) {
    console.error(`=== ${name} FAILED: ${error.message}`);
    failures.push(name);
  }
}

if (failures.length) {
  console.error(`\nsmoke failed: ${failures.join(", ")}`);
  process.exit(1);
}
console.log(`\nsmoke passed${only ? ` (${only})` : " (all four paths)"} — scaffolds left in ${work}`);
