"use client";

import type { CSSProperties } from "react";
import { Spinner } from "@forte-ui/react";

/* Every visual decision is a custom property on the spinner root, so a
 * restyle is a `style` object rather than a new variant. Note that all three
 * of these set their tokens ON the spinner: `--forte-spinner-track` derives from
 * `--forte-spinner-color`, and a derived custom property is resolved where it is
 * declared — set the color on an ancestor and the track would keep the
 * default. That is also why these stay a `style` object rather than becoming
 * utility classes: they are the component's own knobs, not layout. */
const RECIPES: { label: string; style: CSSProperties }[] = [
  {
    label: "Hairline, slow",
    style: {
      "--forte-spinner-thickness": "1.5px",
      "--forte-spinner-duration": "2s",
    } as CSSProperties,
  },
  {
    label: "Heavy, no track",
    style: {
      "--forte-spinner-thickness": "6px",
      "--forte-spinner-track": "transparent",
      "--forte-spinner-color": "var(--forte-color-success)",
    } as CSSProperties,
  },
  {
    label: "Wide, fast bars",
    style: {
      "--forte-spinner-duration": "600ms",
      "--forte-spinner-bar-width": "5px",
      "--forte-spinner-bar-length": "9px",
      "--forte-spinner-bar-dim": "0.08",
    } as CSSProperties,
  },
];

export default function SpinnerTheming() {
  return (
    <div className="flex flex-wrap gap-6">
      {RECIPES.map(({ label, style }, i) => (
        <div key={label} className="grid justify-items-center gap-2">
          <Spinner variant={i === 2 ? "bars" : "ring"} size="lg" style={style} decorative />
          <span className="text-1 text-foreground-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}
