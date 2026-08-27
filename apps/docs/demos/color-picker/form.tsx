"use client";

import * as React from "react";
import { Button, ColorPicker } from "@dofortech/pretty-ui";

export default function ColorPickerForm() {
  const [submitted, setSubmitted] = React.useState<string | null>(null);

  return (
    <form
      className="grid justify-items-start gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSubmitted(String(data.get("theme")));
      }}
    >
      <ColorPicker.Root defaultValue="#22c55e">
        <ColorPicker.Trigger>Theme colour</ColorPicker.Trigger>
        {/* Next to the trigger, NOT inside the popup: the popup is portalled to
          * <body> and unmounted while it is closed, so a hidden input in there
          * is outside this form even when it exists. */}
        <ColorPicker.HiddenInput name="theme" />
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

      <Button type="submit">Save</Button>

      {submitted === null ? null : (
        <p className="m-0 font-mono text-1 text-foreground-muted">
          submitted theme={submitted}
        </p>
      )}
    </form>
  );
}
