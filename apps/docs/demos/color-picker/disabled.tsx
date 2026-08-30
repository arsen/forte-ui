"use client";

import { ColorPicker } from "@forte-ui/react";

export default function ColorPickerDisabled() {
  return (
    <div className="flex flex-wrap items-start gap-5">
      <ColorPicker.Root defaultValue="#7c3aed" disabled>
        <ColorPicker.Trigger>Locked</ColorPicker.Trigger>
      </ColorPicker.Root>

      {/* `disabled` reaches every part through context. Each one is separately
        * disabled rather than the panel taking `pointer-events: none`, so they
        * stay announced as disabled instead of silently vanishing from the
        * keyboard. */}
      <ColorPicker.Root defaultValue="#7c3aed" disabled>
        <ColorPicker.Panel>
          <ColorPicker.Area />
          <ColorPicker.HueSlider />
          <ColorPicker.Swatches columns={8} />
          <ColorPicker.Row>
            <ColorPicker.Preview />
            <ColorPicker.Format />
            <ColorPicker.Input />
          </ColorPicker.Row>
        </ColorPicker.Panel>
      </ColorPicker.Root>
    </div>
  );
}
