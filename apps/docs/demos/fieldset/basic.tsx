"use client";

import { Field, Fieldset, Input } from "@dofortech/pretty-ui";

export default function FieldsetBasic() {
  return (
    <div style={{ inlineSize: "min(28rem, 100%)" }}>
      <Fieldset.Root>
        <Fieldset.Legend>Shipping address</Fieldset.Legend>
        <Field.Root name="street">
          <Field.Label>Street</Field.Label>
          <Input placeholder="12 Rue de Rivoli" />
        </Field.Root>
        <div style={{ display: "flex", gap: "var(--pui-space-3)" }}>
          <Field.Root name="city">
            <Field.Label>City</Field.Label>
            <Input placeholder="Paris" />
          </Field.Root>
          <Field.Root name="postcode" style={{ inlineSize: "8rem", flex: "none" }}>
            <Field.Label>Postcode</Field.Label>
            <Input placeholder="75001" />
          </Field.Root>
        </div>
      </Fieldset.Root>
    </div>
  );
}
