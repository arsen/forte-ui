"use client";

import { Badge } from "@dofortech/pretty-ui";

const VARIANTS = ["soft", "solid", "outline", "ghost"] as const;
const TONES = [
  "primary",
  "secondary",
  "neutral",
  "danger",
  "success",
  "warning",
  "info",
] as const;

export default function BadgeVariants() {
  return (
    <div className="grid gap-3">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-2">
          <code className="w-[7ch] font-mono text-1 text-foreground-muted">{variant}</code>
          {TONES.map((tone) => (
            /* The label is the tone, so every cell measures the same thing:
             * the fill, the label colour and the edge — not the wording. */
            <Badge key={tone} variant={variant} tone={tone}>
              {tone}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  );
}
