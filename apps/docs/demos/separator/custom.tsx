"use client";

import type { CSSProperties } from "react";
import { Separator } from "@dofortech/forte-ui";

const panel =
  "w-full max-w-[30rem] rounded-surface border border-border bg-panel p-4";

// Spacing runs ALONG the axis being separated; inset pulls the rule in from
// the edges across it. A negative inset pushes it back out — here, out through
// the panel's padding to a full-bleed rule.
const rule = {
  "--forte-separator-spacing": "var(--forte-space-3)",
  "--forte-separator-inset": "calc(-1 * var(--forte-space-4))",
  "--forte-separator-color": "var(--forte-color-border)",
} as CSSProperties;

const ROWS = ["Overview", "Members", "Integrations", "Danger zone"];

export default function SeparatorCustom() {
  return (
    <div className={panel}>
      {ROWS.map((row, i) => (
        <div key={row}>
          {i > 0 && <Separator style={rule} />}
          <div className="text-2">{row}</div>
        </div>
      ))}
    </div>
  );
}
