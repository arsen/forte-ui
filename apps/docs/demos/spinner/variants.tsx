"use client";

import { Spinner } from "@dofortech/forte-ui";

const VARIANTS = [
  { variant: "ring", note: "Rotating comet" },
  { variant: "dots", note: "Bouncing dots" },
  { variant: "bars", note: "Fading spokes" },
  { variant: "pulse", note: "Breathing halo" },
] as const;

export default function SpinnerVariants() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      {VARIANTS.map(({ variant, note }) => (
        <div key={variant} className="grid justify-items-center gap-2">
          {/* All four are decorative here: the page already says what each one
           * is, and four live regions announcing "Loading" over each other is
           * exactly the noise `decorative` exists to prevent. */}
          <Spinner variant={variant} size="lg" decorative />
          <code className="font-mono text-1">{variant}</code>
          <span className="text-1 text-foreground-muted">{note}</span>
        </div>
      ))}
    </div>
  );
}
