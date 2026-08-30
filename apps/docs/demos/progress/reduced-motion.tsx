"use client";

import { Progress, ProgressCircle } from "@dofortech/forte-ui";

/* `data-forte-motion` is the same switch the demo frame's reduced-motion toggle
 * flips, and it works on any element — so the right-hand column is genuinely
 * running under reduced motion while the left-hand one is not, on the same
 * page at the same time. `full` on the left pins that column to base behaviour
 * even for a reader whose OS already asks for less motion. */
const COLUMNS = [
  { motion: "full", title: "Full motion" },
  { motion: "reduce", title: "prefers-reduced-motion" },
] as const;

export default function ProgressReducedMotion() {
  return (
    <div className="flex flex-wrap gap-7">
      {COLUMNS.map(({ motion, title }) => (
        <div key={motion} data-forte-motion={motion} className="grid w-3xs gap-4">
          <span className="text-1 font-medium text-foreground-muted">{title}</span>
          {/* The segment does not merely stop travelling on the right — it
            * grows to the full rail, and the ring's arc closes into a complete
            * circle. A 35% segment frozen against the start edge is
            * pixel-for-pixel a determinate bar stuck at 35%, which is the one
            * thing an indeterminate indicator must never look like. What is
            * left moving in both is a slow opacity breathe. */}
          <Progress.Root value={null}>
            <Progress.Label className="forte-visually-hidden">Working</Progress.Label>
            <Progress.Track>
              <Progress.Indicator />
            </Progress.Track>
          </Progress.Root>
          <ProgressCircle.Root value={null}>
            <ProgressCircle.Track>
              <ProgressCircle.Indicator />
            </ProgressCircle.Track>
            <ProgressCircle.Label className="forte-visually-hidden">Working</ProgressCircle.Label>
          </ProgressCircle.Root>
        </div>
      ))}
    </div>
  );
}
