"use client";

import { ProgressCircle } from "@forte-ui/react";

const SIZES = [
  { size: "sm", note: "2.5rem" },
  { size: "md", note: "3.5rem" },
  { size: "lg", note: "5rem" },
] as const;

export default function ProgressCircleSizes() {
  return (
    <div className="flex flex-wrap items-end gap-7">
      {SIZES.map(({ size, note }) => (
        // The stroke is measured in the ring's own coordinate space rather
        // than in pixels, so it scales with the diameter: `sm` is a smaller
        // ring, not a thinner one. It is also proportionally a little heavier,
        // because a stroke that is 7% of 80px disappears at 40px.
        <ProgressCircle.Root key={size} size={size} value={72}>
          <ProgressCircle.Track>
            <ProgressCircle.Indicator />
          </ProgressCircle.Track>
          <ProgressCircle.Value />
          <ProgressCircle.Label className="flex items-baseline gap-2">
            <code className="font-mono">{size}</code>
            <span>{note}</span>
          </ProgressCircle.Label>
        </ProgressCircle.Root>
      ))}
    </div>
  );
}
