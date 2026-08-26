"use client";

import { Spinner } from "@dofortech/pretty-ui";

const VARIANTS = [
  { variant: "ring", note: "Rotating comet" },
  { variant: "dots", note: "Bouncing dots" },
  { variant: "bars", note: "Fading spokes" },
  { variant: "pulse", note: "Breathing halo" },
] as const;

export default function SpinnerVariants() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--pui-space-6)",
        alignItems: "flex-start",
      }}
    >
      {VARIANTS.map(({ variant, note }) => (
        <div
          key={variant}
          style={{
            display: "grid",
            justifyItems: "center",
            gap: "var(--pui-space-2)",
          }}
        >
          {/* All four are decorative here: the page already says what each one
           * is, and four live regions announcing "Loading" over each other is
           * exactly the noise `decorative` exists to prevent. */}
          <Spinner variant={variant} size="lg" decorative />
          <code style={{ fontFamily: "var(--pui-font-mono)", fontSize: "var(--pui-font-size-1)" }}>
            {variant}
          </code>
          <span
            style={{
              fontSize: "var(--pui-font-size-1)",
              color: "var(--pui-color-foreground-muted)",
            }}
          >
            {note}
          </span>
        </div>
      ))}
    </div>
  );
}
