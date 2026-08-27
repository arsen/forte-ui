"use client";

import { ColorPicker } from "@dofortech/pretty-ui";

export default function ColorPickerBasic() {
  return (
    <ColorPicker.Root defaultValue="#7c3aed">
      <ColorPicker.Trigger>Brand colour</ColorPicker.Trigger>
      <ColorPicker.Popup>
        <ColorPicker.Area />
        <ColorPicker.HueSlider />
        <ColorPicker.AlphaSlider />
        <ColorPicker.Swatches />
        {/* The eyedropper renders nothing where the browser has no EyeDropper
          * API, so the row is three items in Firefox and four in Chrome. */}
        <ColorPicker.Row>
          <ColorPicker.EyeDropper />
          <ColorPicker.Preview />
          <ColorPicker.Format />
          <ColorPicker.Input />
        </ColorPicker.Row>
      </ColorPicker.Popup>
    </ColorPicker.Root>
  );
}
