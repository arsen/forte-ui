"use client";

import * as React from "react";
import { Toggle } from "@dofortech/pretty-ui";

export default function ToggleControlled() {
  const [wrap, setWrap] = React.useState(true);

  return (
    <div className="grid w-full max-w-[26rem] gap-3">
      {/* `pressed` + `onPressedChange` rather than `defaultPressed`. The
        * callback's first argument is the new state; the second carries Base
        * UI's event details, which this demo does not need — call
        * `details.cancel()` on it to veto the change. */}
      <Toggle pressed={wrap} onPressedChange={setWrap} variant="outline">
        Wrap long lines
      </Toggle>
      <pre
        className={`m-0 overflow-x-auto rounded-4 bg-panel p-3 font-mono text-1 text-foreground ${
          wrap ? "whitespace-pre-wrap" : "whitespace-pre"
        }`}
      >
        {"const summary = rows.filter((r) => r.status === \"open\").map((r) => r.title).join(\", \");"}
      </pre>
    </div>
  );
}
