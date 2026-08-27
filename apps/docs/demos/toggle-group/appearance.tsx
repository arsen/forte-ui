"use client";

import { Toggle, ToggleGroup } from "@dofortech/pretty-ui";

export default function ToggleGroupAppearance() {
  return (
    <div className="grid justify-items-start gap-4">
      {/* `variant`, `tone` and `size` set on the group become the default for
        * every toggle inside it, so a strip stays uniform without repeating
        * three props per item. */}
      <ToggleGroup
        variant="outline"
        tone="secondary"
        size="sm"
        multiple
        defaultValue={["draft"]}
        aria-label="Filter by status"
      >
        <Toggle value="draft">Draft</Toggle>
        <Toggle value="review">In review</Toggle>
        <Toggle value="shipped">Shipped</Toggle>
      </ToggleGroup>

      {/* A toggle's own prop still wins. Here the group sets the shared look
        * and one item overrides the tone, because destructive filters should
        * not look like the rest. */}
      <ToggleGroup
        variant="outline"
        size="sm"
        multiple
        defaultValue={["archived"]}
        aria-label="Include"
      >
        <Toggle value="archived">Archived</Toggle>
        <Toggle value="drafts">Drafts</Toggle>
        <Toggle value="deleted" tone="danger">
          Deleted
        </Toggle>
      </ToggleGroup>
    </div>
  );
}
