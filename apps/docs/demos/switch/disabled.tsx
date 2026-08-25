"use client";

import type { CSSProperties } from "react";
import { Switch } from "@dofortech/pretty-ui";

const row: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--pui-space-3)",
  fontSize: "var(--pui-font-size-2)",
};

export default function SwitchDisabled() {
  return (
    <div style={{ display: "grid", gap: "var(--pui-space-4)" }}>
      <label style={row}>
        <Switch disabled />
        Custom domain (available on the Team plan)
      </label>
      <label style={row}>
        <Switch disabled defaultChecked />
        Two-factor authentication (enforced by your workspace)
      </label>
    </div>
  );
}
