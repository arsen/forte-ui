"use client";

import { Field, NumberField } from "@dofortech/pretty-ui";

const VARIANTS = ["outline", "soft", "ghost"] as const;

export default function NumberFieldVariants() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-5">
      {VARIANTS.map((variant) => (
        <Field.Root key={variant} name={variant}>
          <NumberField.Root variant={variant} defaultValue={8}>
            <NumberField.ScrubArea>
              <Field.Label>{variant}</Field.Label>
            </NumberField.ScrubArea>
            <NumberField.Group>
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
