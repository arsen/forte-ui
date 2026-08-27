"use client";

import type { CSSProperties } from "react";
import { Field, NumberField } from "@dofortech/pretty-ui";

// A formatted value is longer than a bare one, so the field needs more than the
// default 5ch. A component knob, so it stays in a `style` object — no utility
// class can set an arbitrary custom property.
const wide = { "--pui-number-field-input-width": "8ch" } as CSSProperties;

/**
 * `format` is `Intl.NumberFormatOptions` verbatim, so currency, percent and
 * unit displays are a prop rather than a wrapper — and the field parses what it
 * printed, so a user can type "$1,250" back into the first one.
 *
 * Percent is the one to read twice: Intl works in fractions, so `step` is 0.01
 * for a display that moves by one point.
 */
export default function NumberFieldFormat() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-5">
      <Field.Root name="price">
        <NumberField.Root
          defaultValue={1250}
          min={0}
          step={50}
          format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
        >
          <NumberField.ScrubArea>
            <Field.Label>Price</Field.Label>
          </NumberField.ScrubArea>
          <NumberField.Group>
            <NumberField.Decrement />
            <NumberField.Input style={wide} />
            <NumberField.Increment />
          </NumberField.Group>
        </NumberField.Root>
      </Field.Root>

      <Field.Root name="rate">
        <NumberField.Root
          defaultValue={0.075}
          min={0}
          max={1}
          step={0.01}
          smallStep={0.001}
          format={{ style: "percent", maximumFractionDigits: 1 }}
        >
          <NumberField.ScrubArea>
            <Field.Label>Rate</Field.Label>
          </NumberField.ScrubArea>
          <NumberField.Group>
            <NumberField.Decrement />
            <NumberField.Input />
            <NumberField.Increment />
          </NumberField.Group>
        </NumberField.Root>
      </Field.Root>

      <Field.Root name="distance">
        <NumberField.Root
          defaultValue={5}
          min={0}
          format={{ style: "unit", unit: "kilometer", unitDisplay: "short" }}
        >
          <NumberField.ScrubArea>
            <Field.Label>Distance</Field.Label>
          </NumberField.ScrubArea>
          <NumberField.Group>
            <NumberField.Decrement />
            <NumberField.Input />
            <NumberField.Increment />
          </NumberField.Group>
        </NumberField.Root>
      </Field.Root>
    </div>
  );
}
