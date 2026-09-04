"use client";

import { Shimmer } from "@forte-ui/react";

/* `data-forte-motion` is the same switch the demo frame's reduced-motion toggle
 * flips, and it works on any element — so the right-hand column is genuinely
 * running under reduced motion while the left-hand one is not, on the same
 * page at the same time. `full` on the left pins that column to base behavior
 * even for a reader whose OS already asks for less motion. */
const COLUMNS = [
  { motion: "full", title: "Full motion", note: "The band sweeps" },
  { motion: "reduce", title: "prefers-reduced-motion", note: "The band is parked and hidden" },
] as const;

export default function ShimmerReducedMotion() {
  return (
    <div className="flex flex-wrap gap-7">
      {COLUMNS.map(({ motion, title, note }) => (
        <div key={motion} data-forte-motion={motion} className="grid justify-items-start gap-2">
          <span className="text-1 font-medium text-foreground-muted">{title}</span>
          <Shimmer className="text-3 text-foreground-muted">Generating response…</Shimmer>
          <span className="text-1 text-foreground-subtle">{note}</span>
        </div>
      ))}
    </div>
  );
}
