"use client";

import * as React from "react";
import { ColorPicker, type ColorPickerFormat } from "@dofortech/pretty-ui";

export default function ColorPickerFormats() {
  const [value, setValue] = React.useState("oklch(0.5413 0.2466 293.01)");
  const [format, setFormat] = React.useState<ColorPickerFormat>("oklch");

  return (
    <div className="grid gap-4">
      <ColorPicker.Root
        value={value}
        onValueChange={setValue}
        format={format}
        onFormatChange={setFormat}
        /* Narrow the list to the notations this app actually stores. HEX is
         * left out here because it cannot hold the colour: it is eight bits a
         * channel, and this design system's tokens are OKLCH. */
        formats={["oklch", "rgb", "hsl"]}
      >
        <ColorPicker.Trigger>Token colour</ColorPicker.Trigger>
        <ColorPicker.Popup>
          <ColorPicker.Area />
          <ColorPicker.HueSlider />
          <ColorPicker.Row>
            <ColorPicker.Preview />
            <ColorPicker.Format />
            <ColorPicker.Input />
          </ColorPicker.Row>
        </ColorPicker.Popup>
      </ColorPicker.Root>

      {/* Switching format rewrites the value, not the colour — the swatch here
        * never moves while the string underneath it changes notation. */}
      <p className="m-0 font-mono text-1 text-foreground-muted">{value}</p>
    </div>
  );
}
