"use client";

import type { CSSProperties } from "react";
import { Switch } from "@dofortech/pretty-ui";

const row: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--pui-space-3)",
  fontSize: "var(--pui-font-size-2)",
};

export default function SwitchSizes() {
  return (
    <div style={{ display: "grid", gap: "var(--pui-space-4)" }}>
      <label style={row}>
        <Switch size="sm" defaultChecked />
        Small
      </label>
      <label style={row}>
        <Switch size="md" defaultChecked />
        Medium
      </label>
      <label style={row}>
        <Switch size="lg" defaultChecked />
        Large
      </label>
    </div>
  );
}
