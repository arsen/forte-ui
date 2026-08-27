"use client";

import * as React from "react";
import {
  Button,
  ColorPicker,
  Slider,
  Tabs,
  Toggle,
  ToggleGroup,
  type Rgba,
} from "@dofortech/pretty-ui";
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
import { getDocumentTheme, setDocumentTheme, type DocTheme } from "@/components/theme-toggle";
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

/* The same eight colours again, as the two flat lists `ColorPicker.Swatches`
 * wants. Built from PRESETS rather than written out, so the picker's palette
 * cannot drift from the preset grid above it. */
const PRESET_SEEDS = PRESETS.map((p) => p.seed);
const PRESET_SECONDARIES = PRESETS.map((p) => p.secondary);

/* Deliberately NOT part of `ThemeConfig` below, and it is worth saying why:
 * light/dark is a reader preference, stored under its own `pui-theme` key and
 * shared with the header toggle, while everything in ThemeConfig is part of the
 * theme the studio EXPORTS. Both modes are already built from the same seed, so
 * there is nothing here to put in the copied CSS — this strip only decides
 * which of the two you are looking at. */
const THEME: readonly DocTheme[] = ["light", "dark"];

const RADIUS = ["none", "default", "soft", "pill"] as const;
const DENSITY = ["compact", "default", "spacious"] as const;
const MOTION = ["full", "default", "reduce"] as const;

/* ---------------------------------------------------------------------------
 * Class strings, named where they are long enough to hide their own meaning.
 * ------------------------------------------------------------------------ */

const GROUP = "grid gap-2";
const GROUP_TITLE = cn(EYEBROW, "m-0 flex items-baseline justify-between");

/* A secondary note, and the slider's own readout — which is why it sets a size
 * rather than only a colour: `Slider.Value` comes in at `text-2` and has to
 * come down to match the eyebrow it shares a row with. */
const HINT = "m-0 text-1 text-foreground-muted";

/* The swatch IS the information here, so it opts out of forced-colors
 * substitution and supplies its own boundary. `border-[color:...]` rather than
 * plain brackets: `CanvasText` is a bare keyword, and Tailwind would otherwise
 * have to guess whether it is a colour or a width. */
const PRESET_SWATCH = [
  "size-[1.1rem] flex-none rounded-(--pui-radius-full)",
  "bg-[linear-gradient(135deg,var(--swatch)_50%,var(--swatch2)_50%)]",
  "border border-[color:CanvasText] [forced-color-adjust:none]",
].join(" ");

/* ---------------------------------------------------------------------------
 * Segmented control — `Tabs`, used as a tab strip with no panels under it.
 *
 * Some of the strip's knobs have to be retuned for that, and every one of them
 * is set inline on Tabs.Root, the element that declares them: they are custom
 * properties, and a utility class cannot set one.
 *
 * `--pui-tabs-content-gap` is the load-bearing one. Tabs.Root is a two-row grid
 * whose second row holds the panels, and a gutter is drawn between two explicit
 * tracks whether or not the second one has anything in it — so a panelless
 * strip would sit on top of a rem of dead space.
 *
 * The two surfaces have to move together, and the reason is the surface ramp.
 * The `pill` defaults are a `--pui-color-panel` strip (gray-2) with a
 * `--pui-color-primary-soft` thumb (accent-3), and they are tuned for a strip
 * sitting on the page: gray-1 page, gray-2 strip, tinted thumb, each step
 * lifting off the one under it. This panel is ALREADY gray-2, so that stack
 * starts one rung too low — the strip disappears into the panel, and moving
 * only the strip up to gray-4 puts accent-3 BELOW its own track, which is what
 * turns the thumb into a hole in dark mode rather than a raised segment.
 *
 * So the strip recesses to gray-4 and the thumb comes back out to gray-1 — the
 * far end of the scale in both modes, near-white on light and near-black on
 * dark, which is the one pairing that reads the same way in each. The accent
 * is not lost with it: `--pui-tabs-tab-color-active` already puts the active
 * label in `--pui-color-primary-text`, so the colour lands on the word instead
 * of the box behind it. Under forced colours none of this applies — the a11y
 * block paints the indicator `Highlight` outright.
 *
 * The rest is fit. The studio's column is 19rem, and four segments at the
 * default control height and label size do not cross it.
 * ------------------------------------------------------------------------ */

const TAB_VARS = {
  "--pui-tabs-content-gap": "0px",
  "--pui-tabs-list-bg": "var(--pui-color-panel-active)",
  "--pui-tabs-indicator-color": "var(--pui-color-background)",
  "--pui-tabs-height": "var(--pui-control-h-sm)",
  "--pui-tabs-font-size": "var(--pui-font-size-1)",
  "--pui-tabs-padding-x": "var(--pui-space-1)",
} as React.CSSProperties;

/* The lift. A neutral thumb needs an edge the tinted default did not, and
 * there is no `--pui-tabs-indicator-shadow` knob to set — but the Indicator
 * takes a `className`, and the utilities layer beats the component's own.
 * Dropped under forced colours anyway, where box-shadow is forced to `none`. */
const TAB_INDICATOR = "shadow-1";

/* `flex-1 min-w-0` rather than the strip's own `flex: 0 0 auto`: these are
 * alternatives of equal weight, so they get equal width. Nothing here has to
 * position the indicator — Base UI measures the active tab at runtime, so it
 * follows whatever the flexbox settles on. */
const TAB = "flex-1 min-w-0 capitalize";

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
  root: { vars: Record<string, string>; data: Record<string, string> };
};

const STORAGE_KEY = "pui-studio";

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

  return {
    seed: hex(c.seed, DEFAULTS.seed),
    secondary: hex(c.secondary, DEFAULTS.secondary),
    tint: typeof c.tint === "number" && c.tint >= 0 && c.tint <= 1 ? c.tint : DEFAULTS.tint,
    radius: oneOf(c.radius, RADIUS, DEFAULTS.radius),
    density: oneOf(c.density, DENSITY, DEFAULTS.density),
    motion: oneOf(c.motion, MOTION, DEFAULTS.motion),
  };
}

/** Style + attributes that realise a config. Applied both to the scoped
 *  preview and to the document root, which the studio always re-themes. */
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
  const [copied, setCopied] = React.useState(false);
  // The stored config cannot seed useState: the server renders the defaults,
  // so reading storage during the first render would mismatch on hydration.
  // Everything that touches the document waits for this to flip.
  const [restored, setRestored] = React.useState(false);

  const set = <K extends keyof ThemeConfig>(k: K, v: ThemeConfig[K]) =>
    setCfg((c) => ({ ...c, [k]: v }));

  // Matched on both colours, because a preset sets both: change the secondary
  // by hand and the preset it came from is no longer what is on screen.
  const preset = PRESETS.find((p) => p.seed === cfg.seed && p.secondary === cfg.secondary);

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
    if (stored) setCfg(stored);
    setRestored(true);
  }, []);

  // Persist on every change, so the studio is where you left it — and so is
  // the rest of the docs, which the pre-paint script re-themes from the same
  // record before anything renders.
  React.useEffect(() => {
    if (!restored) return;
    const payload: StoredStudio = {
      config: cfg,
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
  }, [restored, cfg, attrs]);

  // Mirror onto <html> so the entire site — header, sidebar, prose, code —
  // re-themes live. That is the demonstration: the docs are built from the
  // same tokens the library ships.
  React.useEffect(() => {
    // Before the restore lands, `cfg` is still DEFAULTS while the root already
    // carries the stored theme from the pre-paint script — writing here would
    // flash the defaults over it.
    if (!restored) return;
    const root = document.documentElement;
    const dataKeys = ["puiRadius", "puiDensity", "puiMotion"] as const;

    Object.entries(attrs.style as Record<string, string>).forEach(([k, v]) => root.style.setProperty(k, v));
    root.dataset.puiRadius = attrs["data-pui-radius"] ?? "";
    root.dataset.puiDensity = attrs["data-pui-density"] ?? "";
    root.dataset.puiMotion = attrs["data-pui-motion"] ?? "";
    dataKeys.forEach((k) => { if (!root.dataset[k]) delete root.dataset[k]; });
  }, [restored, attrs]);

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
        <Appearance />

        <section className={GROUP}>
          <h3 className={GROUP_TITLE}>Presets</h3>
          {/* A ToggleGroup rather than a RadioGroup, for the reason `Radio`'s
            * own doc comment gives: a radio group selects as the arrow keys
            * move, and every selection here re-themes the entire document. A
            * toggle group moves focus and waits for Enter or Space.
            *
            * It also allows "nothing pressed", which is a state this control
            * genuinely has — edit either colour by hand and no preset is
            * current any more. A radio group has no way to express that. */}
          <ToggleGroup
            className="grid w-full grid-cols-2 gap-1"
            aria-label="Colour presets"
            value={preset ? [preset.name] : []}
            onValueChange={(names) => {
              // Pressing the pressed toggle empties the group. There is no
              // "no preset" theme to apply, so that is simply ignored.
              const next = PRESETS.find((p) => p.name === names[0]);
              if (next) setCfg((c) => ({ ...c, seed: next.seed, secondary: next.secondary }));
            }}
          >
            {PRESETS.map((p) => (
              <Toggle
                key={p.name}
                value={p.name}
                size="sm"
                // The toggle centres its content; a grid of them wants the
                // swatches lined up down the column instead.
                className="justify-start"
                style={{ "--swatch": p.seed, "--swatch2": p.secondary } as React.CSSProperties}
              >
                <span className={PRESET_SWATCH} aria-hidden="true" />
                {p.name}
              </Toggle>
            ))}
          </ToggleGroup>
        </section>

        <section className={GROUP}>
          <h3 className={GROUP_TITLE}>Brand colours</h3>
          <ColorField
            label="Primary"
            value={cfg.seed}
            onChange={(v) => set("seed", v)}
            swatches={PRESET_SEEDS}
          />
          <ColorField
            label="Secondary"
            value={cfg.secondary}
            onChange={(v) => set("secondary", v)}
            swatches={PRESET_SECONDARIES}
          />
        </section>

        <section className={GROUP}>
          <Slider.Root
            value={cfg.tint}
            onValueChange={(v) => set("tint", v)}
            min={0}
            max={1}
            step={0.05}
            format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
            // The default 16rem would stop short of the panel's edge. This is
            // the knob the component documents for exactly that.
            style={{ "--pui-slider-length": "100%" } as React.CSSProperties}
          >
            {/* Slider.Label renders a <div>, so `render` puts the panel's own
              * heading element back. It stays wired to the thumb's hidden input
              * by aria-labelledby either way — which is why the range input's
              * old aria-label is gone rather than moved. */}
            <Slider.Label render={<h3 />} className={cn(EYEBROW, "m-0")}>
              Neutral tint
            </Slider.Label>
            <Slider.Value className={HINT} />
            <Slider.Control>
              <Slider.Track>
                <Slider.Indicator />
                <Slider.Thumb />
              </Slider.Track>
            </Slider.Control>
          </Slider.Root>
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

/** Eight-bit sRGB back to the six-digit hex the studio stores.
 *
 *  The picker can emit eight digits — paste `#7c3aedcc` into its input and the
 *  alpha is real — and every consumer of a seed here wants six: `hexToOklch`,
 *  the stored config's own validation, and the CSS the studio prints. Alpha
 *  means nothing to a seed, so it is dropped once, at this boundary, rather
 *  than guarded against at each of them. */
function toHex({ r, g, b }: Rgba) {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("")}`;
}

function ColorField({
  label, value, onChange, swatches,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  swatches: readonly string[];
}) {
  return (
    <ColorPicker.Root
      value={value}
      onValueChange={(_, details) => onChange(toHex(details.rgba))}
      /* One notation, so the picker never hands back a string the studio's own
       * hex validation would reject — and so the format select has nothing to
       * offer and is left out of the popup below. */
      formats={["hex"]}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        {/* The trigger carries the label, so there is no separate <label> to
          * pair with it, and the swatch it draws is the value. The hex sits
          * beside the button rather than inside it: the trigger already
          * announces the colour in a visually hidden span, and a second copy
          * within the button would land in its accessible name twice. */}
        <ColorPicker.Trigger className="justify-start">{label}</ColorPicker.Trigger>
        <ColorPicker.Value />
      </div>
      <ColorPicker.Popup>
        <ColorPicker.Area />
        <ColorPicker.HueSlider />
        {/* The preset palette again, so the eight themes are reachable one
          * colour at a time — which is the whole point of opening this popup
          * on a studio that already has a preset grid. */}
        <ColorPicker.Swatches colors={swatches} label={`${label} presets`} />
        <ColorPicker.Row>
          <ColorPicker.Preview />
          <ColorPicker.Input />
        </ColorPicker.Row>
      </ColorPicker.Popup>
    </ColorPicker.Root>
  );
}

/**
 * Light ⇄ dark for the whole page, offered here as well as in the header —
 * this is the panel you are reading while you judge a seed, and the mode is
 * the one thing about the preview you cannot change from it.
 *
 * `data-theme` on <html> is the source of truth and it is written before first
 * paint, so the server has no way to know it and it cannot seed `useState`.
 * `null` until mount is the honest answer rather than a guess: Base UI keeps
 * the indicator hidden until it has something to measure, so the strip comes up
 * unselected for a frame instead of flashing the wrong mode — which is the same
 * bug the header toggle avoids by holding no state at all.
 *
 * The attribute is also watched rather than mirrored, because three other
 * things write it: the header toggle, the pre-paint script, and the OS
 * listener that follows `prefers-color-scheme` while no choice is stored.
 * Observing what they all write is what keeps this strip right whoever moved it.
 */
function Appearance() {
  const [theme, setTheme] = React.useState<DocTheme | null>(null);

  React.useEffect(() => {
    const root = document.documentElement;
    const read = () => setTheme(getDocumentTheme());
    read();
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  // No local write-back: `setDocumentTheme` moves the attribute and the
  // observer above brings the value home, so there is one path in and out.
  return <Choice label="Appearance" options={THEME} value={theme} onChange={setDocumentTheme} />;
}

function Choice<T extends string>({
  label, options, value, onChange,
}: {
  label: string;
  options: readonly T[];
  /* `null` is a legal Tabs value and is deliberately not normalised away — it
   * is what `Appearance` renders until it has read the document. */
  value: T | null;
  onChange: (v: T) => void;
}) {
  return (
    <section className={GROUP}>
      <h3 className={GROUP_TITLE}>{label}</h3>
      {/* A tab strip with no panels beneath it. These pick a setting rather
        * than switch between regions, so there is nothing for a Tab's
        * `aria-controls` to point at — the strip is named by `aria-label` and
        * the tablist's own "1 of 4" is what a screen reader reads out.
        *
        * What it buys is the indicator: Base UI measures the active tab and
        * publishes its geometry, so the pill slides without this file
        * computing a single offset. */}
      <Tabs.Root
        value={value}
        onValueChange={(next) => onChange(next as T)}
        variant="pill"
        style={TAB_VARS}
      >
        <Tabs.List className="w-full" aria-label={label}>
          {options.map((o) => (
            <Tabs.Tab key={o} value={o} className={TAB}>
              {o}
            </Tabs.Tab>
          ))}
          <Tabs.Indicator className={TAB_INDICATOR} />
        </Tabs.List>
      </Tabs.Root>
    </section>
  );
}
