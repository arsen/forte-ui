"use client";

import { Field, OTPField } from "@dofortech/forte-ui";

export default function OTPFieldStates() {
  return (
    <div className="flex w-full max-w-[24rem] flex-col gap-5">
      {/* Disabled goes on the Field.Root, not the field, so the label and the
        * description dim with the slots instead of sitting at full contrast
        * beside a greyed-out row. */}
      <Field.Root disabled>
        <Field.Label>Disabled</Field.Label>
        <OTPField.Root length={4} defaultValue="1234" />
      </Field.Root>

      <Field.Root>
        <Field.Label>Read-only</Field.Label>
        <OTPField.Root length={4} readOnly defaultValue="9042" />
      </Field.Root>

      {/* `invalid` on the Field is what a server rejection looks like: the code
        * is complete and still wrong, so the danger boundary has to beat the
        * completion one. */}
      <Field.Root invalid>
        <Field.Label>Rejected</Field.Label>
        <OTPField.Root length={4} defaultValue="1111" />
        <Field.Error match>That code has expired. Request a new one.</Field.Error>
      </Field.Root>
    </div>
  );
}
