"use client";

import { Field, InputGroup } from "@forte-ui/react";

export default function InputGroupStates() {
  return (
    <div className="flex w-full max-w-[22rem] flex-col gap-4">
      {/* Every state lives on the CONTROL (or the Field above it) — the group
        * has no disabled prop of its own, it watches through `:has()`. */}
      <Field.Root disabled>
        <Field.Label>Disabled</Field.Label>
        <InputGroup.Root>
          <InputGroup.Addon>
            <InputGroup.Text>https://</InputGroup.Text>
          </InputGroup.Addon>
          <InputGroup.Input defaultValue="cannot-be-edited" />
        </InputGroup.Root>
      </Field.Root>

      <Field.Root>
        <Field.Label>Read-only</Field.Label>
        <InputGroup.Root>
          <InputGroup.Addon>
            <InputGroup.Text>https://</InputGroup.Text>
          </InputGroup.Addon>
          <InputGroup.Input readOnly defaultValue="forte-ui.dev" />
        </InputGroup.Root>
      </Field.Root>

      <Field.Root invalid>
        <Field.Label>Invalid</Field.Label>
        <InputGroup.Root>
          <InputGroup.Addon>
            <InputGroup.Text>https://</InputGroup.Text>
          </InputGroup.Addon>
          <InputGroup.Input defaultValue="not a domain" />
        </InputGroup.Root>
        <Field.Error match>Enter a valid domain.</Field.Error>
      </Field.Root>
    </div>
  );
}
