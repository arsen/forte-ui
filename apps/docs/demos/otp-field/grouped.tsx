"use client";

import { OTPField } from "@dofortech/pretty-ui";

export default function OTPFieldGrouped() {
  return (
    // Children instead of the automatic row, because the separator has to go
    // between the third slot and the fourth. `length` still counts only the
    // inputs — six, not seven.
    <OTPField.Root length={6} aria-label="Verification code">
      <OTPField.Input />
      <OTPField.Input />
      <OTPField.Input />
      <OTPField.Separator />
      <OTPField.Input />
      <OTPField.Input />
      <OTPField.Input />
    </OTPField.Root>
  );
}
