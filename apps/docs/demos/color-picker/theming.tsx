"use client";

import * as React from "react";
import { ColorPicker } from "@dofortech/pretty-ui";

export default function ColorPickerTheming() {
  return (
    <ColorPicker.Root defaultValue="#0ea5e9">
      <ColorPicker.Panel
        /* Every measure in the picker is a knob on this element, so a wider
          * canvas, fatter rails and round swatches are five declarations and
          * no fork. They stay in a `style` object rather than becoming utility
          * classes because a class cannot set an arbitrary custom property. */
        style={{
          "--pui-color-picker-width": "19rem",
          "--pui-color-picker-area-height": "11rem",
          "--pui-color-picker-area-radius": "var(--pui-radius-4)",
          "--pui-color-picker-rail-thickness": "1rem",
          "--pui-color-picker-swatch-radius": "var(--pui-radius-full)",
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
