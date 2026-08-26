"use client";

import type { CSSProperties } from "react";
import { Spinner } from "@dofortech/pretty-ui";

/* Every visual decision is a custom property on the spinner root, so a
 * restyle is a `style` object rather than a new variant. Note that all three
 * of these set their tokens ON the spinner: `--pui-spinner-track` derives from
 * `--pui-spinner-color`, and a derived custom property is resolved where it is
 * declared — set the colour on an ancestor and the track would keep the
 * default. */
const RECIPES: { label: string; style: CSSProperties }[] = [
  {
    label: "Hairline, slow",
    style: {
      "--pui-spinner-thickness": "1.5px",
      "--pui-spinner-duration": "2s",
    } as CSSProperties,
  },
  {
    label: "Heavy, no track",
    style: {
      "--pui-spinner-thickness": "6px",
      "--pui-spinner-track": "transparent",
      "--pui-spinner-color": "var(--pui-color-success)",
    } as CSSProperties,
  },
  {
    label: "Wide, fast bars",
    style: {
      "--pui-spinner-duration": "600ms",
      "--pui-spinner-bar-width": "5px",
      "--pui-spinner-bar-length": "9px",
      "--pui-spinner-bar-dim": "0.08",
    } as CSSProperties,
  },
];

export default function SpinnerTheming() {
  return (
    <div style={{ display: "flex", gap: "var(--pui-space-6)", flexWrap: "wrap" }}>
      {RECIPES.map(({ label, style }, i) => (
        <div
          key={label}
          style={{ display: "grid", justifyItems: "center", gap: "var(--pui-space-2)" }}
        >
          <Spinner variant={i === 2 ? "bars" : "ring"} size="lg" style={style} decorative />
          <span
            style={{
              fontSize: "var(--pui-font-size-1)",
              color: "var(--pui-color-foreground-muted)",
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
