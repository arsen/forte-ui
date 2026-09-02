"use client";

import { Field, NumberField } from "@forte-ui/react";

/**
 * The inspector-panel shape: a stack of short rows, each one a scrubbable
 * label beside its value. Stacking the label above the control here would
 * double the height of every row, which is the whole reason the layout axis
 * is a prop.
 *
 * The scrub gesture keeps its own `direction` — the label's position says
 * nothing about which way the pointer travels.
 */
const FIELDS = [
  { name: "x", label: "X", value: 24 },
  { name: "y", label: "Y", value: 48 },
  { name: "width", label: "W", value: 320 },
  { name: "height", label: "H", value: 180 },
] as const;

export default function NumberFieldOrientation() {
  return (
    <div className="grid w-full max-w-[20rem] grid-cols-2 gap-x-4 gap-y-2">
      {FIELDS.map((field) => (
        <Field.Root key={field.name} name={field.name}>
          <NumberField.Root orientation="horizontal" defaultValue={field.value} size="sm">
            <NumberField.ScrubArea>
              <Field.Label>{field.label}</Field.Label>
            </NumberField.ScrubArea>
            <NumberField.Group fullWidth>
              <NumberField.Decrement />
              <NumberField.Input />
              <NumberField.Increment />
            </NumberField.Group>
          </NumberField.Root>
        </Field.Root>
      ))}
    </div>
  );
}
