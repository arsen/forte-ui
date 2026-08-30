"use client";

import { ColorPicker } from "@dofortech/forte-ui";

export default function ColorPickerEyeDropper() {
  return (
    <ColorPicker.Root defaultValue="#10b981">
      <ColorPicker.Panel>
        <ColorPicker.Area />
        <ColorPicker.HueSlider />
        <ColorPicker.Row>
          {/* Present in Chrome and Edge; absent — rendering no element at all
            * — in Firefox and on iOS. Nothing else in the row moves, because
            * the row is a flex line rather than a fixed grid. */}
          <ColorPicker.EyeDropper />
          <ColorPicker.Preview />
          <ColorPicker.Value />
        </ColorPicker.Row>
      </ColorPicker.Panel>
    </ColorPicker.Root>
  );
}
