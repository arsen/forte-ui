"use client";

import { Avatar } from "@dofortech/forte-ui";

const VARIANTS = ["soft", "solid", "outline"] as const;
const TONES = ["neutral", "primary", "secondary", "danger"] as const;

export default function AvatarVariants() {
  return (
    <div className="grid gap-4">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-4">
          <code className="w-[6ch] font-mono text-1 text-foreground-muted">{variant}</code>
          {TONES.map((tone) => (
            <Avatar.Root key={tone} variant={variant} tone={tone} size="lg">
              {/* Two letters, so every cell is measuring the same thing: the
                * fill, the text colour and the edge — not the initials. */}
              <Avatar.Fallback label={`${variant}, ${tone}`}>AA</Avatar.Fallback>
            </Avatar.Root>
          ))}
        </div>
      ))}
    </div>
  );
}
