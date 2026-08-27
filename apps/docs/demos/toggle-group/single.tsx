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
    <div className="grid justify-items-start gap-3">
      <ToggleGroup segmented value={value} onValueChange={setValue} aria-label="Render quality">
        <Toggle value="fast">Fast</Toggle>
        <Toggle value="balanced">Balanced</Toggle>
        <Toggle value="best">Best</Toggle>
      </ToggleGroup>
      <p className="m-0 text-1 text-foreground-muted">
        {mode ? `Rendering at ${mode} quality.` : "Nothing selected — using the project default."}
      </p>
    </div>
  );
}
