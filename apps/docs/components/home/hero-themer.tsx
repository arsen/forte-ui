"use client";

import * as React from "react";

const PALETTE = [
  { name: "Ocean", seed: "#0e76be", secondary: "#8f5fc0" },
  { name: "Violet", seed: "#6d43d4", secondary: "#c2410c" },
  { name: "Forest", seed: "#0f7a52", secondary: "#a16207" },
  { name: "Ember", seed: "#c2410c", secondary: "#0369a1" },
  { name: "Rose", seed: "#b6155f", secondary: "#0f766e" },
];

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

/**
 * Re-themes the entire page from a row of swatches.
 *
 * The transition is the point. `--forte-accent-seed` is registered with
 * `@property` as a `<color>`, which makes it animatable — so the browser
 * interpolates the seed and every one of the twelve derived ramp steps
 * recomputes from it each frame. The whole site cross-fades between palettes
 * with one transition on one variable, and no JavaScript in the animation path.
 */
export function HeroThemer() {
  const [active, setActive] = React.useState(0);

  function apply(index: number) {
    const p = PALETTE[index]!;
    const root = document.documentElement;
    root.style.setProperty("--forte-accent-seed", p.seed);
    root.style.setProperty("--forte-secondary-seed", p.secondary);
    root.classList.add("themeTransition");
    setActive(index);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-2 text-foreground-muted" id="palette-label">Try a palette</span>
      <div className="flex gap-2" role="radiogroup" aria-labelledby="palette-label">
        {PALETTE.map((p, i) => (
          <button
            key={p.name}
            type="button"
            role="radio"
            aria-checked={active === i}
            className={SWATCH}
            style={{ "--a": p.seed, "--b": p.secondary } as React.CSSProperties}
            onClick={() => apply(i)}
          >
            <span className="forte-visually-hidden">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
