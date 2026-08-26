"use client";

import { Field, Input } from "@dofortech/pretty-ui";

export default function InputStates() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--pui-space-4)",
        inlineSize: "min(22rem, 100%)",
      }}
    >
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
