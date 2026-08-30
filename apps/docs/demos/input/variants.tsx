"use client";

import { Input } from "@dofortech/forte-ui";

const VARIANTS = ["outline", "soft", "ghost"] as const;

export default function InputVariants() {
  return (
    <div className="flex w-full max-w-[22rem] flex-col gap-3">
      {VARIANTS.map((variant) => (
        <Input
          key={variant}
          variant={variant}
          fullWidth
          defaultValue={`variant="${variant}"`}
          aria-label={`${variant} input`}
        />
      ))}
    </div>
  );
}
