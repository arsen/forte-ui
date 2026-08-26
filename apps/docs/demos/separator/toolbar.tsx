"use client";

import { Button, Separator } from "@dofortech/pretty-ui";

export default function SeparatorToolbar() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--pui-space-2)",
        padding: "var(--pui-space-2)",
        border: "1px solid var(--pui-color-border)",
        borderRadius: "var(--pui-radius-surface)",
        background: "var(--pui-color-panel)",
      }}
    >
      <Button variant="ghost" size="sm">Undo</Button>
      <Button variant="ghost" size="sm">Redo</Button>

      {/* No `min-block-size` in play here: inside a flex row the rule stretches
          to the tallest sibling, so it matches the buttons exactly. */}
      <Separator orientation="vertical" />

      <Button variant="ghost" size="sm">Bold</Button>
      <Button variant="ghost" size="sm">Italic</Button>

      <Separator orientation="vertical" />

      <Button variant="ghost" size="sm">Link</Button>
    </div>
  );
}
