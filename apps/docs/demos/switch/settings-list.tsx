"use client";

import type { CSSProperties } from "react";
import { Switch } from "@dofortech/pretty-ui";

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

const row: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "var(--pui-space-5)",
  padding: "var(--pui-space-4)",
};

const nameStyle: CSSProperties = {
  display: "block",
  fontSize: "var(--pui-font-size-2)",
  fontWeight: "var(--pui-font-weight-medium)",
};

const descriptionStyle: CSSProperties = {
  margin: "var(--pui-space-1) 0 0",
  fontSize: "var(--pui-font-size-1)",
  color: "var(--pui-color-foreground-muted)",
};

export default function SwitchSettingsList() {
  return (
    <div style={panel}>
      {SETTINGS.map((setting, index) => (
        <div
          key={setting.id}
          style={
            index === 0
              ? row
              : { ...row, borderBlockStart: "1px solid var(--pui-color-border-muted)" }
          }
        >
          <div>
            <label htmlFor={setting.id} style={nameStyle}>
              {setting.name}
            </label>
            <p id={`${setting.id}-description`} style={descriptionStyle}>
              {setting.description}
            </p>
          </div>
          <Switch
            id={setting.id}
            nativeButton
            render={<button />}
            aria-describedby={`${setting.id}-description`}
            defaultChecked={setting.defaultChecked}
          />
        </div>
      ))}
    </div>
  );
}
