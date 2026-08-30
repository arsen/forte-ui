"use client";

import { Field, InputGroup } from "@dofortech/pretty-ui";

export default function InputGroupField() {
  return (
    <div className="w-full max-w-[22rem]">
      {/* InputGroup.Input IS Field.Control, so the label, the description and
        * the validation wiring all land on it with no glue — the group is
        * just the box drawn around it. */}
      <Field.Root name="handle">
        <Field.Label>Username</Field.Label>
        <InputGroup.Root>
          <InputGroup.Addon>
            <InputGroup.Text>@</InputGroup.Text>
          </InputGroup.Addon>
          <InputGroup.Input required placeholder="arsen" pattern="[a-z0-9-]+" />
        </InputGroup.Root>
        <Field.Description>
          Lowercase letters, numbers and dashes.
        </Field.Description>
        <Field.Error />
      </Field.Root>
    </div>
  );
}
