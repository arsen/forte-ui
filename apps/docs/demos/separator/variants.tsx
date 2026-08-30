"use client";

import { Separator } from "@dofortech/forte-ui";

const VARIANTS = ["solid", "dashed", "dotted"] as const;

const label = "font-mono text-1 text-foreground-muted";

export default function SeparatorVariants() {
  return (
    <div className="grid w-full max-w-[30rem] gap-4">
      {VARIANTS.map((variant) => (
        <div key={variant} className="grid gap-2">
          <span className={label}>{variant}</span>
          <Separator variant={variant} />
        </div>
      ))}
    </div>
  );
}
