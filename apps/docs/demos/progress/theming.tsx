"use client";

import type { CSSProperties } from "react";
import { Progress, ProgressCircle } from "@dofortech/pretty-ui";

/* Every visual decision is a custom property on the component's own root, so a
 * restyle is a `style` object rather than a new variant. They stay a `style`
 * object rather than becoming utility classes for the reason given in
 * AGENTS.md: a utility class cannot set an arbitrary custom property, and
 * these are the component's knobs rather than layout. */
const BARS: { label: string; style: CSSProperties }[] = [
  {
    label: "Hairline, square",
    style: {
      "--pui-progress-thickness": "2px",
      "--pui-progress-radius": "0",
    } as CSSProperties,
  },
  {
    label: "Chunky, inset rail",
    style: {
      "--pui-progress-thickness": "16px",
      "--pui-progress-track-bg": "var(--pui-color-panel-active)",
      "--pui-progress-indicator-bg":
        "linear-gradient(to right, var(--pui-color-secondary), var(--pui-color-primary))",
    } as CSSProperties,
  },
];

export default function ProgressTheming() {
  return (
    <div className="grid gap-7">
      {BARS.map(({ label, style }) => (
        <Progress.Root key={label} value={64} style={style} className="max-w-sm">
          <Progress.Label>{label}</Progress.Label>
          <Progress.Value />
          <Progress.Track>
            <Progress.Indicator />
          </Progress.Track>
        </Progress.Root>
      ))}

      <div className="flex flex-wrap items-end gap-7">
        {/* Thickness is in viewBox units, so `14px` is 14% of the ring's
          * diameter whatever `--pui-progress-circle-size` is set to. `r` is
          * re-derived from it in CSS, which is what keeps a stroke this heavy
          * inside the ring instead of spilling past it. */}
        <ProgressCircle.Root
          value={64}
          style={
            {
              "--pui-progress-circle-size": "6rem",
              "--pui-progress-circle-thickness": "14px",
              "--pui-progress-circle-cap": "butt",
            } as CSSProperties
          }
        >
          <ProgressCircle.Track>
            <ProgressCircle.Indicator />
          </ProgressCircle.Track>
          <ProgressCircle.Value />
          <ProgressCircle.Label>Heavy, butt caps</ProgressCircle.Label>
        </ProgressCircle.Root>

        <ProgressCircle.Root
          value={64}
          style={
            {
              "--pui-progress-circle-size": "6rem",
              "--pui-progress-circle-thickness": "3px",
              "--pui-progress-circle-rail": "transparent",
              "--pui-progress-circle-value-size": "var(--pui-font-size-5)",
            } as CSSProperties
          }
        >
          <ProgressCircle.Track>
            <ProgressCircle.Indicator />
          </ProgressCircle.Track>
          <ProgressCircle.Value />
          <ProgressCircle.Label>Hairline, no rail</ProgressCircle.Label>
        </ProgressCircle.Root>
      </div>
    </div>
  );
}
