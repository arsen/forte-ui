"use client";

import * as React from "react";
import { ColorPicker } from "@forte-ui/react";

function Picker({ children, ...props }: React.ComponentProps<typeof ColorPicker.Trigger>) {
  return (
    <ColorPicker.Root defaultValue="#f43f5e">
      <ColorPicker.Trigger {...props}>{children}</ColorPicker.Trigger>
      <ColorPicker.Popup>
        <ColorPicker.Area />
        <ColorPicker.HueSlider />
        <ColorPicker.Row>
          <ColorPicker.Preview />
          <ColorPicker.Input />
        </ColorPicker.Row>
      </ColorPicker.Popup>
    </ColorPicker.Root>
  );
}

export default function ColorPickerTrigger() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Swatch and label — the default. */}
      <Picker>Accent</Picker>

      {/* Swatch only. It still has a name: the trigger announces the current
        * color after its children, so a trigger with none is named by the
        * value itself. An `aria-label` is better wherever the button means
        * something more specific than "a color". */}
      <Picker aria-label="Accent color" />

      {/* Label only, for a row that already shows the color elsewhere. */}
      <Picker hideSwatch>Choose accent…</Picker>
    </div>
  );
}
