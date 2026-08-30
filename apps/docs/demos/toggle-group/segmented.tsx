"use client";

import { Toggle, ToggleGroup } from "@dofortech/forte-ui";

export default function ToggleGroupSegmented() {
  return (
    <div className="grid justify-items-start gap-4">
      {/* `segmented` puts one padded panel behind the whole set — the same
        * surface, padding and radius Tabs uses for its `pill` variant, so a
        * segmented group and a pill tab strip on one screen read as the same
        * kind of object. */}
      <ToggleGroup segmented defaultValue={["month"]} aria-label="Chart range">
        <Toggle value="day">Day</Toggle>
        <Toggle value="week">Week</Toggle>
        <Toggle value="month">Month</Toggle>
      </ToggleGroup>

      {/* Pair it with `variant="solid"` for the classic filled segmented
        * control. Set on the group, so every toggle inside picks it up. */}
      <ToggleGroup segmented variant="solid" defaultValue={["grid"]} aria-label="Layout">
        <Toggle value="list">List</Toggle>
        <Toggle value="grid">Grid</Toggle>
        <Toggle value="board">Board</Toggle>
      </ToggleGroup>

      {/* `fullWidth` fills the container and splits it equally between the
        * toggles, which is the shape a segmented control is usually asked for
        * on narrow screens. */}
      <div className="w-full max-w-[26rem]">
        <ToggleGroup
          segmented
          fullWidth
          variant="solid"
          tone="neutral"
          defaultValue={["split"]}
          aria-label="Diff view"
        >
          <Toggle value="unified">Unified</Toggle>
          <Toggle value="split">Split</Toggle>
        </ToggleGroup>
      </div>
    </div>
  );
}
