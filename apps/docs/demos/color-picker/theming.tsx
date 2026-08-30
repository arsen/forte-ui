"use client";

import * as React from "react";
import { ColorPicker } from "@dofortech/forte-ui";

export default function ColorPickerTheming() {
  return (
    <ColorPicker.Root defaultValue="#0ea5e9">
      <ColorPicker.Panel
        /* Every measure in the picker is a knob on this element, so a wider
          * canvas, fatter rails and round swatches are five declarations and
          * no fork. They stay in a `style` object rather than becoming utility
          * classes because a class cannot set an arbitrary custom property. */
        style={{
          "--forte-color-picker-width": "19rem",
          "--forte-color-picker-area-height": "11rem",
          "--forte-color-picker-area-radius": "var(--forte-radius-4)",
          "--forte-color-picker-rail-thickness": "1rem",
          "--forte-color-picker-swatch-radius": "var(--forte-radius-full)",
        } as React.CSSProperties}
      >
        <ColorPicker.Area />
        <ColorPicker.HueSlider />
        <ColorPicker.AlphaSlider />
        <ColorPicker.Swatches columns={8} />
        <ColorPicker.Row>
          <ColorPicker.Preview />
          <ColorPicker.Format />
          <ColorPicker.Input />
        </ColorPicker.Row>
      </ColorPicker.Panel>
    </ColorPicker.Root>
  );
}
