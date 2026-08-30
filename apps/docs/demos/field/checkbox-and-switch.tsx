"use client";

import { Checkbox, Field, Switch } from "@dofortech/forte-ui";

export default function FieldCheckboxAndSwitch() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      {/* A control with no text of its own goes INSIDE the label. The label
        * lays itself out as a row and takes a pointer cursor because clicking
        * it now toggles the control. */}
      <Field.Root name="terms">
        <Field.Label>
          <Checkbox required />I accept the terms of service
        </Field.Label>
        <Field.Description>
          Required before the workspace can be created.
        </Field.Description>
      </Field.Root>

      <Field.Root name="notifications">
        <Field.Label>
          <Switch defaultChecked />
          Email me about releases
        </Field.Label>
        <Field.Description>At most one message a month.</Field.Description>
      </Field.Root>
    </div>
  );
}
