"use client";

import { Circle, Minus, MousePointer2, Square, Type } from "lucide-react";
import { Toggle, ToggleGroup, Toolbar } from "@dofortech/pretty-ui";

const ICON = "size-4 shrink-0";

export default function ToolbarOrientation() {
  return (
    // A vertical bar sizes to its widest item rather than to its container —
    // a column stretched across the page would put a metre of empty bar beside
    // three icons.
    <Toolbar.Root orientation="vertical" variant="outline" aria-label="Tools">
      {/* The group needs telling too. Base UI's ToggleGroup skips its own
        * roving focus inside a toolbar, but `orientation` still drives its
        * LAYOUT — left at the default it would lay the tools out in a row
        * inside the column. */}
      <ToggleGroup orientation="vertical" aria-label="Tool" defaultValue={["select"]}>
        <Toggle iconOnly value="select" aria-label="Select">
          <MousePointer2 className={ICON} />
        </Toggle>
        <Toggle iconOnly value="rectangle" aria-label="Rectangle">
          <Square className={ICON} />
        </Toggle>
        <Toggle iconOnly value="ellipse" aria-label="Ellipse">
          <Circle className={ICON} />
        </Toggle>
        <Toggle iconOnly value="line" aria-label="Line">
          <Minus className={ICON} />
        </Toggle>
      </ToggleGroup>

      {/* Base UI gives the rule the orientation PERPENDICULAR to the bar's, so
        * this one is horizontal without being told. */}
      <Toolbar.Separator />

      <Toolbar.Button iconOnly aria-label="Text">
        <Type className={ICON} />
      </Toolbar.Button>
    </Toolbar.Root>
  );
}
