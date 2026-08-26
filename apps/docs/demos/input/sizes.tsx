"use client";

import { Input, Select } from "@dofortech/pretty-ui";

const SIZES = ["sm", "md", "lg"] as const;

export default function InputSizes() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--pui-space-3)",
        inlineSize: "min(26rem, 100%)",
      }}
    >
      {SIZES.map((size) => (
        // An Input and a Select.Trigger at the same size read the same control
        // metrics, so they line up on one row at every density.
        <div key={size} style={{ display: "flex", gap: "var(--pui-space-2)" }}>
          <Input size={size} defaultValue={`size="${size}"`} fullWidth />
          <Select.Root defaultValue="eu">
            <Select.Trigger size={size} aria-label={`Region (${size})`}>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Popup>
              <Select.Item value="eu">EU</Select.Item>
              <Select.Item value="us">US</Select.Item>
            </Select.Popup>
          </Select.Root>
        </div>
      ))}
    </div>
  );
}
