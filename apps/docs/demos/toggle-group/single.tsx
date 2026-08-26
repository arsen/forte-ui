"use client";

import * as React from "react";
import { Toggle, ToggleGroup } from "@dofortech/pretty-ui";

export default function ToggleGroupSingle() {
  const [value, setValue] = React.useState<string[]>(["balanced"]);
  // Single-select still yields an array — empty when the pressed toggle is
  // pressed again. That is the difference from a radio group, and it has to be
  // handled: there is no guarantee of a selection.
  const mode = value[0];

  return (
    <div style={{ display: "grid", gap: "var(--pui-space-3)", justifyItems: "start" }}>
      <ToggleGroup segmented value={value} onValueChange={setValue} aria-label="Render quality">
        <Toggle value="fast">Fast</Toggle>
        <Toggle value="balanced">Balanced</Toggle>
        <Toggle value="best">Best</Toggle>
      </ToggleGroup>
      <p
        style={{
          margin: 0,
          color: "var(--pui-color-foreground-muted)",
          fontSize: "var(--pui-font-size-1)",
        }}
      >
        {mode ? `Rendering at ${mode} quality.` : "Nothing selected — using the project default."}
      </p>
    </div>
  );
}
