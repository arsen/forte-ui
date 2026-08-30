"use client";

import { ColorPicker } from "@dofortech/forte-ui";

/* A brand palette, in the order it is documented rather than by hue — the
 * swatch grid keeps the order it is given, which is what makes it a palette
 * and not a colour wheel. */
const BRAND = [
  "#0f172a",
  "#1e293b",
  "#334155",
  "#7c3aed",
  "#a855f7",
  "#f43f5e",
  "#f59e0b",
  "#10b981",
  "#0ea5e9",
];

export default function ColorPickerSwatches() {
  return (
    <ColorPicker.Root defaultValue="#7c3aed">
      <ColorPicker.Trigger>Label colour</ColorPicker.Trigger>
      {/* A picker with no canvas and no rails: the palette IS the whole set of
        * choices, which is what you want wherever the answer has to stay on
        * brand. */}
      <ColorPicker.Popup>
        <ColorPicker.Swatches colors={BRAND} columns={3} label="Brand colours" />
      </ColorPicker.Popup>
    </ColorPicker.Root>
  );
}
