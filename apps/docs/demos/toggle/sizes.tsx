"use client";

import { Toggle } from "@dofortech/forte-ui";

const SIZES = ["sm", "md", "lg"] as const;

export default function ToggleSizes() {
  return (
    <div className="flex items-center gap-3">
      {/* The same three heights as Button — 1.75rem, 2.25rem, 2.75rem — so a
        * toggle dropped into a row of buttons lines up instead of sitting a
        * pixel proud. */}
      {SIZES.map((size) => (
        <Toggle key={size} size={size} defaultPressed={size === "md"}>
          {size}
        </Toggle>
      ))}
    </div>
  );
}
