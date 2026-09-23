"use client";

import { Search, X } from "lucide-react";
import { InputGroup } from "@forte-ui/react";

export default function InputGroupNarrow() {
  return (
    // Drag the corner. The group is a flex item that is allowed to shrink
    // (`min-w-0`), so it gives up width from the input — never a new row
    // for its icon.
    <div className="flex w-[16rem] min-w-[5rem] max-w-full resize-x items-center gap-2 overflow-hidden rounded-surface border border-border-muted p-2">
      <InputGroup.Root variant="ghost" className="min-w-0 flex-1">
        <InputGroup.Addon>
          <Search aria-hidden="true" />
        </InputGroup.Addon>
        <InputGroup.Input placeholder="Filter…" aria-label="Filter" />
        <InputGroup.Addon align="inline-end">
          <InputGroup.Button iconOnly aria-label="Clear filter">
            <X aria-hidden="true" />
          </InputGroup.Button>
        </InputGroup.Addon>
      </InputGroup.Root>
    </div>
  );
}
