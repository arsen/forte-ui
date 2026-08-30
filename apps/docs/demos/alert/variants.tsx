"use client";

import { Alert } from "@dofortech/forte-ui";

const VARIANTS = ["soft", "outline"] as const;

export default function AlertVariants() {
  return (
    <div className="grid w-full gap-3">
      {VARIANTS.map((variant) => (
        <Alert.Root key={variant} variant={variant} tone="warning">
          <Alert.Icon />
          <Alert.Title>Your trial ends in three days</Alert.Title>
          <Alert.Description>
            <code className="font-mono text-1">variant=&quot;{variant}&quot;</code> — soft tints the
            whole surface in the tone; outline is a neutral panel where only the glyph keeps it.
          </Alert.Description>
        </Alert.Root>
      ))}
    </div>
  );
}
