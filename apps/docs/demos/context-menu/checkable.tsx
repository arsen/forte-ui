"use client";

import * as React from "react";
import { ContextMenu } from "@dofortech/forte-ui";

export default function ContextMenuCheckable() {
  const [grid, setGrid] = React.useState(true);
  const [rulers, setRulers] = React.useState(false);
  const [zoom, setZoom] = React.useState("fit");

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger
        className="grid aspect-5/3 w-full max-w-2xs place-items-center rounded-surface border border-border bg-panel text-2 text-foreground-muted select-none"
        style={{
          backgroundImage: grid
            ? "repeating-linear-gradient(0deg, var(--forte-color-border-muted) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, var(--forte-color-border-muted) 0 1px, transparent 1px 24px)"
            : undefined,
        }}
      >
        Canvas — right click
      </ContextMenu.Trigger>

      <ContextMenu.Popup>
        {/* Both checkable kinds default to `closeOnClick={false}`, which is
          * what lets the grid and the rulers be set in one visit. */}
        <ContextMenu.CheckboxItem checked={grid} onCheckedChange={setGrid}>
          Show grid
        </ContextMenu.CheckboxItem>
        <ContextMenu.CheckboxItem checked={rulers} onCheckedChange={setRulers}>
          Show rulers
        </ContextMenu.CheckboxItem>

        <ContextMenu.Separator />

        <ContextMenu.RadioGroup value={zoom} onValueChange={setZoom}>
          <ContextMenu.GroupLabel>Zoom</ContextMenu.GroupLabel>
          <ContextMenu.RadioItem value="fit">Fit to window</ContextMenu.RadioItem>
          <ContextMenu.RadioItem value="100">100%</ContextMenu.RadioItem>
          <ContextMenu.RadioItem value="200">200%</ContextMenu.RadioItem>
        </ContextMenu.RadioGroup>
      </ContextMenu.Popup>
    </ContextMenu.Root>
  );
}
