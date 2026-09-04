"use client";

import type { CSSProperties } from "react";
import { Shimmer } from "@forte-ui/react";

/* Speed is one knob, the cycle length. It is a custom property on the
 * shimmer's own root rather than a prop, so it is set in a `style` object —
 * the same way every other component's knobs are. */
const SPEEDS = [
  { label: "700ms", duration: "700ms" },
  { label: "1400ms (default)", duration: "var(--forte-duration-loop-sweep)" },
  { label: "3s", duration: "3s" },
];

export default function ShimmerSpeed() {
  return (
    <div className="grid gap-3">
      {SPEEDS.map(({ label, duration }) => (
        <div key={label} className="flex items-baseline gap-4">
          <Shimmer
            style={{ "--forte-shimmer-duration": duration } as CSSProperties}
            className="text-foreground-muted"
          >
            Generating response…
          </Shimmer>
          <span className="text-1 text-foreground-subtle">{label}</span>
        </div>
      ))}
    </div>
  );
}
