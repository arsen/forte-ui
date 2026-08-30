"use client";

import type { CSSProperties } from "react";
import { Progress, ProgressCircle } from "@forte-ui/react";

/* Every visual decision is a custom property on the component's own root, so a
 * restyle is a `style` object rather than a new variant. They stay a `style`
 * object rather than becoming utility classes for the reason given in
 * AGENTS.md: a utility class cannot set an arbitrary custom property, and
 * these are the component's knobs rather than layout. */
const BARS: { label: string; style: CSSProperties }[] = [
  {
    label: "Hairline, square",
    style: {
      "--forte-progress-thickness": "2px",
      "--forte-progress-radius": "0",
    } as CSSProperties,
  },
  {
    label: "Chunky, inset rail",
    style: {
      "--forte-progress-thickness": "16px",
      "--forte-progress-track-bg": "var(--forte-color-panel-active)",
      "--forte-progress-indicator-bg":
        "linear-gradient(to right, var(--forte-color-secondary), var(--forte-color-primary))",
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
          * diameter whatever `--forte-progress-circle-size` is set to. `r` is
          * re-derived from it in CSS, which is what keeps a stroke this heavy
          * inside the ring instead of spilling past it. */}
        <ProgressCircle.Root
          value={64}
          style={
            {
              "--forte-progress-circle-size": "6rem",
              "--forte-progress-circle-thickness": "14px",
              "--forte-progress-circle-cap": "butt",
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
              "--forte-progress-circle-size": "6rem",
              "--forte-progress-circle-thickness": "3px",
              "--forte-progress-circle-rail": "transparent",
              "--forte-progress-circle-value-size": "var(--forte-font-size-5)",
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
