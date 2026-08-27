"use client";

import { Field, Input } from "@dofortech/pretty-ui";

export default function InputBasic() {
  return (
    <div className="w-full max-w-[22rem]">
      <Field.Root name="project">
        <Field.Label>Project name</Field.Label>
        <Input placeholder="acme-website" />
        <Field.Description>
          Lowercase letters, numbers and dashes.
        </Field.Description>
      </Field.Root>
    </div>
  );
}
