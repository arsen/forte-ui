"use client";

import { Toggle, ToggleGroup } from "@dofortech/pretty-ui";

export default function ToggleDisabled() {
  return (
    <div className="grid justify-items-start gap-4">
      <div className="flex gap-2">
        {/* Disabled keeps whichever state it is in — the point is that the
          * user can still read the setting, just not change it. */}
        <Toggle disabled>Off and locked</Toggle>
        <Toggle disabled defaultPressed>
          On and locked
        </Toggle>
      </div>

      {/* `disabled` on the group reaches every toggle inside it, and a disabled
        * toggle is skipped by the arrow keys as well as removed from the tab
        * order — so if the set has to stay discoverable, disable the action it
        * drives rather than the group. */}
      <ToggleGroup segmented disabled defaultValue={["day"]} aria-label="Chart range">
        <Toggle value="day">Day</Toggle>
        <Toggle value="week">Week</Toggle>
        <Toggle value="month">Month</Toggle>
      </ToggleGroup>
    </div>
  );
}
