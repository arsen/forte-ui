"use client";

import { Field, NumberField } from "@forte-ui/react";

export default function NumberFieldSteps() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-5">
      <Field.Root name="temperature">
        {/* One step is 0.5, Alt steps by 0.1 and Shift by 5 — on the arrow
          * keys, the stepper buttons and the scrub alike. */}
        <NumberField.Root
          defaultValue={21}
          min={5}
          max={35}
          step={0.5}
          smallStep={0.1}
          largeStep={5}
        >
          <NumberField.ScrubArea>
            <Field.Label>Temperature</Field.Label>
          </NumberField.ScrubArea>
          <NumberField.Group>
            <NumberField.Decrement />
            <NumberField.Input />
            <NumberField.Increment />
          </NumberField.Group>
        </NumberField.Root>
        <Field.Description>Alt = 0.1 · Shift = 5</Field.Description>
      </Field.Root>

      <Field.Root name="seats">
        {/* `snapOnStep` pulls the RESULT OF A STEP onto the grid: from an
          * off-grid 7 the + lands on 8, not 9. It leaves a typed value alone —
          * type 7 and it stays 7 until you step. */}
        <NumberField.Root defaultValue={4} min={0} max={24} step={2} snapOnStep>
          <NumberField.ScrubArea>
            <Field.Label>Seats</Field.Label>
          </NumberField.ScrubArea>
          <NumberField.Group>
            <NumberField.Decrement />
            <NumberField.Input />
            <NumberField.Increment />
          </NumberField.Group>
        </NumberField.Root>
        <Field.Description>Type 7, then press +.</Field.Description>
      </Field.Root>
    </div>
  );
}
