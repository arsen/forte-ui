"use client";

import { Search } from "lucide-react";
import { InputGroup } from "@dofortech/pretty-ui";

export default function InputGroupBasic() {
  return (
    <div className="w-full max-w-[22rem]">
      <InputGroup.Root fullWidth>
        <InputGroup.Addon>
          <Search aria-hidden="true" />
        </InputGroup.Addon>
        {/* The hint is aria-hidden because "place of interest sign K" is not
          * a hint; the input spells the shortcut out via aria-keyshortcuts. */}
        <InputGroup.Input
          placeholder="Search the docs…"
          aria-label="Search"
          aria-keyshortcuts="Meta+K"
        />
        <InputGroup.Addon align="inline-end">
          <InputGroup.Text aria-hidden="true">⌘K</InputGroup.Text>
        </InputGroup.Addon>
      </InputGroup.Root>
    </div>
  );
}
