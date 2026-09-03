"use client";

import * as React from "react";
import { flushSync } from "react-dom";
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

/** Whether a full-page cross-fade is welcome right now, read off the
 *  library's own motion token rather than a media query of this file's own.
 *
 *  `--forte-motion-ok` is `1` normally and `0` under BOTH the OS preference
 *  and a `data-forte-motion="reduce"` set in the studio, so asking it is the
 *  only way the fade below stays in step with a reader who asked for less
 *  motion either way — and a whole-page colour wash is exactly the kind of
 *  large-area change that guidance asks us to drop, so under `0` the palette
 *  simply snaps. */
function motionOk(root: HTMLElement) {
  return getComputedStyle(root).getPropertyValue("--forte-motion-ok").trim() !== "0";
}

/**
 * Re-themes the entire page from a row of swatches.
 *
 * The cross-fade is a view transition: the browser snapshots the page, the
 * seeds change in ONE style recalc, and the old and new snapshots fade on the
 * compositor for `--forte-duration-slow` (the pseudo-element rule in
 * `globals.css` puts it on the library's clock). Nothing in the DOM is in an
 * intermediate state at any point of the fade, and nothing is transitioned.
 *
 * It used to be a `transition` on the two registered seeds instead — one
 * animatable property, re-deriving every ramp step per frame, no JavaScript
 * in the animation path — and it was the better story right up until a
 * screen recording showed what the frames in between actually held. In the
 * desktop app's Chromium (148) every `border: 1px solid var(--…)` shorthand
 * on the page painted its edge in `currentColor` for the length of the fade:
 * near-white on every entry card, the label colour on the outline Button.
 * Longhand `border-color: var(--…)` declarations feeding on the SAME token —
 * the swatches here, the divider under the hero — held, so the ramp was
 * fine and the shorthand's colour was what dropped. It does not reproduce
 * on a forced style read mid-fade, nor in headless Chrome 152, which is why
 * it survived for as long as it did. The per-frame cost was the other half:
 * every element re-resolves every token on every frame, which measured at
 * ~100ms of style recalc each, so the 400ms "fade" was three or four
 * frames. The snapshot fade has neither problem — the DOM never holds a
 * mid-fade value, and the fade is two textures.
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

  /* Matched on both colours, the way the studio's preset grid is: change
   * either one there and no swatch here is current any more — a state this row
   * can genuinely be in now that it reads a shared record rather than
   * remembering its own last click. `findIndex` returning -1 leaves every
   * swatch unchecked, which is the honest answer. */
  const active = HERO_PRESETS.findIndex(
    (p) => p.seed === cfg.seed && p.secondary === cfg.secondary,
  );

  function apply(preset: (typeof HERO_PRESETS)[number]) {
    const next = { ...cfg, seed: preset.seed, secondary: preset.secondary };
    const root = document.documentElement;
    /* Feature-detected, not assumed: a browser without view transitions
     * gets the same palette as a cut, which is what the theme drawer does
     * on every page anyway. */
    if (typeof document.startViewTransition !== "function" || !motionOk(root)) {
      setThemeConfig(next);
      return;
    }
    /* `flushSync`, so the re-render the store change queues — the ring
     * moving to the pressed swatch — is committed inside the callback, where
     * the "new" snapshot is taken. Left to React's own scheduling it lands a
     * frame later, after that snapshot, and the ring pops in once the fade
     * has finished instead of fading in with the palette. */
    const transition = document.startViewTransition(() => {
      flushSync(() => setThemeConfig(next));
    });
    /* A transition the browser skips — the tab is hidden, or a second click
     * lands mid-fade and supersedes the first — rejects `ready`, and nothing
     * here waits on it. Chromium 148 reports that rejection as an uncaught
     * error in the console; the palette has still been applied, because the
     * update callback runs either way, so the only thing to do is to say so
     * to the promise. */
    transition.ready.catch(() => {});
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
