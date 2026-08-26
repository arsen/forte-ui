"use client";

import { Field, Input } from "@dofortech/pretty-ui";

export default function FieldBasic() {
  return (
    <div style={{ inlineSize: "min(24rem, 100%)" }}>
      {/* onBlur so the demo shows its error without a form to submit. In a real
        * form leave the default (onSubmit) — nobody wants to be told their
        * email is invalid on the third character. */}
      <Field.Root name="email" validationMode="onBlur">
        <Field.Label>Email</Field.Label>
        <Input type="email" required placeholder="you@example.com" />
        <Field.Description>We only use this for receipts.</Field.Description>
        {/* One <Field.Error match> per failure replaces the browser's wording,
          * which differs per browser and per locale. */}
        <Field.Error match="valueMissing">
          An email address is required.
        </Field.Error>
        <Field.Error match="typeMismatch">
          That does not look like an email address.
        </Field.Error>
      </Field.Root>
    </div>
  );
}
