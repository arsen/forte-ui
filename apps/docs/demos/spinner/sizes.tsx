"use client";

import { Spinner } from "@forte-ui/react";

const VARIANTS = ["ring", "dots", "bars", "pulse"] as const;
const SIZES = ["sm", "md", "lg"] as const;

export default function SpinnerSizes() {
  return (
    <div className="grid gap-4">
      {SIZES.map((size) => (
        <div key={size} className="flex items-center gap-5">
          <code className="w-7 font-mono text-1">{size}</code>
          {/* Every variant occupies the same box at a given size, so the four
           * of them line up on both axes without any layout help here. */}
          {VARIANTS.map((variant) => (
            <Spinner key={variant} variant={variant} size={size} decorative />
          ))}
        </div>
      ))}
    </div>
  );
}
