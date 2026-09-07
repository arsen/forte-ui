"use client";

import { Bold, Italic, Underline } from "lucide-react";
import { ColorPicker, Toggle, ToggleGroup, Toolbar } from "@forte-ui/react";

const ICON = "size-4 shrink-0";

function Swatch({ label, defaultValue }: { label: string; defaultValue: string }) {
  return (
    <ColorPicker.Root defaultValue={defaultValue}>
      {/* `render` hands the trigger to a `Toolbar.Button`: the built-in
        * swatch-button styling steps aside, the toolbar button brings the
        * bar's quiet look and its size, and the trigger joins the arrow-key
        * order. The swatch itself stays — it is the button's only content, so
        * `iconOnly` sizes the button around it — and so does the hidden color
        * announcement after the `aria-label`. */}
      <ColorPicker.Trigger render={<Toolbar.Button iconOnly aria-label={label} />} />
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

export default function ColorPickerToolbar() {
  return (
    <Toolbar.Root aria-label="Formatting">
      <ToggleGroup aria-label="Text style" multiple>
        <Toggle iconOnly value="bold" aria-label="Bold">
          <Bold className={ICON} />
        </Toggle>
        <Toggle iconOnly value="italic" aria-label="Italic">
          <Italic className={ICON} />
        </Toggle>
        <Toggle iconOnly value="underline" aria-label="Underline">
          <Underline className={ICON} />
        </Toggle>
      </ToggleGroup>

      <Toolbar.Separator />

      <Toolbar.Group aria-label="Color">
        <Swatch label="Text color" defaultValue="#f43f5e" />
        <Swatch label="Highlight" defaultValue="#fde047" />
      </Toolbar.Group>
    </Toolbar.Root>
  );
}
