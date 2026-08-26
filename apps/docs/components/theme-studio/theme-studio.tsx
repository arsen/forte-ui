"use client";

import * as React from "react";
import { Button } from "@dofortech/pretty-ui";
import {
  hexToOklch,
  oklchToHex,
  oklchToLinear,
  bestOnColor,
  validateSeed,
  contrast,
  type Oklch,
} from "@/lib/color";
import { EYEBROW } from "@/components/styles";
import { cn } from "@/lib/cn";

const PRESETS: { name: string; seed: string; secondary: string }[] = [
  { name: "Ocean", seed: "#0e76be", secondary: "#8f5fc0" },
  { name: "Violet", seed: "#6d43d4", secondary: "#c2410c" },
  { name: "Forest", seed: "#0f7a52", secondary: "#a16207" },
  { name: "Ember", seed: "#c2410c", secondary: "#0369a1" },
  { name: "Rose", seed: "#b6155f", secondary: "#0f766e" },
  { name: "Slate", seed: "#475569", secondary: "#0e7490" },
  { name: "Gold", seed: "#a16207", secondary: "#4338ca" },
  { name: "Cyan", seed: "#0e7490", secondary: "#be123c" },
];

const RADIUS = ["none", "default", "soft", "pill"] as const;
const DENSITY = ["compact", "default", "spacious"] as const;
const MOTION = ["full", "default", "reduce"] as const;

/* ---------------------------------------------------------------------------
 * Class strings, named where they are long enough to hide their own meaning.
 * ------------------------------------------------------------------------ */

const GROUP = "grid gap-2";
const GROUP_TITLE = cn(EYEBROW, "m-0 flex items-baseline justify-between");

/* A secondary note. It sits inside `GROUP_TITLE` in one place, so it has to
 * undo the eyebrow's uppercase and tracking rather than merely not set them. */
const HINT = "m-0 text-1 font-normal normal-case tracking-[0] text-foreground-muted";

const PRESET = [
  "flex min-h-(--pui-target-min) cursor-pointer items-center gap-2 px-2 py-1",
  // `font-sans font-normal leading-normal` rather than `[font:inherit]`: the
  // shorthand is an arbitrary property, Tailwind emits those last, and its
  // `font-size` component would overwrite the `text-2` beside it.
  "rounded-3 border border-transparent bg-transparent font-sans font-normal leading-normal text-2 text-foreground-muted",
  "transition-[background-color,border-color,color] duration-fast ease-standard",
  "hover:bg-panel-hover hover:text-foreground",
  "data-active:border-primary-border data-active:bg-primary-soft data-active:text-primary-text",
  "pui-focus-ring",
].join(" ");

/* The swatch IS the information here, so it opts out of forced-colors
 * substitution and supplies its own boundary. `border-[color:...]` rather than
 * plain brackets: `CanvasText` is a bare keyword, and Tailwind would otherwise
 * have to guess whether it is a colour or a width. */
const PRESET_SWATCH = [
  "size-[1.1rem] flex-none rounded-(--pui-radius-full)",
  "bg-[linear-gradient(135deg,var(--swatch)_50%,var(--swatch2)_50%)]",
  "border border-[color:CanvasText] [forced-color-adjust:none]",
].join(" ");

const FIELD_INPUT = "rounded-3 border border-border px-2 py-1 font-mono text-2";

/* ---------------------------------------------------------------------------
 * Segmented control.
 *
 * A radiogroup, not a tab strip — arrow keys move between options and the
 * selection is announced — but it borrows Tabs' indicator: the thumb is a
 * separate element that SLIDES, so switching option reads as one movement
 * rather than two fills swapping.
 *
 * Tabs can measure its tabs at runtime; this cannot, so the geometry is
 * arithmetic instead. Every segment is an equal `1fr` track, which makes the
 * thumb's width `(track − gutters) / count` and its offset `index` steps of its
 * own width plus one gap. `--seg-count` and `--seg-index` come in from the
 * component. `--pui-duration-move` is the same token Tabs uses for a positional
 * move with no travel-token equivalent, and it collapses to 1ms under reduced
 * motion, so none of this needs a media query.
 *
 * The underscores in the calc()s are Tailwind's escape for a space, and the
 * spaces are not optional — CSS requires whitespace around `+` and `-` inside
 * calc, so `100%-2*var(--seg-gap)` would be dropped as invalid.
 * ------------------------------------------------------------------------ */

const SEGMENTED = [
  "[--seg-gap:2px] relative grid grid-cols-[repeat(var(--seg-count),minmax(0,1fr))]",
  "gap-(--seg-gap) p-(--seg-gap) rounded-3 bg-panel-active",
].join(" ");

/* Absolutely positioned rather than a grid item: an explicitly placed grid item
 * would occupy the first cell and push the auto-placed segments along by one.
 * Its containing block is the strip's PADDING box, so the `100%` below is the
 * padded width and only the gaps have to be subtracted.
 *
 * The thumb is the only thing marking the selection, and a background is
 * replaced by a system colour under forced colours — so it paints Highlight
 * explicitly, exactly as Tabs' indicator does. */
const SEGMENT_INDICATOR = [
  "pointer-events-none absolute z-0 inset-y-(--seg-gap) start-(--seg-gap)",
  "w-[calc((100%_-_2_*_var(--seg-gap)_-_(var(--seg-count)_-_1)_*_var(--seg-gap))_/_var(--seg-count))]",
  "rounded-[calc(var(--pui-radius-3)_-_1px)] bg-background shadow-1",
  // The percentage is the thumb's OWN width, so one step is exactly one segment
  // plus the gap between them. `translate` is physical, so RTL mirrors by hand.
  "translate-x-[calc(var(--seg-index)_*_(100%_+_var(--seg-gap)))]",
  "rtl:translate-x-[calc(-1_*_var(--seg-index)_*_(100%_+_var(--seg-gap)))]",
  "transition-[translate] duration-move ease-spring-snappy",
  "forced-colors:bg-[color:Highlight] forced-colors:[forced-color-adjust:none]",
].join(" ");

const SEGMENT = [
  // Above the thumb, so it slides behind the label the way a pill tab does.
  "relative z-[1] min-h-(--pui-target-min) cursor-pointer p-1",
  "rounded-[calc(var(--pui-radius-3)_-_1px)] border-0 bg-transparent",
  "font-sans font-normal leading-normal text-1 capitalize text-foreground-muted",
  "transition-[color] duration-fast ease-standard",
  // `hover:` is `@media (hover: hover)` in v4, which is the gate Tabs uses too:
  // on a touch screen `:hover` sticks to the last thing tapped.
  "hover:not-data-active:text-foreground data-active:text-foreground",
  "forced-colors:data-active:text-[color:HighlightText] forced-colors:data-active:[forced-color-adjust:none]",
  "pui-focus-ring",
].join(" ");

const RAMP = "grid h-[2.25rem] grid-cols-12 gap-[2px] overflow-hidden rounded-3";

export type ThemeConfig = {
  seed: string;
  secondary: string;
  tint: number;
  radius: (typeof RADIUS)[number];
  density: (typeof DENSITY)[number];
  motion: (typeof MOTION)[number];
};

const DEFAULTS: ThemeConfig = {
  seed: "#0e76be",
  secondary: "#8f5fc0",
  tint: 1,
  radius: "default",
  density: "default",
  motion: "default",
};

/** Shape written to localStorage. `root` duplicates what `configToAttrs`
 *  derives, because the pre-paint script in the root layout has to apply it
 *  without loading the colour maths — see `noFlashScript`. */
type StoredStudio = {
  config: ThemeConfig;
  applyToSite: boolean;
  root: { vars: Record<string, string>; data: Record<string, string> };
};

const STORAGE_KEY = "pui-studio";

/** Storage is user-editable and survives across deploys, so nothing read back
 *  is trusted: every field falls back to its default. */
function readStored(): { config: ThemeConfig; applyToSite: boolean } | null {
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

  const { config, applyToSite } = parsed as Partial<StoredStudio>;
  if (!config || typeof config !== "object") return null;
  const c = config as Record<string, unknown>;

  const hex = (v: unknown, fallback: string) =>
    typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
  const oneOf = <T extends string>(v: unknown, options: readonly T[], fallback: T) =>
    options.includes(v as T) ? (v as T) : fallback;

  return {
    config: {
      seed: hex(c.seed, DEFAULTS.seed),
      secondary: hex(c.secondary, DEFAULTS.secondary),
      tint:
        typeof c.tint === "number" && c.tint >= 0 && c.tint <= 1 ? c.tint : DEFAULTS.tint,
      radius: oneOf(c.radius, RADIUS, DEFAULTS.radius),
      density: oneOf(c.density, DENSITY, DEFAULTS.density),
      motion: oneOf(c.motion, MOTION, DEFAULTS.motion),
    },
    applyToSite: applyToSite === true,
  };
}

/** Style + attributes that realise a config. Applied to a scoped preview, or
 *  to the document root when "apply to site" is on. */
function configToAttrs(cfg: ThemeConfig) {
  const seedO = hexToOklch(cfg.seed);
  const on = seedO ? bestOnColor(seedO) : null;
  const secO = hexToOklch(cfg.secondary);
  const onSec = secO ? bestOnColor(secO) : null;

  return {
    style: {
      "--pui-accent-seed": cfg.seed,
      "--pui-secondary-seed": cfg.secondary,
      "--pui-neutral-tint": String(cfg.tint),
      // Emitted as an exact literal rather than left to the CSS derivation.
      // The pure-CSS fallback uses a fitted lightness threshold that is very
      // good but not perfect; this is measured, so it is right everywhere —
      // including browsers without contrast-color().
      ...(on ? { "--pui-color-on-primary": on.color } : {}),
      ...(onSec ? { "--pui-color-on-secondary": onSec.color } : {}),
    } as React.CSSProperties,
    "data-pui-radius": cfg.radius === "default" ? undefined : cfg.radius,
    "data-pui-density": cfg.density === "default" ? undefined : cfg.density,
    "data-pui-motion": cfg.motion === "default" ? undefined : cfg.motion,
  };
}

function toCss(cfg: ThemeConfig) {
  const seedO = hexToOklch(cfg.seed);
  const secO = hexToOklch(cfg.secondary);
  const on = seedO ? bestOnColor(seedO) : null;
  const onSec = secO ? bestOnColor(secO) : null;

  const attrs = [
    cfg.radius !== "default" && `data-pui-radius="${cfg.radius}"`,
    cfg.density !== "default" && `data-pui-density="${cfg.density}"`,
    cfg.motion !== "default" && `data-pui-motion="${cfg.motion}"`,
  ].filter(Boolean);

  const lines = [
    `:root {`,
    `  --pui-accent-seed: ${cfg.seed};`,
    `  --pui-secondary-seed: ${cfg.secondary};`,
    cfg.tint !== 1 ? `  --pui-neutral-tint: ${cfg.tint};` : null,
    ``,
    `  /* Measured rather than derived, so it is exact in every browser. */`,
    on ? `  --pui-color-on-primary: ${on.color};` : null,
    onSec ? `  --pui-color-on-secondary: ${onSec.color};` : null,
    `}`,
  ].filter((l) => l !== null);

  const html = attrs.length ? `\n\n<!-- on <html> -->\n<html ${attrs.join(" ")}>` : "";
  return lines.join("\n") + html;
}

function Ratio({ value, large = false }: { value: number; large?: boolean }) {
  // SC 1.4.3 relaxes to 3:1 for large text (>=24px, or >=18.66px bold).
  const aa = large ? 3 : 4.5;
  const aaa = large ? 4.5 : 7;
  const level = value >= aaa ? "AAA" : value >= aa ? "AA" : "Fail";
  return (
    <span className="font-mono text-1 whitespace-nowrap" data-level={level}>
      {value.toFixed(2)}:1{" "}
      <b
        className={cn(
          "ms-1 inline-block min-w-[2.4em] rounded-2 px-[0.35em] text-center",
          // `/22` is Tailwind's opacity modifier, which compiles to the same
          // `color-mix(in oklab, …, transparent)` the stylesheet used to write
          // out by hand.
          level === "Fail" ? "bg-danger/22 text-danger-text" : "bg-success/22 text-success-text",
        )}
      >
        {level}
      </b>
    </span>
  );
}

export function ThemeStudio() {
  const [cfg, setCfg] = React.useState<ThemeConfig>(DEFAULTS);
  const [applyToSite, setApplyToSite] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  // The stored config cannot seed useState: the server renders the defaults,
  // so reading storage during the first render would mismatch on hydration.
  // Everything that touches the document waits for this to flip.
  const [restored, setRestored] = React.useState(false);

  const set = <K extends keyof ThemeConfig>(k: K, v: ThemeConfig[K]) =>
    setCfg((c) => ({ ...c, [k]: v }));

  const seedO = hexToOklch(cfg.seed);
  const warnings = seedO ? validateSeed(seedO) : [{ level: "warn" as const, message: "Not a valid hex colour." }];
  const on = seedO ? bestOnColor(seedO) : null;

  // Contrast of the low-contrast text step against the app background, which
  // is the pair most likely to fail as a seed gets lighter.
  const textRatio = React.useMemo(() => {
    if (!seedO) return null;
    const step11: Oklch = {
      l: Math.min(Math.max(0.32, seedO.l - 0.09), 0.49),
      c: Math.min(0.15, seedO.c * 0.8),
      h: seedO.h,
    };
    return contrast(oklchToLinear(step11).rgb, oklchToLinear({ l: 0.994, c: 0, h: 0 }).rgb);
  }, [seedO]);

  const attrs = React.useMemo(() => configToAttrs(cfg), [cfg]);

  React.useEffect(() => {
    const stored = readStored();
    if (stored) {
      setCfg(stored.config);
      setApplyToSite(stored.applyToSite);
    }
    setRestored(true);
  }, []);

  // Persist on every change, so the studio is where you left it — and, when
  // "apply to site" is on, so is the rest of the docs.
  React.useEffect(() => {
    if (!restored) return;
    const payload: StoredStudio = {
      config: cfg,
      applyToSite,
      root: {
        vars: attrs.style as Record<string, string>,
        data: {
          ...(attrs["data-pui-radius"] ? { radius: attrs["data-pui-radius"] } : {}),
          ...(attrs["data-pui-density"] ? { density: attrs["data-pui-density"] } : {}),
          ...(attrs["data-pui-motion"] ? { motion: attrs["data-pui-motion"] } : {}),
        },
      },
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch { /* private mode or a full quota: the session still works */ }
  }, [restored, cfg, applyToSite, attrs]);

  // Mirror onto <html> so the entire site — header, sidebar, prose, code —
  // re-themes live. That is the demonstration: the docs are built from the
  // same tokens the library ships.
  React.useEffect(() => {
    // Before the restore lands, the root may already carry the stored theme
    // from the pre-paint script; clearing it here would flash the defaults.
    if (!restored) return;
    const root = document.documentElement;
    const keys = ["--pui-accent-seed", "--pui-secondary-seed", "--pui-neutral-tint", "--pui-color-on-primary", "--pui-color-on-secondary"];
    const dataKeys = ["puiRadius", "puiDensity", "puiMotion"] as const;

    if (!applyToSite) {
      keys.forEach((k) => root.style.removeProperty(k));
      dataKeys.forEach((k) => delete root.dataset[k]);
      return;
    }
    Object.entries(attrs.style as Record<string, string>).forEach(([k, v]) => root.style.setProperty(k, v));
    root.dataset.puiRadius = attrs["data-pui-radius"] ?? "";
    root.dataset.puiDensity = attrs["data-pui-density"] ?? "";
    root.dataset.puiMotion = attrs["data-pui-motion"] ?? "";
    dataKeys.forEach((k) => { if (!root.dataset[k]) delete root.dataset[k]; });
  }, [restored, applyToSite, attrs]);

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const css = toCss(cfg);

  return (
    <div className="grid grid-cols-[19rem_minmax(0,1fr)] items-start gap-5 max-two-col:grid-cols-[minmax(0,1fr)]">
      <div
        className={cn(
          "grid gap-5 rounded-surface border border-border-muted bg-panel p-5",
          // Sticky beside the preview on a wide screen; once the two columns
          // stack there is nothing to stay level with, and a pinned panel would
          // just eat the viewport.
          "sticky top-[4.5rem] max-h-[calc(100dvh-6rem)] overflow-y-auto",
          "max-two-col:static max-two-col:max-h-none",
        )}
      >
        <section className={GROUP}>
          <h3 className={GROUP_TITLE}>Presets</h3>
          <div className="grid grid-cols-2 gap-1">
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                className={PRESET}
                data-active={cfg.seed === p.seed || undefined}
                style={{ "--swatch": p.seed, "--swatch2": p.secondary } as React.CSSProperties}
                onClick={() => setCfg((c) => ({ ...c, seed: p.seed, secondary: p.secondary }))}
                aria-label={`${p.name} preset`}
                title={p.name}
              >
                <span className={PRESET_SWATCH} aria-hidden="true" />
                {p.name}
              </button>
            ))}
          </div>
        </section>

        <section className={GROUP}>
          <h3 className={GROUP_TITLE}>Brand colours</h3>
          <ColorField label="Primary" value={cfg.seed} onChange={(v) => set("seed", v)} />
          <ColorField label="Secondary" value={cfg.secondary} onChange={(v) => set("secondary", v)} />
        </section>

        <section className={GROUP}>
          <h3 className={GROUP_TITLE}>
            Neutral tint <span className={HINT}>{cfg.tint.toFixed(2)}</span>
          </h3>
          <input
            className="w-full accent-primary"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={cfg.tint}
            onChange={(e) => set("tint", Number(e.target.value))}
            aria-label="Neutral tint: how much of the brand hue bleeds into the greys"
          />
          <p className={HINT}>How much of the brand hue bleeds into the greys. 0 is pure neutral.</p>
        </section>

        <Choice label="Radius" options={RADIUS} value={cfg.radius} onChange={(v) => set("radius", v)} />
        <Choice label="Density" options={DENSITY} value={cfg.density} onChange={(v) => set("density", v)} />
        <Choice label="Motion" options={MOTION} value={cfg.motion} onChange={(v) => set("motion", v)} />

        <section className={GROUP}>
          <h3 className={GROUP_TITLE}>Contrast</h3>
          <dl className="m-0 grid grid-cols-[minmax(0,1fr)_auto] gap-x-2 gap-y-1 text-2">
            <dt className="text-foreground-muted">Text on solid fill</dt>
            <dd className="m-0 text-end">{on ? <Ratio value={on.ratio} /> : "—"}</dd>
            <dt className="text-foreground-muted">Accent text on background</dt>
            <dd className="m-0 text-end">{textRatio ? <Ratio value={textRatio} /> : "—"}</dd>
          </dl>
          {on ? (
            <p className={HINT}>
              Auto-contrast picked <b>{on.color}</b> text.
            </p>
          ) : null}
          {warnings.map((w) => (
            <p
              key={w.message}
              className={cn(
                "m-0 rounded-3 p-2 text-1 leading-[1.45]",
                w.level === "warn"
                  ? "bg-danger-soft text-danger-text"
                  : "bg-panel-active text-foreground-muted",
              )}
              data-level={w.level}
            >
              {w.message}
            </p>
          ))}
        </section>

        <label className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 text-2">
          <input
            type="checkbox"
            checked={applyToSite}
            onChange={(e) => setApplyToSite(e.target.checked)}
          />
          <span className="grid gap-[2px]">
            <b>Apply to this whole site</b>
            <span className={HINT}>Re-themes the docs live — header, nav, prose and code.</span>
          </span>
        </label>
      </div>

      <div className="grid gap-4">
        <div
          className="grid gap-4 rounded-surface border border-border-muted bg-background p-surface text-foreground pui-theme"
          style={attrs.style}
          data-pui-radius={attrs["data-pui-radius"]}
          data-pui-density={attrs["data-pui-density"]}
          data-pui-motion={attrs["data-pui-motion"]}
        >
          <Ramp name="accent" />
          <Ramp name="secondary" />
          <Ramp name="gray" />

          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button tone="secondary">Secondary</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button tone="danger">Delete</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button loading>Saving</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>

        <figure
          className="m-0 overflow-hidden rounded-surface border border-border-muted bg-panel"
          data-code-root
        >
          <figcaption
            className={cn(GROUP_TITLE, "items-center gap-3 border-b border-border-muted px-3 py-2")}
          >
            Your theme
            <Button
              size="sm"
              variant="soft"
              tone="neutral"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(css);
                  setCopied(true);
                } catch { /* clipboard may be blocked; the code stays visible */ }
              }}
            >
              {copied ? "Copied" : "Copy CSS"}
            </Button>
          </figcaption>
          <pre className="m-0 overflow-x-auto p-4 font-mono text-2 leading-[1.6] text-foreground">
            {css}
          </pre>
        </figure>
      </div>
    </div>
  );
}

function Ramp({ name }: { name: string }) {
  return (
    <div className={RAMP} role="img" aria-label={`${name} ramp, 12 steps`}>
      {Array.from({ length: 12 }, (_, i) => (
        // Colour is the entire content — keep it in forced-colors mode.
        <span
          key={i}
          className="block [forced-color-adjust:none]"
          style={{ background: `var(--pui-${name}-${i + 1})` }}
        />
      ))}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = React.useId();
  return (
    <div className="grid grid-cols-[5rem_2rem_minmax(0,1fr)] items-center gap-2 text-2 text-foreground-muted">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="color"
        value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="size-6 cursor-pointer rounded-3 border border-border bg-transparent p-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(FIELD_INPUT, "min-w-0 bg-background text-foreground")}
        spellCheck={false}
        aria-label={`${label} hex value`}
      />
    </div>
  );
}

function Choice<T extends string>({
  label, options, value, onChange,
}: { label: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <section className={GROUP}>
      <h3 className={GROUP_TITLE}>{label}</h3>
      {/* A radiogroup rather than a Tabs strip: these pick a setting, they do
        * not switch between panels, so arrow keys move between options and the
        * selection is announced as a radio rather than a tab. The sliding thumb
        * is Tabs' indicator idea reused — the count and the active index are
        * all the geometry needs; see SEGMENT_INDICATOR above. */}
      <div
        className={SEGMENTED}
        role="radiogroup"
        aria-label={label}
        style={{
          "--seg-count": options.length,
          "--seg-index": options.indexOf(value),
        } as React.CSSProperties}
      >
        {options.map((o) => (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={value === o}
            className={SEGMENT}
            data-active={value === o || undefined}
            onClick={() => onChange(o)}
          >
            {o}
          </button>
        ))}
        {/* The thumb. Absolutely positioned, so its place in the DOM is free —
          * it sits last, after the options it decorates. */}
        <span className={SEGMENT_INDICATOR} aria-hidden="true" />
      </div>
    </section>
  );
}
