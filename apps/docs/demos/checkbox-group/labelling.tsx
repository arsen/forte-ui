"use client";

import * as React from "react";
import { Checkbox, CheckboxGroup } from "@forte-ui/react";

// `cursor-pointer` is not decoration: a plain <label> is not one of ours, so it
// carries none of Field.Label's styling — including the pointer cursor it gets
// for wrapping a control.
const row = "flex cursor-pointer items-center gap-(--forte-control-gap)";

export default function CheckboxGroupLabelling() {
  const groupLabelId = React.useId();

  return (
    <div>
      {/* Two names are needed and they are separate problems.
        *
        * The GROUP is named by pointing aria-labelledby at a heading. It cannot
        * be a <label>: a <label> resolves to one control, and role="group" is
        * not a labelable element, so the browser would drop the association.
        *
        * Each CHECKBOX is named by an enclosing <label>. That works because
        * Checkbox renders a <span> with a hidden <input> beside it, and the
        * input is what the label resolves to. */}
      <div id={groupLabelId} className="mb-2 text-2 font-medium">
        Allowed network protocols
      </div>

      <CheckboxGroup aria-labelledby={groupLabelId} defaultValue={["https"]}>
        <label className={row}>
          <Checkbox name="protocols" value="http" />
          HTTP
        </label>
        <label className={row}>
          <Checkbox name="protocols" value="https" />
          HTTPS
        </label>
        <label className={row}>
          <Checkbox name="protocols" value="ssh" />
          SSH
        </label>
      </CheckboxGroup>
    </div>
  );
}
