"use client";

import * as React from "react";
import { ColorPicker } from "@dofortech/pretty-ui";

export default function ColorPickerAlpha() {
  const [opaque, setOpaque] = React.useState("#7c3aed");
  const [translucent, setTranslucent] = React.useState("#7c3aed");

  return (
    <div className="grid gap-5 grid-cols-2 max-two-col:grid-cols-1">
      {/* No AlphaSlider, so alpha is never touched and never appears in the
        * output — there is no prop to set. */}
      <div className="grid justify-items-start gap-2">
        <ColorPicker.Root value={opaque} onValueChange={setOpaque}>
          <ColorPicker.Trigger>Opaque</ColorPicker.Trigger>
          <ColorPicker.Popup>
            <ColorPicker.Area />
            <ColorPicker.HueSlider />
            <ColorPicker.Row>
              <ColorPicker.Preview />
              <ColorPicker.Input />
            </ColorPicker.Row>
          </ColorPicker.Popup>
        </ColorPicker.Root>
        <p className="m-0 font-mono text-1 text-foreground-muted">{opaque}</p>
      </div>

      <div className="grid justify-items-start gap-2">
        <ColorPicker.Root value={translucent} onValueChange={setTranslucent}>
          <ColorPicker.Trigger>With opacity</ColorPicker.Trigger>
          <ColorPicker.Popup>
            <ColorPicker.Area />
            <ColorPicker.HueSlider />
            <ColorPicker.AlphaSlider />
            <ColorPicker.Row>
              <ColorPicker.Preview />
              <ColorPicker.Input />
            </ColorPicker.Row>
          </ColorPicker.Popup>
        </ColorPicker.Root>
        <p className="m-0 font-mono text-1 text-foreground-muted">{translucent}</p>
      </div>
    </div>
  );
}
