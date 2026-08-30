"use client";

import { Field, OTPField } from "@dofortech/forte-ui";

export default function OTPFieldBasic() {
  return (
    <div className="w-full max-w-[22rem]">
      <Field.Root name="code">
        <Field.Label>Verification code</Field.Label>
        {/* No children: the root renders `length` slots itself, which is the
          * shape almost every code field wants. */}
        <OTPField.Root length={6} />
        <Field.Description>
          We sent it to the number ending 4417.
        </Field.Description>
      </Field.Root>
    </div>
  );
}
