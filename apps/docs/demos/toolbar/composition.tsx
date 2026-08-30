"use client";

import { EllipsisVertical, Star } from "lucide-react";
import { Menu, Select, Toggle, Toolbar } from "@dofortech/forte-ui";

const ICON = "size-4 shrink-0";

const headings = {
  p: "Paragraph",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
};

export default function ToolbarComposition() {
  return (
    <Toolbar.Root aria-label="Block" wrap>
      {/* `Toolbar.Button render={…}` is the direction to use when the other
        * component has a look of its own to keep. `Select.Trigger` does — it
        * has to read as a select — so the default `Button` styling steps
        * aside and only the toolbar membership is added. */}
      <Select.Root items={headings} defaultValue="h2">
        <Toolbar.Button render={<Select.Trigger />} aria-label="Block type">
          <Select.Value />
          <Select.Icon />
        </Toolbar.Button>
        <Select.Popup>
          {Object.entries(headings).map(([value, label]) => (
            <Select.Item key={value} value={value}>
              {label}
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Root>

      {/* A standalone Toggle — one outside a ToggleGroup — is not a composite
        * item on its own, so it needs the same wrapper to join the arrow-key
        * order. */}
      <Toolbar.Button render={<Toggle aria-label="Favourite" iconOnly />}>
        <Star className={ICON} />
      </Toolbar.Button>

      <Toolbar.Separator />

      {/* The other direction, for a trigger that has no look to defend.
        * `Menu.Trigger` steps aside when given `render`, so handing it a
        * `Toolbar.Button` gets the bar's own quiet styling AND the arrow-key
        * order — the toolbar button reads the toolbar's context from where it
        * sits, so `disabled` still reaches it. */}
      <Menu.Root>
        <Menu.Trigger render={<Toolbar.Button iconOnly aria-label="More" />}>
          <EllipsisVertical className={ICON} />
        </Menu.Trigger>
        <Menu.Popup>
          <Menu.Item>Duplicate block</Menu.Item>
          <Menu.Item>Turn into callout</Menu.Item>
          <Menu.Separator />
          <Menu.Item tone="danger">Delete block</Menu.Item>
        </Menu.Popup>
      </Menu.Root>
    </Toolbar.Root>
  );
}
