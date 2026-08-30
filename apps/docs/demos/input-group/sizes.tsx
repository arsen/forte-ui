"use client";

import { Search } from "lucide-react";
import { InputGroup } from "@forte-ui/react";

const SIZES = ["sm", "md", "lg"] as const;

export default function InputGroupSizes() {
  return (
    <div className="flex w-full max-w-[22rem] flex-col gap-4">
      {SIZES.map((size) => (
        <InputGroup.Root key={size} size={size} fullWidth>
          <InputGroup.Addon>
            <Search aria-hidden="true" />
          </InputGroup.Addon>
          <InputGroup.Input placeholder={size} aria-label={`Search (${size})`} />
          <InputGroup.Addon align="inline-end">
            <InputGroup.Button>Search</InputGroup.Button>
          </InputGroup.Addon>
        </InputGroup.Root>
      ))}
    </div>
  );
}
