#!/usr/bin/env node
// Build every publishable package, show what is about to go to npm, ask, and
// publish. Run it from the root as `pnpm release`.
//
//   pnpm release                 build, preview, confirm, publish
//   pnpm release --dry-run       everything but the upload (pnpm's own dry run)
//   pnpm release --yes           skip the confirmation prompt
//   pnpm release --otp 123456    hand one authenticator code to every publish
//   pnpm release --tag next      override the dist-tag derived from the version
//   pnpm release --skip-build    reuse dist/ from an earlier run
//
// This is a plain script, not a turbo task, on purpose. turbo runs tasks per
// package and its TUI owns stdin, so it cannot ask "publish these?" once for
// the whole set — and the whole set is the unit here: the three packages
// carry one version number and move in lockstep (AGENTS.md, "Releases and
// the changelog"). The script only calls turbo for the build.
//
// It publishes through `pnpm publish`, never `npm publish`: `forte-ui`
// depends on `@forte-ui/react` as `workspace:^`, which pnpm rewrites to the
// real version range in the tarball and npm ships verbatim, breaking every
// install of the alias package.

import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);

function flag(name) {
  return args.includes(`--${name}`);
}
function option(name) {
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.slice(name.length + 3);
  const i = args.indexOf(`--${name}`);
  return i !== -1 ? args[i + 1] : undefined;
}

const dryRun = flag("dry-run");
const yes = flag("yes");
const skipBuild = flag("skip-build");
const otp = option("otp");
const tagOverride = option("tag");

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;

function fail(message) {
  console.error(`\n${red("✖")} ${message}\n`);
  process.exit(1);
}

function run(cmd, cmdArgs, opts = {}) {
  const result = spawnSync(cmd, cmdArgs, { cwd: root, stdio: "inherit", ...opts });
  if (result.status !== 0) fail(`\`${cmd} ${cmdArgs.join(" ")}\` exited with ${result.status}`);
}

function capture(cmd, cmdArgs) {
  return spawnSync(cmd, cmdArgs, { cwd: root, encoding: "utf8" });
}

// ---------------------------------------------------------------------------
// 1. The publishable set — discovered, not listed, so a new package under
//    packages/ joins the release without anyone editing this file.

const packages = readdirSync(join(root, "packages"))
  .map((dir) => join(root, "packages", dir, "package.json"))
  .filter(existsSync)
  .map((file) => ({ dir: dirname(file), ...JSON.parse(readFileSync(file, "utf8")) }))
  .filter((pkg) => !pkg.private);

if (packages.length === 0) fail("No publishable package found under packages/.");

const versions = new Set(packages.map((p) => p.version));
if (versions.size > 1) {
  fail(
    `The publishable packages disagree on the version — they must move in lockstep:\n` +
      packages.map((p) => `    ${p.name.padEnd(20)} ${p.version}`).join("\n") +
      `\n  Run /release-prep, or set every "version" to the same value.`,
  );
}
const [version] = versions;

// The docs app is private and never published, but it carries the same
// number: the site is a snapshot of one library version — it prints that
// version on the home page and in the app bar, read from the library's own
// package.json at build time — and its `package.json` says which.
// /release-prep bumps it alongside the publishable set; refusing here is
// what keeps the mirror from silently drifting.
const docsPkg = JSON.parse(readFileSync(join(root, "apps", "docs", "package.json"), "utf8"));
if (docsPkg.version !== version) {
  fail(
    `apps/docs is at ${docsPkg.version}, the packages at ${version} — the docs app mirrors the release version.\n` +
      `  Run /release-prep, or set its "version" to ${version}.`,
  );
}

// A prerelease publishes under its identifier (`1.0.0-alpha.6` → `alpha`),
// a stable version under `latest`. Publishing a prerelease as `latest` would
// hand `npm install @forte-ui/react` an alpha, which is the one thing a
// dist-tag exists to prevent.
const prerelease = /^\d+\.\d+\.\d+-([0-9A-Za-z]+)/.exec(version)?.[1];
const distTag = tagOverride ?? (prerelease ?? "latest");

// ---------------------------------------------------------------------------
// 2. Git state. `pnpm publish` enforces both of these itself, but only after
//    the build has run — checking first saves a wasted minute.

const branch = capture("git", ["branch", "--show-current"]).stdout.trim();
if (branch !== "main") fail(`Releases publish from main; you are on "${branch}".`);
if (capture("git", ["status", "--porcelain"]).stdout.trim()) {
  fail("The working tree is not clean. Commit or stash first — a release must describe committed history only.");
}

// ---------------------------------------------------------------------------
// 3. Build the publishable packages (the docs app is private and slow, and
//    nothing in a tarball comes from it).

if (skipBuild) {
  console.log(dim("\nSkipping the build (--skip-build).\n"));
} else {
  console.log(bold("\nBuilding packages/*…\n"));
  run("pnpm", ["turbo", "run", "build", "--filter=./packages/*"]);

  // The library's build starts with `generate`, which writes checked-in
  // files. A diff here means a source of truth changed without its output
  // being committed — the tarball would ship what HEAD does not describe.
  const drift = capture("git", ["status", "--porcelain"]).stdout.trim();
  if (drift) {
    fail(`The build changed tracked files — commit the regenerated output, then release again:\n${drift}`);
  }
}

// ---------------------------------------------------------------------------
// 4. What the registry has now, per package.

function registryState(name) {
  const result = capture("npm", ["view", name, "versions", "dist-tags", "--json"]);
  if (result.status !== 0) {
    if (/E404/.test(result.stdout + result.stderr)) return { versions: [], tags: {} };
    fail(`\`npm view ${name}\` failed:\n${result.stderr}`);
  }
  const data = JSON.parse(result.stdout);
  // npm collapses a single-element list to a bare string.
  return { versions: [].concat(data.versions ?? []), tags: data["dist-tags"] ?? {} };
}

const plan = packages.map((pkg) => {
  const state = registryState(pkg.name);
  return {
    name: pkg.name,
    published: state.versions.includes(version),
    current: state.tags[distTag] ?? dim("—"),
  };
});

const toPublish = plan.filter((p) => !p.published);

console.log(`\n${bold("Release")} ${green(version)}  ${dim("dist-tag")} ${bold(distTag)}${dryRun ? yellow("  (dry run)") : ""}\n`);
const width = Math.max(...plan.map((p) => p.name.length)) + 2;
console.log(`  ${"package".padEnd(width)} ${`on npm as ${distTag}`.padEnd(18)} action`);
for (const p of plan) {
  const action = p.published ? dim(`already published — skip`) : green(`publish ${version}`);
  console.log(`  ${p.name.padEnd(width)} ${String(p.current).padEnd(18)} ${action}`);
}
console.log();

if (toPublish.length === 0) {
  console.log(`Every package is already on npm at ${version}. Nothing to do.\n`);
  process.exit(0);
}

// ---------------------------------------------------------------------------
// 5. Confirm, then publish through pnpm.

if (!yes) {
  const rl = createInterface({ input: stdin, output: stdout });
  const answer = (await rl.question(`Publish ${toPublish.length} package(s) to npm as ${bold(distTag)}? [y/N] `)).trim();
  rl.close();
  if (!/^y(es)?$/i.test(answer)) {
    console.log("\nAborted. Nothing was published.\n");
    process.exit(0);
  }
}

// `-r` publishes every workspace package whose version is not on the
// registry yet, in dependency order, so `@forte-ui/react` lands before the
// alias that depends on it. `--otp` is forwarded to each publish, which is
// what turns three browser round-trips into one code.
const publishArgs = ["-r", "--filter=./packages/*", "publish", "--access", "public", "--tag", distTag];
if (otp) publishArgs.push("--otp", otp);
if (dryRun) publishArgs.push("--dry-run");

console.log();
run("pnpm", publishArgs);

// ---------------------------------------------------------------------------
// 6. Tag. /release-prep takes the last `v*` tag as the start of the next
//    range, so a release without one silently widens the next changelog.

if (dryRun) {
  console.log(`\n${yellow("Dry run")} — nothing was uploaded and no tag was created.\n`);
  process.exit(0);
}

const tag = `v${version}`;
if (capture("git", ["tag", "-l", tag]).stdout.trim()) {
  console.log(`\nTag ${tag} already exists.`);
} else {
  run("git", ["tag", "-a", tag, "-m", `Release ${version}`]);
  console.log(`\nTagged ${tag}.`);
}

// Push main and the tag together. The publish above is the irreversible
// step; this one is not, so a failed push (no network, expired credentials)
// must not turn a successful release into a non-zero exit — print the
// command and let the user retry it.
const push = spawnSync("git", ["push", "origin", "main", tag], { cwd: root, stdio: "inherit" });
const pushed = push.status === 0;

console.log(`\n${green("✔")} Published ${toPublish.map((p) => p.name).join(", ")} at ${version} as ${distTag}.`);
if (pushed) {
  console.log(`  Pushed main and ${tag} to origin.\n`);
} else {
  console.log(`  ${yellow("Push failed")} — run it by hand: ${bold(`git push origin main ${tag}`)}\n`);
}
