"use client";

import type { CSSProperties } from "react";
import { Field, Switch } from "@dofortech/pretty-ui";

const SETTINGS = [
  {
    id: "product-updates",
    name: "Product updates",
    description: "New features and changes, at most once a month.",
    defaultChecked: true,
  },
  {
    id: "security-alerts",
    name: "Security alerts",
    description: "Sign-ins from new devices, and password changes.",
    defaultChecked: true,
  },
  {
    id: "weekly-digest",
    name: "Weekly digest",
    description: "A Monday summary of your team's activity.",
    defaultChecked: false,
  },
];

const panel: CSSProperties = {
  inlineSize: "min(30rem, 100%)",
  border: "1px solid var(--pui-color-border-muted)",
  borderRadius: "var(--pui-radius-surface)",
  backgroundColor: "var(--pui-color-panel)",
};

// Field.Root is a column by default. This row layout is the one thing the
// component cannot guess, so the demo sets it — everything else (the id, the
// aria-describedby, the label and description styling) comes from Field.
const row: CSSProperties = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--pui-space-5)",
  padding: "var(--pui-space-4)",
};

export default function SwitchSettingsList() {
  return (
    <div style={panel}>
      {SETTINGS.map((setting, index) => (
        <Field.Root
          key={setting.id}
          name={setting.id}
          style={
            index === 0
              ? row
              : {
                  ...row,
                  borderBlockStart: "1px solid var(--pui-color-border-muted)",
                }
          }
        >
          {/* The label sits beside the switch rather than around it, which is
            * the whole reason this needs no `nativeButton`: Field points the
            * label's htmlFor at the switch's hidden input, and that input is a
            * labelable element. */}
          <div>
            <Field.Label>{setting.name}</Field.Label>
            <Field.Description>{setting.description}</Field.Description>
          </div>
          <Switch defaultChecked={setting.defaultChecked} />
        </Field.Root>
      ))}
    </div>
  );
}
