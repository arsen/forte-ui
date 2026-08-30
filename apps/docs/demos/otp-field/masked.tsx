"use client";

import { Field, OTPField } from "@dofortech/forte-ui";

export default function OTPFieldMasked() {
  return (
    <div className="flex w-full max-w-[24rem] flex-col gap-5">
      <Field.Root name="recovery">
        <Field.Label>Recovery code</Field.Label>
        {/* `alphanumeric` also switches the virtual keyboard away from the
          * digit pad, which is the half of `validationType` that only shows
          * up on a phone. */}
        <OTPField.Root length={5} validationType="alphanumeric" defaultValue="A7K2" />
        <Field.Description>Letters and digits, from your backup sheet.</Field.Description>
      </Field.Root>

      <Field.Root name="pin">
        <Field.Label>Card PIN</Field.Label>
        <OTPField.Root length={4} mask defaultValue="1234" />
        <Field.Description>
          Masking is for a secret that gets reused — a PIN, not a code from an SMS.
        </Field.Description>
      </Field.Root>
    </div>
  );
}
