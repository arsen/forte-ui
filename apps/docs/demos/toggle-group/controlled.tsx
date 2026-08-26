"use client";

import * as React from "react";
import { Toggle, ToggleGroup } from "@dofortech/pretty-ui";

const COLUMNS = [
  { value: "status", label: "Status" },
  { value: "owner", label: "Owner" },
  { value: "updated", label: "Updated" },
  { value: "size", label: "Size" },
];

export default function ToggleGroupControlled() {
  const [columns, setColumns] = React.useState<string[]>(["status", "updated"]);

  return (
    <div style={{ display: "grid", gap: "var(--pui-space-3)", justifyItems: "start" }}>
      {/* `value` + `onValueChange` rather than `defaultValue`. The value is
        * always an array, including when `multiple` is off — it is then empty
        * or holds exactly one entry, so the same handler shape works either
        * way. The second argument carries Base UI's event details. */}
      <ToggleGroup
        multiple
        value={columns}
        onValueChange={setColumns}
        variant="outline"
        size="sm"
        aria-label="Visible columns"
      >
        {COLUMNS.map((column) => (
          <Toggle key={column.value} value={column.value}>
            {column.label}
          </Toggle>
        ))}
      </ToggleGroup>
      <p
        style={{
          margin: 0,
          color: "var(--pui-color-foreground-muted)",
          fontSize: "var(--pui-font-size-1)",
        }}
      >
        {columns.length === 0
          ? "No extra columns."
          : `Showing: ${columns.join(", ")}.`}
      </p>
    </div>
  );
}
