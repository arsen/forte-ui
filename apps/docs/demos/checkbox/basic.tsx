"use client";

import { Checkbox } from "@dofortech/pretty-ui";

export default function CheckboxBasic() {
  return (
    <label
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--pui-space-2)",
      }}
    >
      <Checkbox name="build-alerts" defaultChecked />
      Email me when a build fails
    </label>
  );
}
