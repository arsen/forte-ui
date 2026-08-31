"use client";

import * as React from "react";
import {
  ColorPicker,
  Select,
  Slider,
  Tabs,
  Toggle,
  ToggleGroup,
  type Rgba,
} from "@forte-ui/react";
import { SANS_FONTS, MONO_FONTS, ensureFontLink, type FontOption } from "./fonts";
import {
  hexToOklch,
  oklchToLinear,
  bestOnColor,
  validateSeed,
  contrast,
  type Oklch,
} from "@/lib/color";
import { EYEBROW } from "@/components/styles";
import { getDocumentTheme, setDocumentTheme, type DocTheme } from "@/components/theme-mode";
import { cn } from "@/lib/cn";
import {
  DENSITY,
  MOTION,
  RADIUS,
  useThemeConfig,
  type ThemeConfig,
} from "./theme-config";

/* The theme controls — every knob, and nothing else. This is the column the
 * Theme Studio page shows beside its preview, and the same component the
 * header's theme drawer renders on every other page; the panel chrome
 * (border, stickiness, drawer surface) belongs to whoever mounts it. State
 * lives in `theme-config.ts`, shared across mounts, so the two never
 * disagree about what the current theme is. */

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

/* Deliberately NOT part of `ThemeConfig`, and it is worth saying why:
 * light/dark is a reader preference, stored under its own `forte-theme` key
 * and shared with the pre-paint script, while everything in ThemeConfig is
 * part of the theme the studio EXPORTS. Both modes are already built from the
 * same seed, so there is nothing here to put in the copied CSS — this strip
 * only decides which of the two you are looking at. */
const THEME: readonly DocTheme[] = ["light", "dark"];

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
  "size-[1.1rem] flex-none rounded-(--forte-radius-full)",
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
 * `--forte-tabs-content-gap` is the load-bearing one. Tabs.Root is a two-row grid
 * whose second row holds the panels, and a gutter is drawn between two explicit
 * tracks whether or not the second one has anything in it — so a panelless
 * strip would sit on top of a rem of dead space.
 *
 * The two surfaces have to move together, and the reason is the surface ramp.
 * The `pill` defaults are a `--forte-color-panel` strip (gray-2) with a
 * `--forte-color-primary-soft` thumb (accent-3), and they are tuned for a strip
 * sitting on the page: gray-1 page, gray-2 strip, tinted thumb, each step
 * lifting off the one under it. This panel is ALREADY gray-2, so that stack
 * starts one rung too low — the strip disappears into the panel, and moving
 * only the strip up to gray-4 puts accent-3 BELOW its own track, which is what
 * turns the thumb into a hole in dark mode rather than a raised segment.
 *
 * So the strip recesses to gray-4 and the thumb comes back out to gray-1 — the
 * far end of the scale in both modes, near-white on light and near-black on
 * dark, which is the one pairing that reads the same way in each. The accent
 * is not lost with it: `--forte-tabs-tab-color-active` already puts the active
 * label in `--forte-color-primary-text`, so the colour lands on the word instead
 * of the box behind it. Under forced colours none of this applies — the a11y
 * block paints the indicator `Highlight` outright.
 *
 * The rest is fit. The narrowest column this panel ships in is the studio's
 * 19rem, and four segments at the default control height and label size do
 * not cross it.
 * ------------------------------------------------------------------------ */

const TAB_VARS = {
  "--forte-tabs-content-gap": "0px",
  "--forte-tabs-list-bg": "var(--forte-color-panel-active)",
  "--forte-tabs-indicator-color": "var(--forte-color-background)",
  "--forte-tabs-height": "var(--forte-control-h-sm)",
  "--forte-tabs-font-size": "var(--forte-font-size-1)",
  "--forte-tabs-padding-x": "var(--forte-space-1)",
} as React.CSSProperties;

/* The lift. A neutral thumb needs an edge the tinted default did not, and
 * there is no `--forte-tabs-indicator-shadow` knob to set — but the Indicator
 * takes a `className`, and the utilities layer beats the component's own.
 * Dropped under forced colours anyway, where box-shadow is forced to `none`. */
const TAB_INDICATOR = "shadow-1";

/* `flex-1 min-w-0` rather than the strip's own `flex: 0 0 auto`: these are
 * alternatives of equal weight, so they get equal width. Nothing here has to
 * position the indicator — Base UI measures the active tab at runtime, so it
 * follows whatever the flexbox settles on. */
const TAB = "flex-1 min-w-0 capitalize";

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

export function ThemeConfigurator({ className }: { className?: string }) {
  const [cfg, setThemeConfig] = useThemeConfig();

  const set = <K extends keyof ThemeConfig>(k: K, v: ThemeConfig[K]) =>
    setThemeConfig({ ...cfg, [k]: v });

  // Matched on both colours, because a preset sets both: change the secondary
  // by hand and the preset it came from is no longer what is on screen.
  const preset = PRESETS.find((p) => p.seed === cfg.seed && p.secondary === cfg.secondary);

  const seedO = hexToOklch(cfg.seed);
  const warnings = seedO
    ? validateSeed(seedO)
    : [{ level: "warn" as const, message: "Not a valid hex colour." }];
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

  return (
    <div className={cn("grid gap-5", className)}>
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
            if (next) setThemeConfig({ ...cfg, seed: next.seed, secondary: next.secondary });
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
          style={{ "--forte-slider-length": "100%" } as React.CSSProperties}
          /* A full-length track plus a centre-aligned thumb means the thumb
           * overhangs the control by half its width at either end — fine in
           * the studio's padded panel, sliced off in the drawer, where the
           * clipping edge is `Drawer.Content`'s scroll container. `edge`
           * insets the resting positions so the thumb's outer edge lands ON
           * the control's edge, keeping it whole in any mount. */
          thumbAlignment="edge"
        >
          {/* Slider.Label renders a <div>, so `render` puts the panel's own
            * heading element back. It stays wired to the thumb's hidden input
            * by aria-labelledby either way — which is why the range input's
            * old aria-label is gone rather than moved. */}
          <Slider.Label render={<h3 />} className={cn(EYEBROW, "m-0")}>
            Neutral tint
          </Slider.Label>
          <Slider.Value className={HINT} />
          {/* `edge` above keeps the THUMB inside the control, but the hover
            * halo is a box-shadow ringing 5px past it, and at either end that
            * ring still crossed the control's edge into the drawer's clip.
            * Inline padding of exactly the halo radius reserves the ring's
            * room — and Base UI measures the control's inline padding as part
            * of edge alignment, so the resting positions move inward with it
            * rather than needing a second correction. */}
          <Slider.Control className="px-(--forte-slider-thumb-halo-size-active)">
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
        <h3 className={GROUP_TITLE}>Typography</h3>
        <FontField
          label="Sans"
          options={SANS_FONTS}
          value={cfg.fontSans}
          onChange={(v) => set("fontSans", v)}
        />
        <FontField
          label="Mono"
          options={MONO_FONTS}
          value={cfg.fontMono}
          onChange={(v) => set("fontMono", v)}
        />
        <p className={HINT}>Fonts load from Google Fonts; the copied CSS shows how.</p>
      </section>

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
          * on a panel that already has a preset grid. */}
        <ColorPicker.Swatches colors={swatches} label={`${label} presets`} />
        <ColorPicker.Row>
          <ColorPicker.Preview />
          <ColorPicker.Input />
        </ColorPicker.Row>
      </ColorPicker.Popup>
    </ColorPicker.Root>
  );
}

function FontField({
  label, options, value, onChange,
}: {
  label: string;
  options: readonly FontOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  /* `items` gives Select.Value its text without a render function; name is
   * both key and label, which is also why the config stores names. */
  const items = React.useMemo(
    () => Object.fromEntries(options.map((f) => [f.name, f.name])),
    [options],
  );

  return (
    <Select.Root
      items={items}
      value={value}
      onValueChange={(v) => onChange(v as string)}
      /* Each item renders in its own face, but ten full families is megabytes
       * — so opening the popup loads the `preview` stylesheets instead, each
       * subsetted to exactly the glyphs of its family's name. A few KB, once;
       * ensureFontLink dedupes reopenings. Until one arrives the item shows
       * the fallback stack, which is what `display=swap` is for. */
      onOpenChange={(open) => {
        if (!open) return;
        for (const f of options) if (f.preview) ensureFontLink(f.preview);
      }}
    >
      <div className="grid grid-cols-[3rem_minmax(0,1fr)] items-center gap-2">
        {/* mb-0: the label's own gap-below is for the stacked layout it
          * usually sits in; this one shares a grid row with its trigger. */}
        <Select.Label className="mb-0">{label}</Select.Label>
        <Select.Trigger fullWidth>
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
      </div>
      <Select.Popup>
        {options.map((f) => (
          <Select.Item
            key={f.name}
            value={f.name}
            style={f.stack ? { fontFamily: f.stack } : undefined}
          >
            {f.name}
          </Select.Item>
        ))}
      </Select.Popup>
    </Select.Root>
  );
}

/**
 * Light ⇄ dark for the whole page, offered here because this is the panel you
 * are reading while you judge a seed, and the mode is the one thing about the
 * page you cannot change from the other controls.
 *
 * `data-theme` on <html> is the source of truth and it is written before first
 * paint, so the server has no way to know it and it cannot seed `useState`.
 * `null` until mount is the honest answer rather than a guess: Base UI keeps
 * the indicator hidden until it has something to measure, so the strip comes up
 * unselected for a frame instead of flashing the wrong mode.
 *
 * The attribute is also watched rather than mirrored, because other things
 * write it too: the pre-paint script, the OS listener that follows
 * `prefers-color-scheme` while no choice is stored, and any second mounted
 * copy of this strip. Observing what they all write is what keeps this strip
 * right whoever moved it.
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
