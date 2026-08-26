"use client";

import { Input } from "@dofortech/pretty-ui";

const VARIANTS = ["outline", "soft", "ghost"] as const;

export default function InputVariants() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--pui-space-3)",
        inlineSize: "min(22rem, 100%)",
      }}
    >
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
