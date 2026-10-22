"use client";

import * as React from "react";
import { Button, ColorPicker } from "@forte-ui/react";

export default function ColorPickerEmpty() {
  /* `null` is "no outline", not "a black outline nobody can see". */
  const [outline, setOutline] = React.useState<string | null>(null);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <ColorPicker.Root value={outline} onValueChange={setOutline}>
          <ColorPicker.Trigger>Outline</ColorPicker.Trigger>
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

        {/* Emptying it again is the consumer's own `null`. */}
        <Button
          variant="soft"
          onClick={() => setOutline(null)}
          disabled={outline === null}
        >
          Remove outline
        </Button>
      </div>

      <p
        className="m-0 text-6 font-bold"
        style={{ WebkitTextStroke: outline ? `2px ${outline}` : undefined }}
      >
        Outlined text
      </p>
    </div>
  );
}
