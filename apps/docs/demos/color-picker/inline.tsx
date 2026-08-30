"use client";

import { ColorPicker } from "@forte-ui/react";

export default function ColorPickerInline() {
  return (
    // No Trigger and no Popup: `ColorPicker.Panel` is the same picker laid out
    // in the page, on a surface of its own.
    <ColorPicker.Root defaultValue="oklch(0.72 0.19 55)" defaultFormat="oklch">
      <ColorPicker.Panel>
        <ColorPicker.Area />
        <ColorPicker.HueSlider />
        <ColorPicker.Row>
          <ColorPicker.Preview />
          <ColorPicker.Format />
          <ColorPicker.Input />
        </ColorPicker.Row>
      </ColorPicker.Panel>
    </ColorPicker.Root>
  );
}
