"use client";

import { Checkbox } from "@dofortech/pretty-ui";

const row = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--pui-space-2)",
} as const;

export default function CheckboxDisabled() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--pui-space-2)",
      }}
    >
      <label style={row}>
        <Checkbox name="require-review" defaultChecked />
        Require a review before merging
      </label>

      <label style={{ ...row, color: "var(--pui-color-foreground-muted)" }}>
        <Checkbox name="signed-commits" disabled />
        Require signed commits (Team plan)
      </label>

      <label style={{ ...row, color: "var(--pui-color-foreground-muted)" }}>
        <Checkbox name="enforce-admins" disabled defaultChecked />
        Enforce for administrators (managed by your organisation)
      </label>
    </div>
  );
}
