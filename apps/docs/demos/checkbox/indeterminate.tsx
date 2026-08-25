"use client";

import * as React from "react";
import { Checkbox, CheckboxGroup } from "@dofortech/pretty-ui";

const permissions = [
  { value: "read", label: "Read code and issues" },
  { value: "write", label: "Push to branches" },
  { value: "admin", label: "Manage settings and members" },
];

const allValues = permissions.map((permission) => permission.value);

const row: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--pui-space-2)",
};

export default function CheckboxIndeterminate() {
  const [value, setValue] = React.useState<string[]>(["read"]);
  const labelId = React.useId();

  return (
    <CheckboxGroup
      aria-labelledby={labelId}
      value={value}
      onValueChange={setValue}
      allValues={allValues}
    >
      <label id={labelId} style={row}>
        <Checkbox parent />
        Repository access
      </label>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--pui-space-2)",
          marginInlineStart: "var(--pui-space-6)",
        }}
      >
        {permissions.map((permission) => (
          <label key={permission.value} style={row}>
            <Checkbox value={permission.value} />
            {permission.label}
          </label>
        ))}
      </div>
    </CheckboxGroup>
  );
}
