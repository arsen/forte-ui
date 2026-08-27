"use client";

import * as React from "react";
import { Toggle } from "@dofortech/pretty-ui";

const VARIANTS = ["solid", "soft", "outline"] as const;

export default function ToggleVariants() {
  return (
    <div className="grid grid-cols-[auto_auto_auto] items-center gap-x-4 gap-y-3">
      {VARIANTS.map((variant) => (
        // Both states side by side, because the variant only decides what "on"
        // looks like. Every variant is chromeless when off — apart from
        // `outline`, which keeps its border so you can still see where the
        // button is before anything is pressed.
        <React.Fragment key={variant}>
          <span className="text-1 text-foreground-muted">
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
