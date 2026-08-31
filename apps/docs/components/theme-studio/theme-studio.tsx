"use client";

import * as React from "react";
import { Button } from "@forte-ui/react";
import { SANS_FONTS, MONO_FONTS, findFont } from "./fonts";
import { hexToOklch, bestOnColor } from "@/lib/color";
import { EYEBROW } from "@/components/styles";
import { cn } from "@/lib/cn";
import { ThemeConfigurator } from "./theme-configurator";
import { configToAttrs, useThemeConfig, type ThemeConfig } from "./theme-config";

/* The Theme Studio PAGE: the configurator beside a live preview and the CSS
 * the theme exports. The controls themselves live in `theme-configurator.tsx`
 * — the header's theme drawer renders the same component on every page — and
 * the state behind them in `theme-config.ts`, so this file only reads the
 * config: everything it renders is derived, and every edit arrives through
 * the shared store whichever mount it was made in. */

const GROUP_TITLE = cn(EYEBROW, "m-0 flex items-baseline justify-between");

const RAMP = "grid h-[2.25rem] grid-cols-12 gap-[2px] overflow-hidden rounded-3";

function toCss(cfg: ThemeConfig) {
  const seedO = hexToOklch(cfg.seed);
  const secO = hexToOklch(cfg.secondary);
  const on = seedO ? bestOnColor(seedO) : null;
  const onSec = secO ? bestOnColor(secO) : null;
  const sans = findFont(SANS_FONTS, cfg.fontSans);
  const mono = findFont(MONO_FONTS, cfg.fontMono);

  const attrs = [
    cfg.radius !== "default" && `data-forte-radius="${cfg.radius}"`,
    cfg.density !== "default" && `data-forte-density="${cfg.density}"`,
    cfg.motion !== "default" && `data-forte-motion="${cfg.motion}"`,
  ].filter(Boolean);

  /* @import must precede every other statement in a stylesheet, so the font
   * loads lead the block. Google Fonts is the preview's host, not a
   * requirement — the comment says so because the copied CSS is the one part
   * of the studio that leaves the site. */
  const imports = [sans, mono]
    .filter((f) => f.css)
    .map((f) => `@import url("${f.css}");`);

  const lines = [
    ...(imports.length ? [`/* Or self-host these — any @font-face works. */`, ...imports, ``] : []),
    `:root {`,
    `  --forte-accent-seed: ${cfg.seed};`,
    `  --forte-secondary-seed: ${cfg.secondary};`,
    cfg.tint !== 1 ? `  --forte-neutral-tint: ${cfg.tint};` : null,
    sans.stack ? `  --forte-font-sans: ${sans.stack};` : null,
    mono.stack ? `  --forte-font-mono: ${mono.stack};` : null,
    ``,
    `  /* Measured rather than derived, so it is exact in every browser. */`,
    on ? `  --forte-color-on-primary: ${on.color};` : null,
    onSec ? `  --forte-color-on-secondary: ${onSec.color};` : null,
    `}`,
  ].filter((l) => l !== null);

  const html = attrs.length ? `\n\n<!-- on <html> -->\n<html ${attrs.join(" ")}>` : "";
  return lines.join("\n") + html;
}

export function ThemeStudio() {
  const [cfg] = useThemeConfig();
  const [copied, setCopied] = React.useState(false);

  const attrs = React.useMemo(() => configToAttrs(cfg), [cfg]);

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const css = toCss(cfg);

  return (
    <div className="grid grid-cols-[19rem_minmax(0,1fr)] items-start gap-5 max-two-col:grid-cols-[minmax(0,1fr)]">
      <ThemeConfigurator
        className={cn(
          "rounded-surface border border-border-muted bg-panel p-5",
          // Sticky beside the preview on a wide screen; once the two columns
          // stack there is nothing to stay level with, and a pinned panel would
          // just eat the viewport.
          "sticky top-[4.5rem] max-h-[calc(100dvh-6rem)] overflow-y-auto",
          "max-two-col:static max-two-col:max-h-none",
        )}
      />

      <div className="grid gap-4">
        {/* The preview carries the config on its own scope as well — redundant
          * while every edit also lands on <html>, but it is what keeps this
          * frame honest as A PREVIEW: it shows the config it was handed, not
          * whatever happens to be on the document. */}
        <div
          className="grid gap-4 rounded-surface border border-border-muted bg-background p-surface text-foreground forte-theme"
          style={attrs.style}
          data-forte-radius={attrs["data-forte-radius"]}
          data-forte-density={attrs["data-forte-density"]}
          data-forte-motion={attrs["data-forte-motion"]}
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

          {/* Type specimen — where the two font pickers become visible. The
            * buttons above set little text at one size; this runs both stacks
            * through weights, sizes and figures so a swap actually shows. */}
          <div className="grid gap-1">
            <p className="m-0 text-4 font-semibold">Sphinx of black quartz, judge my vow.</p>
            <p className="m-0 text-2 text-foreground-muted">
              The quick brown fox jumps over the lazy dog — 0123456789
            </p>
            <code className="mt-1 w-fit rounded-3 bg-panel px-2 py-1 font-mono text-1">
              npm install @forte-ui/react
            </code>
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
          style={{ background: `var(--forte-${name}-${i + 1})` }}
        />
      ))}
    </div>
  );
}
