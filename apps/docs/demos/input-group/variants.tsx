"use client";

import { Search } from "lucide-react";
import { InputGroup } from "@dofortech/pretty-ui";

const VARIANTS = ["outline", "soft", "ghost"] as const;

export default function InputGroupVariants() {
  return (
    <div className="flex w-full max-w-[22rem] flex-col gap-4">
      {VARIANTS.map((variant) => (
        <InputGroup.Root key={variant} variant={variant} fullWidth>
          <InputGroup.Addon>
            <Search aria-hidden="true" />
          </InputGroup.Addon>
          <InputGroup.Input
            placeholder={variant}
            aria-label={`Search (${variant})`}
          />
        </InputGroup.Root>
      ))}
    </div>
  );
}
