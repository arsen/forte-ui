"use client";

import * as React from "react";
import { ColorPicker } from "@forte-ui/react";

const TAG_COLORS = ["#ef4444", "#f59e0b", "#10b981", "#0ea5e9", "#8b5cf6"];

export default function ColorPickerBareSwatches() {
  const [color, setColor] = React.useState("#0ea5e9");

  return (
    <ColorPicker.Root value={color} onValueChange={setColor} format="hex" formats={["hex"]}>
      {/* No Popup and no Panel: the parts sit in a layout of your own. A
        * flex row sizes the grid by its content, so the swatches keep their
        * 1.25rem and the text field takes the rest of the line — or wraps
        * under them when there is no line left. */}
      <div className="flex max-w-sm flex-wrap items-center gap-2">
        <ColorPicker.Swatches colors={TAG_COLORS} columns={5} label="Tag color" />
        <ColorPicker.Input label="Tag color value" />
      </div>
    </ColorPicker.Root>
  );
}
