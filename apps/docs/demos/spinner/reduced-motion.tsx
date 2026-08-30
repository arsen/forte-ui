"use client";

import { Spinner } from "@dofortech/forte-ui";

const VARIANTS = ["ring", "dots", "bars", "pulse"] as const;

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

export default function SpinnerReducedMotion() {
  return (
    <div className="flex flex-wrap gap-7">
      {COLUMNS.map(({ motion, title }) => (
        <div key={motion} data-forte-motion={motion} className="grid justify-items-start gap-4">
          <span className="text-1 font-medium text-foreground-muted">{title}</span>
          <div className="flex gap-5">
            {VARIANTS.map((variant) => (
              <Spinner key={variant} variant={variant} size="lg" decorative />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
