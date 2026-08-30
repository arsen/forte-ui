"use client";

import { Minus, Plus } from "lucide-react";
import { Button, ButtonGroup } from "@forte-ui/react";

const ICON = "size-4 shrink-0";

export default function ButtonGroupOrientation() {
  return (
    // A vertical group sizes to its widest control and squares the rest up
    // with it — a stepper, a zoom control, a vote widget.
    <ButtonGroup.Root orientation="vertical" aria-label="Zoom">
      <Button variant="outline" tone="neutral" iconOnly aria-label="Zoom in">
        <Plus className={ICON} />
      </Button>
      <Button variant="outline" tone="neutral" iconOnly aria-label="Zoom out">
        <Minus className={ICON} />
      </Button>
    </ButtonGroup.Root>
  );
}
