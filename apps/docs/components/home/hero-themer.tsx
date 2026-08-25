"use client";

import * as React from "react";
import styles from "./hero-themer.module.css";

const PALETTE = [
  { name: "Ocean", seed: "#0e76be", secondary: "#8f5fc0" },
  { name: "Violet", seed: "#6d43d4", secondary: "#c2410c" },
  { name: "Forest", seed: "#0f7a52", secondary: "#a16207" },
  { name: "Ember", seed: "#c2410c", secondary: "#0369a1" },
  { name: "Rose", seed: "#b6155f", secondary: "#0f766e" },
];

/**
 * Re-themes the entire page from a row of swatches.
 *
 * The transition is the point. `--pui-accent-seed` is registered with
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
    root.style.setProperty("--pui-accent-seed", p.seed);
    root.style.setProperty("--pui-secondary-seed", p.secondary);
    root.classList.add("themeTransition");
    setActive(index);
  }

  return (
    <div className={styles.root}>
      <span className={styles.label} id="palette-label">Try a palette</span>
      <div className={styles.swatches} role="radiogroup" aria-labelledby="palette-label">
        {PALETTE.map((p, i) => (
          <button
            key={p.name}
            type="button"
            role="radio"
            aria-checked={active === i}
            className={`${styles.swatch} pui-focus-ring`}
            style={{ "--a": p.seed, "--b": p.secondary } as React.CSSProperties}
            onClick={() => apply(i)}
          >
            <span className="pui-visually-hidden">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
