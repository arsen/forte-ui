"use client";

import * as React from "react";
import { Toggle, ToggleGroup } from "@dofortech/forte-ui";

const COLUMNS = [
  { value: "status", label: "Status" },
  { value: "owner", label: "Owner" },
  { value: "updated", label: "Updated" },
  { value: "size", label: "Size" },
];

export default function ToggleGroupControlled() {
  const [columns, setColumns] = React.useState<string[]>(["status", "updated"]);

  return (
    <div className="grid justify-items-start gap-3">
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
      <p className="m-0 text-1 text-foreground-muted">
        {columns.length === 0
          ? "No extra columns."
          : `Showing: ${columns.join(", ")}.`}
      </p>
    </div>
  );
}
