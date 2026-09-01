#!/usr/bin/env node
/* create-forte-ui: scaffold a brand-new app wired up with forte-ui.
 *
 * The division of labour is the whole design: `create-next-app` / `create-vite`
 * own the framework scaffold (run non-interactively, kept current upstream),
 * and this CLI owns only the forte-ui overlay — the getting-started guides'
 * steps, mechanized. The guides are the spec; when a step changes there,
 * change `templates.ts` with it.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { parseCliArgs, UsageError, HELP } from "./args.js";
import { collectPlan } from "./prompts.js";
import { hexToOklch, validateSeed } from "./color.js";
import {
  applyOverlay,
  dependenciesFor,
  recordDependencies,
  toAddSpecs,
  type ProjectPlan,
} from "./overlay.js";
import {
  detectPackageManager,
  runScaffolder,
  addDependencies,
  devCommand,
  installCommand,
  type PackageManager,
} from "./scaffold.js";

function ownVersion(): string {
  const pkgPath = path.join(fileURLToPath(import.meta.url), "../../package.json");
  return (JSON.parse(fs.readFileSync(pkgPath, "utf8")) as { version: string }).version;
}

/** The library's contrast guarantees were measured across a seed envelope;
 *  a seed outside it still works, but the studio would have warned — so the
 *  CLI does too, after the answers are settled and before anything runs. */
function warnAboutSeeds(plan: ProjectPlan) {
  for (const [label, hex] of [
    ["accent", plan.answers.seed],
    ["secondary", plan.answers.secondary],
  ] as const) {
    if (!hex) continue;
    const oklch = hexToOklch(hex);
    if (!oklch) continue;
    for (const warning of validateSeed(oklch)) {
      p.log[warning.level === "warn" ? "warn" : "info"](`${label} ${hex}: ${warning.message}`);
    }
  }
}

function scaffold(plan: ProjectPlan, pm: PackageManager): boolean {
  if (plan.framework === "vite") {
    return runScaffolder(pm, "create-vite@latest", [plan.name, "--template", "react-ts"], process.cwd());
  }
  return runScaffolder(
    pm,
    "create-next-app@latest",
    [
      plan.name,
      "--typescript",
      "--app",
      plan.tailwind ? "--tailwind" : "--no-tailwind",
      "--no-src-dir",
      "--import-alias",
      "@/*",
      /* One install at the end (ours, with the library included) instead of
       * two; --yes answers whatever prompts remain in future versions. */
      "--skip-install",
      "--yes",
    ],
    process.cwd(),
  );
}

async function main() {
  let opts;
  try {
    opts = parseCliArgs(process.argv.slice(2));
  } catch (error) {
    if (error instanceof UsageError || error instanceof TypeError) {
      console.error(pc.red(`create-forte-ui: ${error.message}`));
      console.error(`Run with ${pc.bold("--help")} for usage.`);
      process.exit(1);
    }
    throw error;
  }

  if (opts.help) {
    console.log(HELP);
    return;
  }
  if (opts.version) {
    console.log(ownVersion());
    return;
  }

  p.intro(pc.bold("create-forte-ui"));

  let plan;
  try {
    plan = await collectPlan(opts);
  } catch (error) {
    if (error instanceof UsageError) {
      p.cancel(error.message);
      process.exit(1);
    }
    throw error;
  }

  warnAboutSeeds(plan);

  const pm = opts.pm ?? detectPackageManager();
  const upstream = plan.framework === "vite" ? "create-vite" : "create-next-app";
  p.log.step(`Scaffolding with ${upstream}…`);
  if (!scaffold(plan, pm)) {
    p.cancel(`${upstream} failed — see its output above. Nothing else was written.`);
    process.exit(1);
  }

  let written;
  try {
    written = applyOverlay(plan);
  } catch (error) {
    p.cancel(
      `${(error as Error).message}\n` +
        `The ${upstream} scaffold in ./${plan.name} is intact — ` +
        `finish by hand with the guide: https://forte-ui.com/getting-started/${plan.framework === "vite" ? "vite" : "nextjs"}/`,
    );
    process.exit(1);
  }
  p.log.success(`Wired up forte-ui: ${written.join(", ")}`);

  const deps = dependenciesFor(plan, opts.library);
  const specs = toAddSpecs(deps);
  if (opts.install) {
    p.log.step(`Installing ${specs.join(", ")} with ${pm}…`);
    if (!addDependencies(pm, specs, plan.dir)) {
      /* A `--library` spec is validated only here, by the registry itself —
       * so on failure say which spec died rather than suggesting a re-run
       * that would resolve the exact same thing. */
      p.cancel(
        opts.library
          ? `${pm} could not install @forte-ui/react@${opts.library} — see its output above. ` +
              `Check that the --library spec exists on the registry.`
          : `${pm} failed to install — run ${pc.bold(`${installCommand(pm)}`)} in ./${plan.name} yourself.`,
      );
      process.exit(1);
    }
  } else {
    recordDependencies(plan.dir, deps);
    p.log.info(`Skipped install; added ${specs.join(", ")} to package.json.`);
  }

  const steps = [
    `cd ${plan.name}`,
    ...(opts.install ? [] : [installCommand(pm)]),
    devCommand(pm),
  ];
  p.note(steps.join("\n"), "Next");
  p.outro(
    `Docs: ${pc.underline("https://forte-ui.com")} · design the theme visually: ${pc.underline("https://forte-ui.com/theme/")}`,
  );
}

main().catch((error: unknown) => {
  console.error(pc.red(`create-forte-ui: ${error instanceof Error ? error.message : String(error)}`));
  process.exit(1);
});
