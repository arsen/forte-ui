"use client";

import { Spinner } from "@dofortech/pretty-ui";

const VARIANTS = ["ring", "dots", "bars", "pulse"] as const;
const SIZES = ["sm", "md", "lg"] as const;

export default function SpinnerSizes() {
  return (
    <div style={{ display: "grid", gap: "var(--pui-space-4)" }}>
      {SIZES.map((size) => (
        <div
          key={size}
          style={{ display: "flex", alignItems: "center", gap: "var(--pui-space-5)" }}
        >
          <code
            style={{
              fontFamily: "var(--pui-font-mono)",
              fontSize: "var(--pui-font-size-1)",
              width: "2.5rem",
            }}
          >
            {size}
          </code>
          {/* Every variant occupies the same box at a given size, so the four
           * of them line up on both axes without any layout help here. */}
          {VARIANTS.map((variant) => (
            <Spinner key={variant} variant={variant} size={size} decorative />
          ))}
        </div>
      ))}
    </div>
  );
}
