"use client";

import type { CSSProperties } from "react";
import { Separator } from "@dofortech/pretty-ui";

const panel =
  "w-full max-w-[30rem] rounded-surface border border-border bg-panel p-4";

// Spacing runs ALONG the axis being separated; inset pulls the rule in from
// the edges across it. A negative inset pushes it back out — here, out through
// the panel's padding to a full-bleed rule.
const rule = {
  "--pui-separator-spacing": "var(--pui-space-3)",
  "--pui-separator-inset": "calc(-1 * var(--pui-space-4))",
  "--pui-separator-color": "var(--pui-color-border)",
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
