"use client";

import * as React from "react";
import { PRESETS, useThemeConfig } from "@/components/theme-studio/theme-config";

/* The five the hero offers, resolved from the studio's own list rather than
 * restated here. The two are one control seen twice now that a swatch writes
 * the shared theme record, so a colour that drifted between two copies of the
 * list would theme the page and light nothing up at either end. */
const HERO_PRESETS = ["Ocean", "Violet", "Forest", "Ember", "Rose"].flatMap((name) =>
  PRESETS.filter((p) => p.name === name),
);

/* One swatch.
 *
 * Colour IS the content of this control, so it opts out of forced-colors
 * substitution and supplies its own boundary — otherwise five identical system
 * -coloured pills.
 *
 * The transition is written as an arbitrary property rather than as
 * `transition-[scale,border-color]` because the two halves run on different
 * clocks: the scale is a spring and must be paired with its own duration token,
 * while the border is a plain colour change. One shared duration would truncate
 * the spring mid-bounce.
 *
 * The hover scale is gated on `--forte-motion-ok` by hand, which is the rule for
 * literal geometry — the token is 1 normally and 0 under reduced motion, so
 * this collapses to `scale(1)` with no media query. */
const SWATCH = [
  "h-[1.75rem] w-(--forte-target-comfortable) cursor-pointer p-0",
  "rounded-pill border border-border bg-[linear-gradient(110deg,var(--a)_55%,var(--b)_55%)]",
  "[forced-color-adjust:none]",
  "[transition:scale_var(--forte-duration-spring-snappy)_var(--forte-ease-spring-snappy),border-color_var(--forte-duration-fast)_var(--forte-ease-standard)]",
  "hover:scale-[calc(1_+_0.08_*_var(--forte-motion-ok))]",
  "aria-checked:border-2 aria-checked:border-foreground",
  "forte-focus-ring",
].join(" ");

/** How long the cross-fade lasts, read off the token rather than restated.
 *
 *  `--forte-duration-slow` is 400ms normally and 150ms under both
 *  `prefers-reduced-motion` and `data-forte-motion="reduce"`, so reading it is
 *  the only way the timer below stays in step with a reader who asked for
 *  less motion — or with a later retune of the token. */
function fadeMs(root: HTMLElement) {
  const raw = getComputedStyle(root).getPropertyValue("--forte-duration-slow").trim();
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return 400;
  return raw.endsWith("ms") ? n : n * 1000;
}

/**
 * Re-themes the entire page from a row of swatches.
 *
 * The transition is the point. `--forte-accent-seed` is registered with
 * `@property` as a `<color>`, which makes it animatable — so the browser
 * interpolates the seed and every one of the twelve derived ramp steps
 * recomputes from it each frame. The whole site cross-fades between palettes
 * with one transition on one variable, and no JavaScript in the animation path.
 *
 * The write goes through `setThemeConfig` — the studio's one write path —
 * rather than straight onto `<html>`, which is what it used to do. Three
 * things came of the shortcut: the palette was never persisted, so it was gone
 * on the next navigation while one picked in the theme drawer survived; the
 * measured `--forte-color-on-primary` was left behind on the old seed, so the
 * auto-contrast guarantee held for a colour that was no longer on screen; and
 * the drawer's preset grid went on showing whatever it last set. Sharing the
 * record makes a hero swatch and a preset toggle the same control.
 */
export function HeroThemer() {
  const [cfg, setThemeConfig] = useThemeConfig();
  const fade = React.useRef<number | undefined>(undefined);

  /* Matched on both colours, the way the studio's preset grid is: change
   * either one there and no swatch here is current any more — a state this row
   * can genuinely be in now that it reads a shared record rather than
   * remembering its own last click. `findIndex` returning -1 leaves every
   * swatch unchecked, which is the honest answer. */
  const active = HERO_PRESETS.findIndex(
    (p) => p.seed === cfg.seed && p.secondary === cfg.secondary,
  );

  /* The class has to come off again, and this is the only thing that puts it
   * on. While it is there `<html>` carries a `transition` on both seeds, and
   * every palette change AND every light/dark switch for the rest of the
   * session pays for a 400ms fade nobody asked for. Leaving it on used to cost
   * far more than that — see the rule's own comment in `globals.css`.
   *
   * The unmount arm covers navigating away mid-fade, which would otherwise
   * strand the class on the document with nothing left mounted to remove it. */
  React.useEffect(
    () => () => {
      window.clearTimeout(fade.current);
      document.documentElement.classList.remove("themeTransition");
    },
    [],
  );

  function apply(preset: (typeof HERO_PRESETS)[number]) {
    const root = document.documentElement;
    // Read before the class goes on, so the duration cannot come from a style
    // the class itself introduced.
    const ms = fadeMs(root);
    root.classList.add("themeTransition");
    // Clicking a second palette mid-fade retargets the transition; the timer
    // has to be retargeted with it or the first click's would strip the class
    // out from under the second's fade.
    window.clearTimeout(fade.current);
    fade.current = window.setTimeout(() => root.classList.remove("themeTransition"), ms);
    setThemeConfig({ ...cfg, seed: preset.seed, secondary: preset.secondary });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-2 text-foreground-muted" id="palette-label">Try a palette</span>
      <div className="flex gap-2" role="radiogroup" aria-labelledby="palette-label">
        {HERO_PRESETS.map((p, i) => (
          <button
            key={p.name}
            type="button"
            role="radio"
            aria-checked={active === i}
            className={SWATCH}
            style={{ "--a": p.seed, "--b": p.secondary } as React.CSSProperties}
            onClick={() => apply(p)}
          >
            <span className="forte-visually-hidden">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
