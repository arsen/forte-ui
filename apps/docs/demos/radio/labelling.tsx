"use client";

import * as React from "react";
import { Radio, RadioGroup } from "@dofortech/pretty-ui";

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--pui-control-gap)",
  // A plain <label> is not one of ours, so it carries none of Field.Label's
  // styling — including the pointer cursor it gets for wrapping a control.
  cursor: "pointer",
};

export default function RadioLabelling() {
  const groupLabelId = React.useId();

  return (
    <div>
      {/* Two names are needed and they are separate problems.
        *
        * The GROUP is named by pointing aria-labelledby at a heading. It cannot
        * be a <label>: a <label> resolves to one control, and role="radiogroup"
        * is not a labelable element, so the browser would drop the association.
        *
        * Each OPTION is named by an enclosing <label>. That works because
        * Radio renders a <span> with a hidden <input> beside it, and the input
        * is what the label resolves to. */}
      <div
        id={groupLabelId}
        style={{
          marginBlockEnd: "var(--pui-space-2)",
          fontSize: "var(--pui-font-size-2)",
          fontWeight: "var(--pui-font-weight-medium)",
        }}
      >
        Merge strategy
      </div>

      <RadioGroup
        aria-labelledby={groupLabelId}
        name="merge-strategy"
        defaultValue="squash"
        style={{ gap: "var(--pui-space-2)" }}
      >
        <label style={rowStyle}>
          <Radio value="merge" />
          Create a merge commit
        </label>
        <label style={rowStyle}>
          <Radio value="squash" />
          Squash and merge
        </label>
        <label style={rowStyle}>
          <Radio value="rebase" />
          Rebase and merge
        </label>
      </RadioGroup>
    </div>
  );
}
