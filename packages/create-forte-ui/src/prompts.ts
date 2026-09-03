/* The questionnaire. Four questions get you to a running app; everything
 * else hides behind one "customize further?" gate, because six theme prompts
 * up front reads as a form, and the people who skipped the Theme Studio
 * mostly want `dev` running. A flag answers its question before it is asked.
 */

import * as p from "@clack/prompts";
import fs from "node:fs";
import path from "node:path";
import { SANS_FONTS, MONO_FONTS, type FontOption } from "./fonts.js";
import { hexToOklch } from "./color.js";
import { DEFAULT_ANSWERS, type ThemeAnswers } from "./theme.js";
import type { CliOptions } from "./args.js";
import { UsageError } from "./args.js";
import type { Framework, ProjectPlan } from "./overlay.js";

function accept<T>(value: T | symbol): T {
  if (p.isCancel(value)) {
    p.cancel("Canceled — nothing was written.");
    process.exit(1);
  }
  return value;
}

export function validateProjectName(name: string): string | undefined {
  if (!name) return "A project name is required.";
  if (name === "." || name.includes("/") || name.includes("\\")) {
    return "Pass a new directory name — scaffolding into an existing directory is not supported.";
  }
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(name)) {
    return "Use a lowercase npm-style name: letters, digits, dots, dashes.";
  }
  if (fs.existsSync(path.resolve(name))) return `"${name}" already exists here.`;
  return undefined;
}

const hexPrompt = (message: string) => async (): Promise<string | null> => {
  const value = accept(
    await p.text({
      message,
      placeholder: "Enter to keep the library default",
      validate: (v) => {
        if (!v) return undefined;
        return hexToOklch(v.startsWith("#") ? v : `#${v}`) ? undefined : "Expected a hex color like #6d43d4.";
      },
    }),
  );
  if (!value) return null;
  return (value.startsWith("#") ? value : `#${value}`).toLowerCase();
};

async function fontPrompt(message: string, list: readonly FontOption[]): Promise<string> {
  return accept(
    await p.select({
      message,
      initialValue: "System",
      options: list.map((f) => ({
        value: f.name,
        label: f.name,
        hint: f.stack === null ? "keep the library default" : undefined,
      })),
    }),
  );
}

export async function collectPlan(opts: CliOptions): Promise<ProjectPlan> {
  if (opts.yes && !opts.name) {
    throw new UsageError("--yes needs a project name: create-forte-ui my-app --yes");
  }

  let name = opts.name;
  if (name) {
    const problem = validateProjectName(name);
    if (problem) throw new UsageError(problem);
  } else {
    name = accept(
      await p.text({
        message: "Project name",
        placeholder: "my-app",
        validate: (v) => validateProjectName(v ?? ""),
      }),
    );
  }

  const framework: Framework =
    opts.framework ??
    (opts.yes
      ? "next"
      : accept(
          await p.select<Framework>({
            message: "Framework",
            initialValue: "next",
            options: [
              { value: "next", label: "Next.js", hint: "App Router" },
              { value: "vite", label: "Vite", hint: "react-ts template" },
            ],
          }),
        ));

  const tailwind: boolean =
    opts.tailwind ??
    (opts.yes
      ? true
      : accept(
          await p.confirm({
            message: "Tailwind? (wires the token bridge — utilities follow your theme)",
            initialValue: true,
          }),
        ));

  const answers: ThemeAnswers = { ...DEFAULT_ANSWERS, ...opts.answers };
  const flagged = new Set(Object.keys(opts.answers));

  if (!opts.yes && !flagged.has("seed")) {
    answers.seed = await hexPrompt("Accent color — your brand's hex, the whole palette derives from it")();
  }

  const advancedKeys = ["secondary", "tint", "radius", "density", "motion", "scheme", "fontSans", "fontMono"];
  const remaining = advancedKeys.filter((k) => !flagged.has(k));
  const customize =
    !opts.yes &&
    remaining.length > 0 &&
    accept(
      await p.confirm({
        message: "Customize further? (secondary, neutrals, radius, density, motion, light/dark, fonts)",
        initialValue: false,
      }),
    );

  if (customize) {
    if (remaining.includes("secondary")) {
      answers.secondary = await hexPrompt("Secondary color — hex")();
    }
    if (remaining.includes("tint")) {
      const tint = accept(
        await p.text({
          message: "Neutral tint — 0 (pure gray) to 1 (full brand tint)",
          placeholder: "1",
          validate: (v) => {
            if (!v) return undefined;
            const n = Number(v);
            return Number.isFinite(n) && n >= 0 && n <= 1 ? undefined : "A number between 0 and 1.";
          },
        }),
      );
      if (tint) answers.tint = Number(tint);
    }
    if (remaining.includes("radius")) {
      answers.radius = accept(
        await p.select({
          message: "Radius preset",
          initialValue: "default" as ThemeAnswers["radius"],
          options: [
            { value: "default" as const, label: "Default" },
            { value: "none" as const, label: "None", hint: "sharp corners everywhere" },
            { value: "soft" as const, label: "Soft", hint: "one step rounder" },
            { value: "pill" as const, label: "Pill", hint: "fully rounded controls" },
          ],
        }),
      );
    }
    if (remaining.includes("density")) {
      answers.density = accept(
        await p.select({
          message: "Density preset",
          initialValue: "default" as ThemeAnswers["density"],
          options: [
            { value: "default" as const, label: "Comfortable", hint: "the default" },
            { value: "compact" as const, label: "Compact" },
            { value: "spacious" as const, label: "Spacious" },
          ],
        }),
      );
    }
    if (remaining.includes("motion")) {
      answers.motion = accept(
        await p.select({
          message: "Motion",
          initialValue: "default" as ThemeAnswers["motion"],
          options: [
            { value: "default" as const, label: "System", hint: "follows the OS reduced-motion setting" },
            { value: "reduce" as const, label: "Reduce", hint: "geometry collapses, fades stay" },
            { value: "full" as const, label: "Full", hint: "overrides the OS preference for everyone" },
          ],
        }),
      );
    }
    if (remaining.includes("scheme")) {
      answers.scheme = accept(
        await p.select({
          message: "Light and dark",
          initialValue: "system" as ThemeAnswers["scheme"],
          options: [
            { value: "system" as const, label: "Both", hint: "follows the OS, with a toggle" },
            { value: "light" as const, label: "Light only" },
            { value: "dark" as const, label: "Dark only" },
          ],
        }),
      );
    }
    if (remaining.includes("fontSans")) {
      answers.fontSans = await fontPrompt("Sans font", SANS_FONTS);
    }
    if (remaining.includes("fontMono")) {
      answers.fontMono = await fontPrompt("Mono font", MONO_FONTS);
    }
  }

  return { name, dir: path.resolve(name), framework, tailwind, answers };
}
