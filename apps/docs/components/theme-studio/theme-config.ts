"use client";

import * as React from "react";
import { SANS_FONTS, MONO_FONTS, findFont, ensureFontLink, type FontOption } from "./fonts";
import { hexToOklch, bestOnColor } from "@/lib/color";
import { readerTheme } from "@/components/theme-mode";

/* The theme the studio edits, and everything that reads or writes it. Pulled
 * out of the studio component the day the configurator grew a second mount
 * point — the header drawer — because two `useState` copies of this record
 * would drift the moment both were on screen: change the seed in the drawer
 * while the studio page is open and the studio's controls would keep showing
 * the old colour, then clobber the new one on their next interaction. One
 * module-level store, subscribed to with `useSyncExternalStore`, means every
 * mounted configurator is looking at the same record. */

export const RADIUS = ["none", "default", "soft", "pill"] as const;
export const DENSITY = ["compact", "default", "spacious"] as const;
export const MOTION = ["full", "default", "reduce"] as const;
/* Which palettes the theme ships with a way to reach. "system" is both: the
 * page follows the OS and offers a toggle. "light" / "dark" pin one — the
 * same `data-theme` attribute a reader's toggle would write, only static, so
 * the other palette is still built and simply never shown. Spelled "system"
 * rather than the other presets' "default" because it doubles as the CLI
 * flag value and the strip label, and "default" names nothing there. */
export const SCHEME = ["system", "light", "dark"] as const;

export type Scheme = (typeof SCHEME)[number];

export type ThemeConfig = {
  seed: string;
  secondary: string;
  tint: number;
  radius: (typeof RADIUS)[number];
  density: (typeof DENSITY)[number];
  motion: (typeof MOTION)[number];
  /* The one entry that also governs the panel's own light/dark toggle: while
   * a scheme is pinned there is nothing for it to switch, and the document
   * stops following the reader's `forte-theme` record. */
  scheme: Scheme;
  /* Stored by NAME, not by stack: the name is what the picker shows and what
   * readStored() can validate against the catalogue, while the stack and the
   * stylesheet URL are derived from it in fonts.ts — one source of truth. */
  fontSans: string;
  fontMono: string;
};

export const THEME_DEFAULTS: ThemeConfig = {
  seed: "#0e76be",
  secondary: "#8f5fc0",
  tint: 1,
  radius: "default",
  density: "default",
  motion: "default",
  scheme: "system",
  fontSans: "System",
  fontMono: "System",
};

/** Shape written to localStorage. `root` duplicates what `configToAttrs`
 *  derives, because the pre-paint script in the root layout has to apply it
 *  without loading the colour maths — see `noFlashScript`. */
type StoredStudio = {
  config: ThemeConfig;
  root: {
    vars: Record<string, string>;
    data: Record<string, string>;
    /* Google Fonts stylesheet URLs for the chosen fonts, so the pre-paint
     * script can `<link>` them without knowing the catalogue. The script
     * still checks the origin before appending — storage is user-editable,
     * and a var value cannot pull a foreign stylesheet but a link can. */
    fonts: string[];
  };
};

const STORAGE_KEY = "forte-studio";

/** Storage is user-editable and survives across deploys, so nothing read back
 *  is trusted: every field falls back to its default. */
function readStored(): ThemeConfig | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // storage can be disabled outright
  }
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;

  const { config } = parsed as Partial<StoredStudio>;
  if (!config || typeof config !== "object") return null;
  const c = config as Record<string, unknown>;

  const hex = (v: unknown, fallback: string) =>
    typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
  const oneOf = <T extends string>(v: unknown, options: readonly T[], fallback: T) =>
    options.includes(v as T) ? (v as T) : fallback;
  const fontIn = (v: unknown, list: readonly FontOption[], fallback: string) =>
    typeof v === "string" && list.some((f) => f.name === v) ? v : fallback;

  const d = THEME_DEFAULTS;
  return {
    seed: hex(c.seed, d.seed),
    secondary: hex(c.secondary, d.secondary),
    tint: typeof c.tint === "number" && c.tint >= 0 && c.tint <= 1 ? c.tint : d.tint,
    radius: oneOf(c.radius, RADIUS, d.radius),
    density: oneOf(c.density, DENSITY, d.density),
    motion: oneOf(c.motion, MOTION, d.motion),
    scheme: oneOf(c.scheme, SCHEME, d.scheme),
    fontSans: fontIn(c.fontSans, SANS_FONTS, d.fontSans),
    fontMono: fontIn(c.fontMono, MONO_FONTS, d.fontMono),
  };
}

/** Style + attributes that realise a config. Applied both to the studio's
 *  scoped preview and to the document root, which every edit re-themes. */
export function configToAttrs(cfg: ThemeConfig) {
  const seedO = hexToOklch(cfg.seed);
  const on = seedO ? bestOnColor(seedO) : null;
  const secO = hexToOklch(cfg.secondary);
  const onSec = secO ? bestOnColor(secO) : null;
  const sans = findFont(SANS_FONTS, cfg.fontSans);
  const mono = findFont(MONO_FONTS, cfg.fontMono);

  return {
    style: {
      "--forte-accent-seed": cfg.seed,
      "--forte-secondary-seed": cfg.secondary,
      "--forte-neutral-tint": String(cfg.tint),
      // Emitted as an exact literal rather than left to the CSS derivation.
      // The pure-CSS fallback uses a fitted lightness threshold that is very
      // good but not perfect; this is measured, so it is right everywhere —
      // including browsers without contrast-color().
      ...(on ? { "--forte-color-on-primary": on.color } : {}),
      ...(onSec ? { "--forte-color-on-secondary": onSec.color } : {}),
      // "System" sets nothing at all, so the token keeps its shipped default
      // instead of being pinned to a copy of it that could drift.
      ...(sans.stack ? { "--forte-font-sans": sans.stack } : {}),
      ...(mono.stack ? { "--forte-font-mono": mono.stack } : {}),
    } as React.CSSProperties,
    "data-forte-radius": cfg.radius === "default" ? undefined : cfg.radius,
    "data-forte-density": cfg.density === "default" ? undefined : cfg.density,
    "data-forte-motion": cfg.motion === "default" ? undefined : cfg.motion,
    /* Undefined for "system" so the preview scope inherits the page's mode —
     * a pinned palette is the only case where the frame should disagree with
     * the document around it. */
    "data-theme": cfg.scheme === "system" ? undefined : cfg.scheme,
  };
}

/* The CLI's own list (`packages/create-forte-ui/src/scaffold.ts`), restated:
 * that module spawns processes, so the docs cannot import it. The order is
 * the dialog's, pnpm first because it is the one this repo and its guides
 * speak. The choice is not cosmetic — the CLI reads which manager invoked it
 * and uses the same one to run the framework scaffold and install. */
export const PACKAGE_MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export type ScaffoldOptions = {
  name: string;
  framework: "next" | "vite";
  tailwind: boolean;
  packageManager: PackageManager;
};

/* How each manager runs a `create-*` package, in the form its own docs give.
 *
 * `@latest` wherever the manager honours it, because pnpm and npm otherwise
 * reuse whichever `create-forte-ui` is already cached — a reader who
 * scaffolded once keeps getting that version, and a flag the studio started
 * emitting later is rejected as unknown by a CLI that predates it. Yarn's
 * `create` takes no version and fetches fresh anyway; bun gets `bunx`, which
 * is the form that takes one.
 *
 * npm is the odd one out on flags too: `npm create` parses `--yes` and the
 * rest as its OWN options and never forwards them, so a `--` has to end
 * npm's argument list before the CLI's starts. */
const INVOCATION: Record<PackageManager, (name: string, flags: string) => string> = {
  pnpm: (name, flags) => `pnpm create forte-ui@latest ${name} ${flags}`,
  npm: (name, flags) => `npm create forte-ui@latest ${name} -- ${flags}`,
  yarn: (name, flags) => `yarn create forte-ui ${name} ${flags}`,
  bun: (name, flags) => `bunx create-forte-ui@latest ${name} ${flags}`,
};

/**
 * The config as a `create-forte-ui` command line — the flag names ARE the
 * CLI's, so this must move in lockstep with `packages/create-forte-ui`'s
 * `args.ts`.
 *
 * The two halves follow different rules on purpose. The theme flags emit
 * only deviations: the CLI's contract is that a skipped flag writes nothing
 * and the scaffold keeps following the library's own defaults, so a value
 * still sitting on the studio default (including the seeds, whose defaults
 * here are the hex twins of the shipped `oklch` values) stays off the
 * command rather than being frozen into the new app. The structural flags
 * are always explicit: they answer the dialog's own questions, and a command
 * you can read should say which project it creates. `--yes` closes the loop —
 * everything not on the line is a deliberate default, so the command runs
 * without a single prompt.
 */
export function toScaffoldCommand(cfg: ThemeConfig, opts: ScaffoldOptions): string {
  const d = THEME_DEFAULTS;
  const flags = [
    `--framework ${opts.framework}`,
    opts.tailwind ? "--tailwind" : "--no-tailwind",
    cfg.seed !== d.seed && `--seed "${cfg.seed}"`,
    cfg.secondary !== d.secondary && `--secondary "${cfg.secondary}"`,
    cfg.tint !== d.tint && `--tint ${cfg.tint}`,
    cfg.radius !== "default" && `--radius ${cfg.radius}`,
    cfg.density !== "default" && `--density ${cfg.density}`,
    cfg.motion !== "default" && `--motion ${cfg.motion}`,
    cfg.scheme !== "system" && `--scheme ${cfg.scheme}`,
    cfg.fontSans !== "System" && `--font-sans "${cfg.fontSans}"`,
    cfg.fontMono !== "System" && `--font-mono "${cfg.fontMono}"`,
    "--yes",
  ].filter(Boolean);
  return INVOCATION[opts.packageManager](opts.name, flags.join(" "));
}

/* Every var `configToAttrs` can emit. Cleared before each apply, because a
 * config is a complete statement, not a patch: pick Inter and then go back to
 * "System" and the new attrs simply LACK `--forte-font-sans` — only an
 * explicit removal gets the stale inline value off the root. */
const ROOT_VARS = [
  "--forte-accent-seed",
  "--forte-secondary-seed",
  "--forte-neutral-tint",
  "--forte-color-on-primary",
  "--forte-color-on-secondary",
  "--forte-font-sans",
  "--forte-font-mono",
] as const;

/* -------------------------------------------------------------------------
 * The store
 * ---------------------------------------------------------------------- */

let cfg: ThemeConfig = THEME_DEFAULTS;
let restored = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function getConfig() {
  return cfg;
}

/* Restoring is not an edit. The pre-paint script in the root layout has
 * already replayed the stored vars, data attributes and font links onto
 * <html> before anything rendered, so all a restore has to do is bring the
 * CONTROLS up to date — writing the document here would only repeat what is
 * already there, and persisting would write a record for a reader who has
 * never touched a control. */
function restoreOnce() {
  if (restored) return;
  restored = true;
  const stored = readStored();
  if (stored) {
    cfg = stored;
    emit();
  }
}

/** The one write path. Applies the config to the document root — so the
 *  entire site re-themes live, which is the demonstration: the docs are built
 *  from the same tokens the library ships — persists it for the pre-paint
 *  script to replay, and loads any font stylesheets the choice needs. */
export function setThemeConfig(next: ThemeConfig) {
  cfg = next;
  const attrs = configToAttrs(next);

  const root = document.documentElement;
  for (const k of ROOT_VARS) root.style.removeProperty(k);
  Object.entries(attrs.style as Record<string, string>).forEach(([k, v]) =>
    root.style.setProperty(k, v),
  );
  root.dataset.forteRadius = attrs["data-forte-radius"] ?? "";
  root.dataset.forteDensity = attrs["data-forte-density"] ?? "";
  root.dataset.forteMotion = attrs["data-forte-motion"] ?? "";
  (["forteRadius", "forteDensity", "forteMotion"] as const).forEach((k) => {
    if (!root.dataset[k]) delete root.dataset[k];
  });
  /* Not in the clear-if-empty loop above: this site always carries
   * `data-theme` (the pre-paint script resolves it), so "system" does not
   * mean "remove" here — it means hand the attribute back to the reader's
   * own choice, or the OS where they have made none. */
  root.dataset.theme = attrs["data-theme"] ?? readerTheme();

  // The vars land on the root either way; without the stylesheet the stack
  // just falls through to the system tail, so this is what turns a font
  // selection from a declaration into pixels. ensureFontLink dedupes by
  // href, so re-picking a loaded font costs nothing.
  const fonts = [findFont(SANS_FONTS, next.fontSans), findFont(MONO_FONTS, next.fontMono)];
  for (const f of fonts) {
    if (f.css) ensureFontLink(f.css);
  }

  const payload: StoredStudio = {
    config: next,
    root: {
      vars: attrs.style as Record<string, string>,
      data: {
        ...(attrs["data-forte-radius"] ? { radius: attrs["data-forte-radius"] } : {}),
        ...(attrs["data-forte-density"] ? { density: attrs["data-forte-density"] } : {}),
        ...(attrs["data-forte-motion"] ? { motion: attrs["data-forte-motion"] } : {}),
      },
      fonts: fonts.map((f) => f.css).filter((href): href is string => href !== null),
    },
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* private mode or a full quota: the session still works */
  }

  emit();
}

/**
 * The shared theme record, live. Every consumer — the studio page, the header
 * drawer's configurator — renders from the same snapshot and writes through
 * the same `setThemeConfig`, so however many of them are mounted they cannot
 * disagree.
 *
 * The stored config cannot seed the first render: the server renders the
 * defaults, so reading storage during hydration would mismatch. That is what
 * `useSyncExternalStore`'s server snapshot is for — hydrate on the defaults,
 * then the restore effect brings the stored record in and React re-renders.
 * The document itself never waits on any of this; the pre-paint script themed
 * it before first paint.
 */
export function useThemeConfig() {
  const value = React.useSyncExternalStore(subscribe, getConfig, getConfig);
  React.useEffect(restoreOnce, []);
  return [value, setThemeConfig] as const;
}
