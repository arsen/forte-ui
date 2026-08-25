"use client";

import { Checkbox } from "@dofortech/pretty-ui";

const sizes = [
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
] as const;

export default function CheckboxSizes() {
  return (
    <>
      {sizes.map(({ size, label }) => (
        <label
          key={size}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--pui-space-2)",
          }}
        >
          <Checkbox size={size} defaultChecked />
          {label}
        </label>
      ))}
    </>
  );
}
