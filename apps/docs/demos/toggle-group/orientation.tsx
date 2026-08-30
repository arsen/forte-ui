"use client";

import { Toggle, ToggleGroup } from "@dofortech/forte-ui";

export default function ToggleGroupOrientation() {
  return (
    // Unlike RadioGroup's, this is not layout only: Base UI binds the arrow
    // keys to the named axis, so a vertical group answers to Up and Down and
    // leaves Left and Right to the page. Saying "vertical" while laying the
    // toggles out in a row would strand keyboard users on the wrong keys.
    <ToggleGroup
      segmented
      orientation="vertical"
      multiple
      defaultValue={["errors"]}
      aria-label="Log levels"
    >
      <Toggle value="errors">Errors</Toggle>
      <Toggle value="warnings">Warnings</Toggle>
      <Toggle value="info">Info</Toggle>
      <Toggle value="debug">Debug</Toggle>
    </ToggleGroup>
  );
}
