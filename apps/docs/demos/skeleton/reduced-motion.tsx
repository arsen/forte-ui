"use client";

import { Skeleton } from "@dofortech/forte-ui";

/* `data-forte-motion` is the same switch the demo frame's reduced-motion toggle
 * flips, and it works on any element — so the right-hand column below is
 * genuinely running under reduced motion while the left-hand one is not, on
 * the same page at the same time. `full` on the left is not decoration either:
 * it pins that column to base behaviour even for a reader whose OS already
 * asks for less motion, so the comparison holds for everyone. */
const COLUMNS = [
  { motion: "full", title: "Full motion" },
  { motion: "reduce", title: "prefers-reduced-motion" },
] as const;

const ANIMATIONS = ["pulse", "shimmer"] as const;

export default function SkeletonReducedMotion() {
  return (
    <div className="flex flex-wrap gap-7">
      {COLUMNS.map(({ motion, title }) => (
        <div key={motion} data-forte-motion={motion} className="grid gap-4">
          <span className="text-1 font-medium text-foreground-muted">{title}</span>
          {ANIMATIONS.map((animation) => (
            <div key={animation} className="grid gap-2">
              <code className="font-mono text-1">{animation}</code>
              <Skeleton.Root animation={animation} className="h-10 w-48" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
