"use client";

import * as React from "react";
import { Button, ColorPicker } from "@dofortech/forte-ui";

const PRESET = "#0ea5e9";

export default function ColorPickerControlled() {
  const [value, setValue] = React.useState(PRESET);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ColorPicker.Root
          value={value}
          onValueChange={setValue}
          /* Fires once per interaction rather than once per pointer move —
            * this is the one to save from. */
          onValueCommitted={(next, details) =>
            console.log("committed", next, details.reason)
          }
        >
          <ColorPicker.Trigger>Accent</ColorPicker.Trigger>
          <ColorPicker.Popup>
            <ColorPicker.Area />
            <ColorPicker.HueSlider />
            <ColorPicker.Swatches columns={8} />
            <ColorPicker.Row>
              <ColorPicker.Preview />
              <ColorPicker.Format />
              <ColorPicker.Input />
            </ColorPicker.Row>
          </ColorPicker.Popup>
        </ColorPicker.Root>

        <Button
          variant="soft"
          tone="neutral"
          onClick={() => setValue(PRESET)}
          disabled={value === PRESET}
        >
          Reset
        </Button>
      </div>

      {/* The colour goes straight into a custom property, which is how a live
        * preview stays one declaration rather than a re-render of a theme. */}
      <div
        className="rounded-surface border border-border p-4 text-2"
        style={{ borderColor: value, color: value }}
      >
        Everything here follows the picker.
      </div>
    </div>
  );
}
