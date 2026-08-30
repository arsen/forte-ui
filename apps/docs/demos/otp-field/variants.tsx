"use client";

import { OTPField } from "@dofortech/forte-ui";

const VARIANTS = ["outline", "soft", "underline"] as const;

export default function OTPFieldVariants() {
  return (
    <div className="flex flex-col gap-4">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex items-center gap-3">
          <span className="w-[5rem] font-mono text-1 text-foreground-subtle">{variant}</span>
          <OTPField.Root
            variant={variant}
            length={4}
            defaultValue="42"
            aria-label={`Code (${variant})`}
          />
        </div>
      ))}
    </div>
  );
}
