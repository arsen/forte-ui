"use client";

import * as React from "react";
import { Toggle } from "@dofortech/pretty-ui";

export default function ToggleControlled() {
  const [wrap, setWrap] = React.useState(true);

  return (
    <div style={{ display: "grid", gap: "var(--pui-space-3)", inlineSize: "min(26rem, 100%)" }}>
      {/* `pressed` + `onPressedChange` rather than `defaultPressed`. The
        * callback's first argument is the new state; the second carries Base
        * UI's event details, which this demo does not need — call
        * `details.cancel()` on it to veto the change. */}
      <Toggle pressed={wrap} onPressedChange={setWrap} variant="outline">
        Wrap long lines
      </Toggle>
      <pre
        style={{
          margin: 0,
          padding: "var(--pui-space-3)",
          borderRadius: "var(--pui-radius-4)",
          background: "var(--pui-color-panel)",
          color: "var(--pui-color-foreground)",
          fontFamily: "var(--pui-font-mono)",
          fontSize: "var(--pui-font-size-1)",
          overflowX: "auto",
          whiteSpace: wrap ? "pre-wrap" : "pre",
        }}
      >
        {"const summary = rows.filter((r) => r.status === \"open\").map((r) => r.title).join(\", \");"}
      </pre>
    </div>
  );
}
