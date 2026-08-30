"use client";

import { Field, NumberField } from "@forte-ui/react";

export default function NumberFieldWheel() {
  return (
    <div className="w-full max-w-[16rem]">
      <Field.Root name="zoom">
        {/* The second scrub gesture, and the quiet one: the wheel only moves
          * the value while the input is BOTH focused and hovered, so an
          * ordinary page scroll can never change a number in passing. */}
        <NumberField.Root defaultValue={100} min={10} max={400} allowWheelScrub>
          <NumberField.ScrubArea>
            <Field.Label>Zoom</Field.Label>
          </NumberField.ScrubArea>
          <NumberField.Group>
            <NumberField.Decrement />
            <NumberField.Input />
            <NumberField.Increment />
          </NumberField.Group>
        </NumberField.Root>
        <Field.Description>
          Click into the field, then scroll over it.
        </Field.Description>
      </Field.Root>
    </div>
  );
}
