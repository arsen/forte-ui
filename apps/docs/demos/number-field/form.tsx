"use client";

import * as React from "react";
import { Button, Field, Form, NumberField } from "@dofortech/pretty-ui";

export default function NumberFieldForm() {
  const [submitted, setSubmitted] = React.useState<Record<
    string,
    unknown
  > | null>(null);

  return (
    <div className="w-full max-w-[26rem]">
      <Form onFormSubmit={(values) => setSubmitted(values)}>
        {/* The name goes on the Field, and the hidden input the NumberField
          * renders carries it — so what lands in `values` is a real number, or
          * `null` for an empty field, never the formatted string. */}
        <Field.Root name="nights">
          <NumberField.Root defaultValue={2} min={1} max={30} required>
            <NumberField.ScrubArea>
              <Field.Label>Nights</Field.Label>
            </NumberField.ScrubArea>
            <NumberField.Group fullWidth>
              <NumberField.Decrement />
              <NumberField.Input />
              <NumberField.Increment />
            </NumberField.Group>
          </NumberField.Root>
          <Field.Error />
        </Field.Root>

        <Field.Root name="guests">
          {/* `allowOutOfRange` lets a typed value sit outside min/max so the
            * platform's own range validation fires, instead of the field
            * silently clamping the number the user meant to enter. */}
          <NumberField.Root defaultValue={2} min={1} max={4} allowOutOfRange>
            <NumberField.ScrubArea>
              <Field.Label>Guests</Field.Label>
            </NumberField.ScrubArea>
            <NumberField.Group fullWidth>
              <NumberField.Decrement />
              <NumberField.Input />
              <NumberField.Increment />
            </NumberField.Group>
          </NumberField.Root>
          <Field.Description>Type 9 and submit.</Field.Description>
          <Field.Error />
        </Field.Root>

        <Button type="submit" className="self-start">
          Book
        </Button>
      </Form>

      {submitted ? (
        <pre className="mt-5 overflow-x-auto rounded-surface bg-panel p-4 font-mono text-1">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
