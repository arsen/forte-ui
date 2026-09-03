"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { Button, ButtonGroup, Menu } from "@forte-ui/react";

const ICON = "size-4 shrink-0";

export default function ButtonGroupSplit() {
  return (
    <ButtonGroup.Root
      aria-label="Merge"
      // The separator's default color is tuned against the page background;
      // between two solid fills it needs re-pointing at the fill's own text
      // color. A component knob, so it goes in a `style` object — a utility
      // class cannot set an arbitrary custom property.
      style={
        {
          "--forte-button-group-separator-color":
            "color-mix(in oklab, var(--forte-color-on-primary) 40%, transparent)",
        } as React.CSSProperties
      }
    >
      <Button>Merge pull request</Button>
      <ButtonGroup.Separator />
      {/* `Menu.Trigger` has no look of its own to defend, so it steps aside
        * for `render` and takes the Button's — same direction as composing
        * into a Toolbar. */}
      <Menu.Root>
        <Menu.Trigger render={<Button iconOnly aria-label="More merge options" />}>
          <ChevronDown className={ICON} />
        </Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>Squash and merge</Menu.Item>
          <Menu.Item>Rebase and merge</Menu.Item>
          <Menu.Separator />
          <Menu.Item>Draft pull request</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </ButtonGroup.Root>
  );
}
