"use client";

import { Field, NumberField } from "@dofortech/forte-ui";

/**
 * `pixelSensitivity` is how far the pointer has to travel for one step, so it
 * is really a *precision* control: raise it when the range is small and every
 * value matters, drop it when the range is wide and the user is roughing a
 * number in.
 */
const FIELDS = [
  { label: "Coarse", sensitivity: 1, hint: "1px per step" },
  { label: "Default", sensitivity: 2, hint: "2px per step" },
  { label: "Fine", sensitivity: 12, hint: "12px per step" },
] as const;

export default function NumberFieldSensitivity() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-5">
      {FIELDS.map((field) => (
        <Field.Root key={field.label} name={field.label.toLowerCase()}>
          <NumberField.Root defaultValue={50} min={0} max={100} size="sm">
            <NumberField.ScrubArea pixelSensitivity={field.sensitivity}>
              <Field.Label>{field.label}</Field.Label>
            </NumberField.ScrubArea>
            <NumberField.Group>
              <NumberField.Decrement />
              <NumberField.Input />
              <NumberField.Increment />
            </NumberField.Group>
          </NumberField.Root>
          <Field.Description>{field.hint}</Field.Description>
        </Field.Root>
      ))}
    </div>
  );
}
