/* Process plumbing: which package manager invoked us, and how to run the
 * upstream scaffolders through it. The framework templates are deliberately
 * NOT ours — `create-vite` and `create-next-app` keep their own scaffolds
 * current, and this CLI only owns the forte-ui overlay on top. That division
 * is what keeps the tool from rotting the way frozen templates do.
 */

import { spawnSync } from "node:child_process";

export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export const PACKAGE_MANAGERS: readonly PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

/** `npm_config_user_agent` is set by every package manager for its child
 *  processes ("pnpm/9.0.0 npm/? node/v20..."), so `pnpm create forte-ui`
 *  self-identifies. Direct `npx` invocation reports npm, which is right. */
export function detectPackageManager(): PackageManager {
  const agent = process.env.npm_config_user_agent ?? "";
  if (agent.startsWith("pnpm")) return "pnpm";
  if (agent.startsWith("yarn")) return "yarn";
  if (agent.startsWith("bun")) return "bun";
  return "npm";
}

/* Windows resolves `npx`/`pnpm` through .cmd shims, which spawnSync only
 * finds with a shell. */
const needsShell = process.platform === "win32";

function run(cmd: string, args: string[], cwd?: string): boolean {
  const result = spawnSync(cmd, args, { stdio: "inherit", cwd, shell: needsShell });
  return result.status === 0;
}

/** Run a `create-*` package without installing it, through the invoking
 *  manager's own runner where it has one. Yarn Classic has no `dlx`, so it
 *  falls back to npx — npm is a Node guarantee, Berry users still get the
 *  right lockfile from the later install step. */
export function runScaffolder(pm: PackageManager, pkg: string, args: string[], cwd: string): boolean {
  switch (pm) {
    case "pnpm":
      return run("pnpm", ["dlx", pkg, ...args], cwd);
    case "bun":
      return run("bunx", [pkg, ...args], cwd);
    default:
      return run("npx", ["--yes", pkg, ...args], cwd);
  }
}

/** `pm add <deps>` in the project — resolves "latest" into a real caret range
 *  in package.json and performs the full install in one pass. */
export function addDependencies(pm: PackageManager, deps: string[], cwd: string): boolean {
  const sub = pm === "npm" ? "install" : "add";
  return run(pm, [sub, ...deps], cwd);
}

/** The dev-server line for the outro, in the user's own manager. */
export function devCommand(pm: PackageManager): string {
  return pm === "npm" ? "npm run dev" : `${pm} dev`;
}

export function installCommand(pm: PackageManager): string {
  return pm === "yarn" ? "yarn" : `${pm} install`;
}
