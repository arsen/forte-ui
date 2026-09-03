"use client";

import { Field, NumberField } from "@forte-ui/react";

export default function NumberFieldStates() {
  return (
    <div className="flex flex-wrap items-start justify-center gap-5">
      <Field.Root name="normal">
        <NumberField.Root defaultValue={12}>
          <NumberField.ScrubArea>
            <Field.Label>Enabled</Field.Label>
          </NumberField.ScrubArea>
          <NumberField.Group>
            <NumberField.Decrement />
            <NumberField.Input />
            <NumberField.Increment />
          </NumberField.Group>
        </NumberField.Root>
      </Field.Root>

      {/* Disabled drops to 55% opacity and takes `cursor: not-allowed`. The
        * grip goes with it: an affordance for a gesture that cannot happen is
        * worse than no affordance. */}
      <Field.Root name="disabled">
        <NumberField.Root defaultValue={12} disabled>
          <NumberField.ScrubArea>
            <Field.Label>Disabled</Field.Label>
          </NumberField.ScrubArea>
          <NumberField.Group>
            <NumberField.Decrement />
            <NumberField.Input />
            <NumberField.Increment />
          </NumberField.Group>
        </NumberField.Root>
      </Field.Root>

      {/* Read-only keeps full contrast — the value is still there to be read
        * and copied — and only stops offering to change it. */}
      <Field.Root name="readonly">
        <NumberField.Root defaultValue={12} readOnly>
          <NumberField.ScrubArea>
            <Field.Label>Read-only</Field.Label>
          </NumberField.ScrubArea>
          <NumberField.Group>
            <NumberField.Decrement />
            <NumberField.Input />
            <NumberField.Increment />
          </NumberField.Group>
        </NumberField.Root>
      </Field.Root>

      {/* `invalid` on the Field is the deterministic way to show the state —
        * a `validate` callback would only fire once something changed, so the
        * demo would render valid and stay that way until touched. Only the
        * group's boundary moves; the digits keep their own color so the
        * user's answer never looks like the error message. */}
      <Field.Root name="invalid" invalid>
        <NumberField.Root defaultValue={7}>
          <NumberField.ScrubArea>
            <Field.Label>Invalid</Field.Label>
          </NumberField.ScrubArea>
          <NumberField.Group>
            <NumberField.Decrement />
            <NumberField.Input />
            <NumberField.Increment />
          </NumberField.Group>
        </NumberField.Root>
        <Field.Error match>Must be even.</Field.Error>
      </Field.Root>
    </div>
  );
}
