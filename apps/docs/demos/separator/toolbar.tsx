"use client";

import { Button, Separator } from "@forte-ui/react";

export default function SeparatorToolbar() {
  return (
    <div className="flex items-center gap-2 rounded-surface border border-border bg-panel p-2">
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
