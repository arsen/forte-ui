"use client";

import type { CSSProperties } from "react";
import { Separator } from "@dofortech/pretty-ui";

const VARIANTS = ["solid", "dashed", "dotted"] as const;

const label: CSSProperties = {
  fontFamily: "var(--pui-font-mono)",
  fontSize: "var(--pui-font-size-1)",
  color: "var(--pui-color-foreground-muted)",
};

export default function SeparatorVariants() {
  return (
    <div
      style={{
        display: "grid",
        gap: "var(--pui-space-4)",
        inlineSize: "min(30rem, 100%)",
      }}
    >
      {VARIANTS.map((variant) => (
        <div key={variant} style={{ display: "grid", gap: "var(--pui-space-2)" }}>
          <span style={label}>{variant}</span>
          <Separator variant={variant} />
        </div>
      ))}
    </div>
  );
}
