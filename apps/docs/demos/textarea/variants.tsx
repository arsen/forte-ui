"use client";

import { Textarea } from "@dofortech/forte-ui";

const VARIANTS = ["outline", "soft", "ghost"] as const;

export default function TextareaVariants() {
  return (
    <div className="flex w-full max-w-[26rem] flex-col gap-3">
      {VARIANTS.map((variant) => (
        <Textarea
          key={variant}
          variant={variant}
          rows={2}
          fullWidth
          defaultValue={`variant="${variant}"`}
          aria-label={`${variant} textarea`}
        />
      ))}
    </div>
  );
}
