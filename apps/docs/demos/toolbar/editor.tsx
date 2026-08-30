"use client";

import * as React from "react";
import {
  Bold,
  Code,
  EllipsisVertical,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  Undo2,
} from "lucide-react";
import { Menu, Select, Textarea, Toggle, ToggleGroup, Toolbar } from "@forte-ui/react";

const ICON = "size-4 shrink-0";

const blocks = {
  p: "Paragraph",
  h1: "Heading 1",
  h2: "Heading 2",
  quote: "Quote",
};

export default function ToolbarEditor() {
  const [value, setValue] = React.useState(
    "Tab moves past this whole bar in one press. The arrow keys move between its controls.",
  );

  return (
    <div className="grid w-full gap-2">
      {/* Everything the component is for, in one bar: a select, two toggle
        * groups, a menu, an icon button, a separator between each question the
        * bar asks — and one tab stop for the lot. */}
      <Toolbar.Root size="sm" variant="outline" aria-label="Compose" wrap>
        <Select.Root items={blocks} defaultValue="p">
          <Toolbar.Button render={<Select.Trigger />} aria-label="Block type">
            <Select.Value />
            <Select.Icon />
          </Toolbar.Button>
          <Select.Popup>
            {Object.entries(blocks).map(([v, label]) => (
              <Select.Item key={v} value={v}>
                {label}
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Root>

        <Toolbar.Separator />

        <ToggleGroup aria-label="Text style" multiple>
          <Toggle iconOnly value="bold" aria-label="Bold">
            <Bold className={ICON} />
          </Toggle>
          <Toggle iconOnly value="italic" aria-label="Italic">
            <Italic className={ICON} />
          </Toggle>
          <Toggle iconOnly value="code" aria-label="Inline code">
            <Code className={ICON} />
          </Toggle>
        </ToggleGroup>

        <Toolbar.Separator />

        <ToggleGroup aria-label="List">
          <Toggle iconOnly value="bullet" aria-label="Bulleted list">
            <List className={ICON} />
          </Toggle>
          <Toggle iconOnly value="ordered" aria-label="Numbered list">
            <ListOrdered className={ICON} />
          </Toggle>
        </ToggleGroup>

        <Toolbar.Separator />

        <Toolbar.Group aria-label="History">
          <Toolbar.Button iconOnly aria-label="Undo">
            <Undo2 className={ICON} />
          </Toolbar.Button>
          <Toolbar.Button iconOnly aria-label="Redo">
            <Redo2 className={ICON} />
          </Toolbar.Button>
        </Toolbar.Group>

        <Menu.Root>
          <Menu.Trigger
            render={<Toolbar.Button iconOnly aria-label="More options" className="ms-auto" />}
          >
            <EllipsisVertical className={ICON} />
          </Menu.Trigger>
          <Menu.Popup>
            <Menu.Item>
              <Link2 className={ICON} />
              Insert link…
            </Menu.Item>
            <Menu.Item>Insert table</Menu.Item>
            <Menu.Separator />
            <Menu.Item>Clear formatting</Menu.Item>
          </Menu.Popup>
        </Menu.Root>
      </Toolbar.Root>

      <Textarea
        aria-label="Post body"
        rows={4}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  );
}
