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
import styles from "./theme-studio.module.css";

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
    <span className={styles.ratio} data-level={level}>
      {value.toFixed(2)}:1 <b>{level}</b>
    </span>
  );
}

export function ThemeStudio() {
  const [cfg, setCfg] = React.useState<ThemeConfig>(DEFAULTS);
  const [applyToSite, setApplyToSite] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

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

  const attrs = configToAttrs(cfg);

  // Mirror onto <html> so the entire site — header, sidebar, prose, code —
  // re-themes live. That is the demonstration: the docs are built from the
  // same tokens the library ships.
  React.useEffect(() => {
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
  }, [applyToSite, attrs]);

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const css = toCss(cfg);

  return (
    <div className={styles.studio}>
      <div className={styles.controls}>
        <section className={styles.group}>
          <h3 className={styles.groupTitle}>Presets</h3>
          <div className={styles.presets}>
            {PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                className={`${styles.preset} pui-focus-ring`}
                data-active={cfg.seed === p.seed || undefined}
                style={{ "--swatch": p.seed, "--swatch2": p.secondary } as React.CSSProperties}
                onClick={() => setCfg((c) => ({ ...c, seed: p.seed, secondary: p.secondary }))}
                aria-label={`${p.name} preset`}
                title={p.name}
              >
                <span className={styles.presetSwatch} aria-hidden="true" />
                {p.name}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.group}>
          <h3 className={styles.groupTitle}>Brand colours</h3>
          <ColorField label="Primary" value={cfg.seed} onChange={(v) => set("seed", v)} />
          <ColorField label="Secondary" value={cfg.secondary} onChange={(v) => set("secondary", v)} />
        </section>

        <section className={styles.group}>
          <h3 className={styles.groupTitle}>
            Neutral tint <span className={styles.hint}>{cfg.tint.toFixed(2)}</span>
          </h3>
          <input
            className={styles.slider}
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={cfg.tint}
            onChange={(e) => set("tint", Number(e.target.value))}
            aria-label="Neutral tint: how much of the brand hue bleeds into the greys"
          />
          <p className={styles.hint}>How much of the brand hue bleeds into the greys. 0 is pure neutral.</p>
        </section>

        <Choice label="Radius" options={RADIUS} value={cfg.radius} onChange={(v) => set("radius", v)} />
        <Choice label="Density" options={DENSITY} value={cfg.density} onChange={(v) => set("density", v)} />
        <Choice label="Motion" options={MOTION} value={cfg.motion} onChange={(v) => set("motion", v)} />

        <section className={styles.group}>
          <h3 className={styles.groupTitle}>Contrast</h3>
          <dl className={styles.readout}>
            <dt>Text on solid fill</dt>
            <dd>{on ? <Ratio value={on.ratio} /> : "—"}</dd>
            <dt>Accent text on background</dt>
            <dd>{textRatio ? <Ratio value={textRatio} /> : "—"}</dd>
          </dl>
          {on ? (
            <p className={styles.hint}>
              Auto-contrast picked <b>{on.color}</b> text.
            </p>
          ) : null}
          {warnings.map((w) => (
            <p key={w.message} className={styles.warning} data-level={w.level}>
              {w.message}
            </p>
          ))}
        </section>

        <label className={styles.applyRow}>
          <input
            type="checkbox"
            checked={applyToSite}
            onChange={(e) => setApplyToSite(e.target.checked)}
          />
          <span>
            <b>Apply to this whole site</b>
            <span className={styles.hint}>Re-themes the docs live — header, nav, prose and code.</span>
          </span>
        </label>
      </div>

      <div className={styles.previewCol}>
        <div
          className={`${styles.preview} pui-theme`}
          style={attrs.style}
          data-pui-radius={attrs["data-pui-radius"]}
          data-pui-density={attrs["data-pui-density"]}
          data-pui-motion={attrs["data-pui-motion"]}
        >
          <Ramp name="accent" />
          <Ramp name="secondary" />
          <Ramp name="gray" />

          <div className={styles.previewRow}>
            <Button>Primary</Button>
            <Button tone="secondary">Secondary</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button tone="danger">Delete</Button>
          </div>
          <div className={styles.previewRow}>
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button loading>Saving</Button>
            <Button disabled>Disabled</Button>
          </div>
        </div>

        <figure className={styles.output} data-code-root>
          <figcaption className={styles.outputTitle}>
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
          <pre className={styles.outputCode}>{css}</pre>
        </figure>
      </div>
    </div>
  );
}

function Ramp({ name }: { name: string }) {
  return (
    <div className={styles.ramp} role="img" aria-label={`${name} ramp, 12 steps`}>
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} style={{ background: `var(--pui-${name}-${i + 1})` }} />
      ))}
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = React.useId();
  return (
    <div className={styles.colorField}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="color"
        value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className={styles.colorSwatch}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.colorText}
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
    <section className={styles.group}>
      <h3 className={styles.groupTitle}>{label}</h3>
      {/* A radiogroup rather than a Tabs strip: these pick a setting, they do
        * not switch between panels, so arrow keys move between options and the
        * selection is announced as a radio rather than a tab. The sliding
        * thumb is Tabs' indicator idea reused — see the stylesheet; the count
        * and the active index are all the CSS needs to place it. */}
      <div
        className={styles.segmented}
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
            className={`${styles.segment} pui-focus-ring`}
            data-active={value === o || undefined}
            onClick={() => onChange(o)}
          >
            {o}
          </button>
        ))}
        {/* The thumb. Absolutely positioned, so its place in the DOM is free —
          * it sits last, after the options it decorates. */}
        <span className={styles.segmentIndicator} aria-hidden="true" />
      </div>
    </section>
  );
}
