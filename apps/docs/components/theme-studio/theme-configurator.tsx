"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import {
  Button,
  ColorPicker,
  Dialog,
  Field,
  Input,
  InputGroup,
  Select,
  Separator,
  Slider,
  Switch,
  Tabs,
  ThemeToggle,
  Toggle,
  ToggleGroup,
  useTheme,
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
import { cn } from "@/lib/cn";
import {
  DENSITY,
  MOTION,
  PACKAGE_MANAGERS,
  RADIUS,
  SCHEME,
  toScaffoldCommand,
  useThemeConfig,
  type PackageManager,
  type Scheme,
  type ThemeConfig,
} from "./theme-config";

/* The theme controls — every knob, and nothing else. This is the column the
 * Theme Studio page shows beside its preview, and the same component the
 * header's theme drawer renders on every other page; the panel chrome
 * (border, padding, drawer surface) belongs to whoever mounts it. State
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
  { name: "Indigo", seed: "#4f46e5", secondary: "#ca8a04" },
  { name: "Grape", seed: "#9333ea", secondary: "#16a34a" },
  { name: "Scarlet", seed: "#b91c1c", secondary: "#155e75" },
  { name: "Lagoon", seed: "#0d9488", secondary: "#9d174d" },
  { name: "Moss", seed: "#4d7c0f", secondary: "#6d28d9" },
  { name: "Flamingo", seed: "#db2777", secondary: "#059669" },
  { name: "Cobalt", seed: "#1d4ed8", secondary: "#ea580c" },
  { name: "Orchid", seed: "#c026d3", secondary: "#0891b2" },
  { name: "Lime", seed: "#65a30d", secondary: "#a21caf" },
  { name: "Copper", seed: "#92400e", secondary: "#2a6f97" },
  { name: "Plum", seed: "#86198f", secondary: "#5c7c0a" },
  { name: "Coral", seed: "#e0533f", secondary: "#1f6f5c" },
];

/* The same twenty colours again, as the two flat lists `ColorPicker.Swatches`
 * wants. Built from PRESETS rather than written out, so the picker's palette
 * cannot drift from the preset grid above it. */
const PRESET_SEEDS = PRESETS.map((p) => p.seed);
const PRESET_SECONDARIES = PRESETS.map((p) => p.secondary);

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
      {/* The panel's one ACTION leads, and a rule sets it apart from the
        * settings under it. It used to close the column, which in the header
        * drawer put it a full screen of controls below the fold — the reader
        * who never scrolls past the fonts never learns the theme can leave
        * the site. The rule is decorative: the headings already name the
        * groups, so announcing a boundary here would only read decoration
        * aloud. */}
      <Scaffold cfg={cfg} />
      <Separator decorative />

      <Appearance scheme={cfg.scheme} onChange={(v) => set("scheme", v)} />

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
              // The surface radius, for the reason the command box below
              // gives — a numbered step ignores the soft and pill presets.
              "m-0 rounded-surface p-2 text-1 leading-[1.45]",
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

/**
 * The theme as a project: one command that hands the whole config to
 * `create-forte-ui`, which scaffolds a new app already wearing it. The theme
 * half of the command comes from the shared config; the PROJECT half —
 * name, framework, Tailwind — is nothing the studio knows, so the button
 * opens a dialog that asks, then shows the finished command before it is
 * copied: the studio's rule is that an export is something you can read
 * before you run. It lives here rather than on the studio page so the header
 * drawer offers it on every page too — at the top of the panel, where the
 * drawer shows it without scrolling.
 */
function Scaffold({ cfg }: { cfg: ThemeConfig }) {
  const [copied, setCopied] = React.useState(false);
  const [name, setName] = React.useState("my-app");
  const [framework, setFramework] = React.useState<"next" | "vite">("next");
  const [tailwind, setTailwind] = React.useState(true);
  const [packageManager, setPackageManager] = React.useState<PackageManager>("pnpm");

  /* The command is pasted into a shell, so the name never gets to carry
   * quoting problems: spaces become the dashes the CLI would demand anyway,
   * everything else invalid is dropped, and empty falls back to the
   * placeholder. The input itself is left as typed — correcting a field
   * while someone is typing in it is how "my-app" becomes "myapp". */
  const safeName =
    name.trim().toLowerCase().replaceAll(/\s+/g, "-").replaceAll(/[^a-z0-9._-]/g, "") || "my-app";
  const command = toScaffoldCommand(cfg, { name: safeName, framework, tailwind, packageManager });

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch { /* clipboard may be blocked; the command stays selectable */ }
  };

  return (
    <section className={GROUP}>
      <h3 className={GROUP_TITLE}>Start a project</h3>
      <Dialog.Root onOpenChange={(open) => { if (!open) setCopied(false); }}>
        <Dialog.Trigger render={<Button size="sm" variant="soft" tone="neutral" fullWidth />}>
          Scaffold this theme…
        </Dialog.Trigger>
        <Dialog.Popup size="sm">
          <Dialog.Title>Scaffold this theme</Dialog.Title>
          <Dialog.Description>
            One command hands the theme to <code className="font-mono text-2">create-forte-ui</code>,
            which scaffolds a new app already wearing it.
          </Dialog.Description>

          <Field.Root name="scaffold-project">
            <Field.Label>Project name</Field.Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="my-app" />
          </Field.Root>

          <div className="grid gap-2">
            {/* The same panelless tab strip as the panel's Choice rows, and
              * for the same reason — the indicator geometry comes measured
              * from Base UI. Not Choice itself only because these values wear
              * display names their flag values do not — which is also why
              * TAB's `capitalize` is dropped: it would title-case "Next.js"
              * into "Next.Js". */}
            <h4 className={GROUP_TITLE}>Framework</h4>
            <Tabs.Root
              value={framework}
              onValueChange={(v) => setFramework(v as "next" | "vite")}
              variant="pill"
              style={TAB_VARS}
            >
              <Tabs.List className="w-full" aria-label="Framework">
                <Tabs.Tab value="next" className="min-w-0 flex-1">
                  Next.js
                </Tabs.Tab>
                <Tabs.Tab value="vite" className="min-w-0 flex-1">
                  Vite
                </Tabs.Tab>
                <Tabs.Indicator className={TAB_INDICATOR} />
              </Tabs.List>
            </Tabs.Root>
          </div>

          <Field.Root name="scaffold-tailwind">
            <Field.Label>
              <Switch checked={tailwind} onCheckedChange={setTailwind} />
              Tailwind
            </Field.Label>
            <Field.Description>
              Wires the token bridge, so utilities follow the theme too.
            </Field.Description>
          </Field.Root>

          {/* The manager sits ON the command rather than among the questions
            * above: it changes the line's spelling, not the project, and the
            * CLI then carries the choice through — it installs and runs the
            * framework scaffold with whichever manager invoked it. The strip
            * is the Framework one again (and again not `Segmented`, whose
            * `capitalize` would print "Pnpm"), tight against the box, so
            * the two read as one control: pick a manager, read the line. */}
          <div className="grid gap-1">
            <Tabs.Root
              value={packageManager}
              onValueChange={(v) => setPackageManager(v as PackageManager)}
              variant="pill"
              style={TAB_VARS}
            >
              <Tabs.List className="w-full" aria-label="Package manager">
                {PACKAGE_MANAGERS.map((pm) => (
                  <Tabs.Tab key={pm} value={pm} className="min-w-0 flex-1">
                    {pm}
                  </Tabs.Tab>
                ))}
                <Tabs.Indicator className={TAB_INDICATOR} />
              </Tabs.List>
            </Tabs.Root>
            {/* A read-only field rather than a <pre>: it is a form control,
              * so it wears the control radius and height the Input above it
              * does, scrolls a long line the way a shell would, and gives
              * keyboard users a caret to select from. The copy button lives
              * INSIDE the boundary, the way the library's own copy-link
              * demo does it — the field and its action are one thing.
              *
              * Focus selects the whole line, because the only reason to land
              * here is to take the command: with the button beside it a
              * select-all is what a keyboard reader would do next anyway. */}
            <InputGroup.Root fullWidth>
              <InputGroup.Input
                readOnly
                value={command}
                aria-label="Scaffold command"
                className="font-mono text-1"
                onFocus={(e) => e.currentTarget.select()}
              />
              <InputGroup.Addon align="inline-end">
                <InputGroup.Button iconOnly aria-label="Copy command" onClick={copy}>
                  {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                </InputGroup.Button>
              </InputGroup.Addon>
            </InputGroup.Root>
            {/* The icon swap is the sighted confirmation; this is the one a
              * screen reader gets. */}
            <span aria-live="polite" className="forte-visually-hidden">
              {copied ? "Command copied" : ""}
            </span>
          </div>

          <Dialog.Footer>
            <Dialog.Close render={<Button variant="soft" tone="neutral" />}>Close</Dialog.Close>
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog.Root>
      <p className={HINT}>A new app — Vite or Next.js, Tailwind optional — themed like this one.</p>
    </section>
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
        {/* The preset palette again, so the preset themes are reachable one
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
 * Which palettes the theme ships with a way to reach — and, while it ships
 * both, which one you are looking at.
 *
 * The strip is the exported half. "system" is the library's default: the
 * page follows the OS and the scaffold gets a toggle. "light" / "dark" pin
 * one palette on `<html>` through the same `data-theme` attribute a toggle
 * would write, only static, and the scaffold leaves the toggle and its replay
 * script out. The pin lands on this document too, so the site is the
 * preview: a "light only" theme is judged on a light page whatever the
 * machine prefers, and the copied CSS and the command both carry it.
 *
 * The toggle is the reader's half, and it shows only under "system". Pinned,
 * there is nothing for it to switch — and a button that could flip the page
 * against the one palette the theme exports would misreport what is being
 * designed. It is the library's own `ThemeToggle`, uncontrolled, rather than
 * a fourth segment on the strip: light/dark here is a reader preference,
 * stored under the `forte-theme` key the pre-paint script in `layout.tsx`
 * replays, and the uncontrolled toggle writes exactly that key and the
 * `data-theme` attribute beside it — so it, the OS listener, and a second
 * mounted copy of this panel all move the same two things and never
 * disagree. Both palettes are built from the same seed either way; the
 * toggle only decides which of the two you are looking at.
 *
 * The toggle is icon-only, and a sun or moon beside a heading reading
 * "Appearance" could be read as a statement of where you are. The label next
 * to it names the ACTION instead — "Switch to dark" — and it is a real
 * `<label for>`, so it is the button's accessible name (SC 2.5.3 satisfied by
 * construction) and clicking the words presses the button.
 *
 * The label text comes from `useTheme`, which is a compromise the toggle
 * itself does not make: its icons are picked by CSS off `data-theme`, so they
 * are right in the server HTML, while `resolvedTheme` is `"light"` on the
 * server and corrects itself once the store's client snapshot lands. A reader
 * on a dark page therefore gets "Switch to dark" in the raw HTML and the
 * right label a beat after hydration — a small cost in a panel that opens on
 * demand, and the price of a label that reads as text rather than as two
 * CSS-toggled spans.
 */
function Appearance({ scheme, onChange }: { scheme: Scheme; onChange: (v: Scheme) => void }) {
  const { resolvedTheme } = useTheme();
  const id = React.useId();

  return (
    <section className={GROUP}>
      <h3 className={GROUP_TITLE}>Appearance</h3>
      <Segmented label="Colour scheme" options={SCHEME} value={scheme} onChange={onChange} />
      {scheme === "system" ? (
        /* Toggle before label: the button sits on the strip's leading edge,
         * where the segment it belongs to starts, and the words read as its
         * caption rather than as a sentence the button finishes. */
        <div className="flex items-center gap-2">
          <ThemeToggle id={id} variant="outline" />
          {/* `cursor-pointer` because this label performs the action (see the
            * pointer-affordance rule): a click on it presses the toggle. */}
          <label htmlFor={id} className="cursor-pointer select-none text-2 text-foreground">
            Switch to {resolvedTheme === "dark" ? "light" : "dark"}
          </label>
        </div>
      ) : (
        <p className={HINT}>
          Every visitor gets the {scheme} palette. The scaffold pins it on {"<html>"} and leaves
          the toggle out.
        </p>
      )}
    </section>
  );
}

function Choice<T extends string>({
  label, options, value, onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <section className={GROUP}>
      <h3 className={GROUP_TITLE}>{label}</h3>
      <Segmented label={label} options={options} value={value} onChange={onChange} />
    </section>
  );
}

/* A tab strip with no panels beneath it. These pick a setting rather than
 * switch between regions, so there is nothing for a Tab's `aria-controls` to
 * point at — the strip is named by `aria-label` and the tablist's own "1 of
 * 4" is what a screen reader reads out.
 *
 * What it buys is the indicator: Base UI measures the active tab and
 * publishes its geometry, so the pill slides without this file computing a
 * single offset.
 *
 * Its own component, separate from the section `Choice` wraps it in, for
 * the one group that wants the strip UNDER a heading it does not own — the
 * Appearance section, whose heading covers the toggle beside it too. */
function Segmented<T extends string>({
  label, options, value, onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
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
  );
}
