/* Flag parsing. Every prompt has a flag twin — that is what lets the Theme
 * Studio export a ready-made command line, and what makes the CI smoke runs
 * possible at all — and the flag names are the studio's config keys, kebab-
 * cased, so the two stay alignable by inspection.
 *
 * Values are validated HERE, before anything runs: the library's own failure
 * mode for a bad custom property is silence at computed-value time, and the
 * one thing a scaffolder must never do is bake that silence into a fresh
 * project.
 */

import { parseArgs } from "node:util";
import { SANS_FONTS, MONO_FONTS, type FontOption } from "./fonts.js";
import { hexToOklch } from "./color.js";
import { RADIUS, DENSITY, MOTION, type ThemeAnswers } from "./theme.js";
import { PACKAGE_MANAGERS, type PackageManager } from "./scaffold.js";
import type { Framework } from "./overlay.js";

export type CliOptions = {
  name?: string;
  framework?: Framework;
  tailwind?: boolean;
  pm?: PackageManager;
  /** Version spec for `@forte-ui/react` — exact ("1.0.0-alpha.4"), dist-tag
   *  ("alpha"), or range. Deliberately NOT validated here: the package
   *  manager understands every legal form (tags, ranges, `file:`…) and
   *  rejects a wrong one at install with a better error than any regex
   *  would give. Undefined = the registry's `latest`. Dev/CI knob only —
   *  no prompt, and the studio dialog knows nothing about it. */
  library?: string;
  yes: boolean;
  install: boolean;
  /** Install the forte-ui agent skill (skills.sh) into the project. On by
   *  default; `--no-skill` opts out, and `--no-install` skips it with
   *  everything else. */
  skill: boolean;
  help: boolean;
  version: boolean;
  /** Only the keys given as flags — presence is what suppresses the prompt. */
  answers: Partial<ThemeAnswers>;
};

export class UsageError extends Error {}

function normalizeHex(flag: string, value: string): string {
  const hex = value.startsWith("#") ? value : `#${value}`;
  if (!hexToOklch(hex)) {
    throw new UsageError(`--${flag} expects a hex colour like "#6d43d4", got "${value}"`);
  }
  return hex.toLowerCase();
}

function oneOf<T extends string>(flag: string, value: string, options: readonly T[]): T {
  const v = value.toLowerCase();
  if (!options.includes(v as T)) {
    throw new UsageError(`--${flag} must be one of ${options.join(", ")} — got "${value}"`);
  }
  return v as T;
}

function fontByName(flag: string, value: string, list: readonly FontOption[]): string {
  const match = list.find((f) => f.name.toLowerCase() === value.toLowerCase());
  if (!match) {
    throw new UsageError(
      `--${flag}: "${value}" is not in the catalogue. Choices: ${list.map((f) => f.name).join(", ")}`,
    );
  }
  return match.name;
}

export function parseCliArgs(argv: string[]): CliOptions {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      framework: { type: "string", short: "f" },
      tailwind: { type: "boolean" },
      "no-tailwind": { type: "boolean" },
      seed: { type: "string" },
      accent: { type: "string" },
      secondary: { type: "string" },
      tint: { type: "string" },
      radius: { type: "string" },
      density: { type: "string" },
      motion: { type: "string" },
      "font-sans": { type: "string" },
      "font-mono": { type: "string" },
      library: { type: "string" },
      pm: { type: "string" },
      yes: { type: "boolean", short: "y" },
      "no-install": { type: "boolean" },
      "no-skill": { type: "boolean" },
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
  });

  if (positionals.length > 1) {
    throw new UsageError(`expected one project name, got: ${positionals.join(", ")}`);
  }
  if (values.tailwind && values["no-tailwind"]) {
    throw new UsageError("--tailwind and --no-tailwind are mutually exclusive");
  }
  if (values.seed !== undefined && values.accent !== undefined) {
    throw new UsageError("--seed and --accent are the same flag — pass one");
  }

  const answers: Partial<ThemeAnswers> = {};
  const seed = values.seed ?? values.accent;
  if (seed !== undefined) answers.seed = normalizeHex(values.seed !== undefined ? "seed" : "accent", seed);
  if (values.secondary !== undefined) answers.secondary = normalizeHex("secondary", values.secondary);
  if (values.tint !== undefined) {
    const tint = Number(values.tint);
    if (!Number.isFinite(tint) || tint < 0 || tint > 1) {
      throw new UsageError(`--tint expects a number between 0 and 1, got "${values.tint}"`);
    }
    answers.tint = tint;
  }
  if (values.radius !== undefined) answers.radius = oneOf("radius", values.radius, RADIUS);
  if (values.density !== undefined) answers.density = oneOf("density", values.density, DENSITY);
  if (values.motion !== undefined) {
    /* "system" is the honest name for the default from the outside: no
     * attribute, so the OS reduced-motion preference stays in charge. */
    answers.motion =
      values.motion.toLowerCase() === "system" ? "default" : oneOf("motion", values.motion, MOTION);
  }
  if (values["font-sans"] !== undefined) {
    answers.fontSans = fontByName("font-sans", values["font-sans"], SANS_FONTS);
  }
  if (values["font-mono"] !== undefined) {
    answers.fontMono = fontByName("font-mono", values["font-mono"], MONO_FONTS);
  }

  return {
    name: positionals[0],
    framework: values.framework === undefined ? undefined : oneOf("framework", values.framework, ["next", "vite"] as const),
    tailwind: values.tailwind ? true : values["no-tailwind"] ? false : undefined,
    pm: values.pm === undefined ? undefined : oneOf("pm", values.pm, PACKAGE_MANAGERS),
    library: values.library,
    yes: values.yes ?? false,
    install: !(values["no-install"] ?? false),
    skill: !(values["no-skill"] ?? false),
    help: values.help ?? false,
    version: values.version ?? false,
    answers,
  };
}

export const HELP = `create-forte-ui — scaffold a new app wired up with forte-ui

Usage
  pnpm create forte-ui [name] [flags]
  npm create forte-ui@latest [name] -- [flags]

Every flag has a prompt twin; a passed flag suppresses its prompt. With no
flags you get the questionnaire, with --yes you get a Next.js + Tailwind app
on the library's default theme.

Project
  [name]                 project directory (prompted if omitted)
  -f, --framework        next | vite
  --tailwind             wire the Tailwind v4 bridge (default yes)
  --no-tailwind          plain CSS setup
  --pm                   npm | pnpm | yarn | bun (default: whoever invoked us)
  --library              version spec for @forte-ui/react — exact
                         ("1.0.0-alpha.4"), a dist-tag ("alpha"), or a range.
                         Default: latest.
  --no-install           write files only; skip installing dependencies
                         and the agent skill
  --no-skill             skip installing the forte-ui agent skill
                         (skills.sh — .agents/skills plus .claude/skills)
  -y, --yes              accept the defaults for everything not passed

Theme — every skipped value keeps the library default and writes NOTHING,
so the app keeps following the library when defaults are tuned.
  --seed, --accent       accent seed, hex ("#6d43d4")
  --secondary            secondary seed, hex
  --tint                 neutral tint, 0 (pure grey) to 1 (default)
  --radius               none | soft | pill
  --density              compact | spacious
  --motion               system (default) | reduce | full
                         "full" overrides the OS reduced-motion preference
                         for everyone — prefer leaving it unset.
  --font-sans            a catalogue name ("Inter", "DM Sans", ...)
  --font-mono            a catalogue name ("JetBrains Mono", ...)

Design the theme visually instead: https://forte-ui.com/theme
`;
