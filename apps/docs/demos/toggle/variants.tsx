"use client";

import * as React from "react";
import { Toggle } from "@dofortech/pretty-ui";

const VARIANTS = ["solid", "soft", "outline"] as const;

export default function ToggleVariants() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto auto auto",
        alignItems: "center",
        gap: "var(--pui-space-3) var(--pui-space-4)",
      }}
    >
      {VARIANTS.map((variant) => (
        // Both states side by side, because the variant only decides what "on"
        // looks like. Every variant is chromeless when off — apart from
        // `outline`, which keeps its border so you can still see where the
        // button is before anything is pressed.
        <React.Fragment key={variant}>
          <span
            style={{
              color: "var(--pui-color-foreground-muted)",
              fontSize: "var(--pui-font-size-1)",
            }}
          >
            {variant}
          </span>
          <Toggle variant={variant}>Off</Toggle>
          <Toggle variant={variant} defaultPressed>
            On
          </Toggle>
        </React.Fragment>
      ))}
    </div>
  );
}
