"use client";

import * as React from "react";
import { Radio, RadioGroup } from "@forte-ui/react";

// `cursor-pointer` is not decoration: a plain <label> is not one of ours, so it
// carries none of Field.Label's styling — including the pointer cursor it gets
// for wrapping a control.
const row = "flex cursor-pointer items-center gap-(--forte-control-gap)";

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
      <div id={groupLabelId} className="mb-2 text-2 font-medium">
        Merge strategy
      </div>

      <RadioGroup
        aria-labelledby={groupLabelId}
        name="merge-strategy"
        defaultValue="squash"
        className="gap-2"
      >
        <label className={row}>
          <Radio value="merge" />
          Create a merge commit
        </label>
        <label className={row}>
          <Radio value="squash" />
          Squash and merge
        </label>
        <label className={row}>
          <Radio value="rebase" />
          Rebase and merge
        </label>
      </RadioGroup>
    </div>
  );
}
