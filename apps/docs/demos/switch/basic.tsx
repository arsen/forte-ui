"use client";

import { Switch } from "@dofortech/pretty-ui";

export default function SwitchBasic() {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--pui-space-3)",
        fontSize: "var(--pui-font-size-2)",
      }}
    >
      <Switch defaultChecked />
      Email notifications
    </label>
  );
}
