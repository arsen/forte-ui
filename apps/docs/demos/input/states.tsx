"use client";

import { Field, Input } from "@dofortech/forte-ui";

export default function InputStates() {
  return (
    <div className="flex w-full max-w-[22rem] flex-col gap-4">
      <Field.Root>
        <Field.Label>Placeholder</Field.Label>
        <Input placeholder="Nothing typed yet" />
      </Field.Root>

      <Field.Root disabled>
        <Field.Label>Disabled</Field.Label>
        <Input defaultValue="Cannot be edited" />
      </Field.Root>

      {/* Read-only keeps the text cursor: selecting and copying the value is
        * the whole point of the state. */}
      <Field.Root>
        <Field.Label>Read-only</Field.Label>
        <Input readOnly defaultValue="acme-website-prod" />
      </Field.Root>
    </div>
  );
}
