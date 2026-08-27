"use client";

import * as React from "react";
import { Menu } from "@dofortech/pretty-ui";

const COLUMNS = ["Status", "Assignee", "Due date", "Labels"] as const;

export default function MenuCheckboxItems() {
  const [visible, setVisible] = React.useState<string[]>([
    "Status",
    "Assignee",
  ]);

  // Centred, not start-aligned: the caption below is the widest thing in this
  // column and its width changes with the selection, so a start-aligned trigger
  // would slide sideways every time the demo frame re-centred the column.
  return (
    <div className="flex flex-col items-center gap-3">
      <Menu.Root>
        <Menu.Trigger>Columns</Menu.Trigger>
        <Menu.Popup>
          {/* The label has to live inside a Group (or a RadioGroup) — it takes
            * its association from one, and Base UI throws without it. */}
          <Menu.Group>
            <Menu.GroupLabel>Show columns</Menu.GroupLabel>
            {COLUMNS.map((column) => (
              <Menu.CheckboxItem
                key={column}
                checked={visible.includes(column)}
                onCheckedChange={(checked) =>
                  setVisible((current) =>
                    checked
                      ? [...current, column]
                      : current.filter((name) => name !== column),
                  )
                }
              >
                {column}
              </Menu.CheckboxItem>
            ))}
          </Menu.Group>
        </Menu.Popup>
      </Menu.Root>

      <p className="text-1 text-foreground-muted">
        Showing: {visible.length ? visible.join(", ") : "nothing"}
      </p>
    </div>
  );
}
