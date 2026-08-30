"use client";

import { Checkbox, Field } from "@forte-ui/react";

export default function CheckboxDisabled() {
  return (
    <div className="flex flex-col gap-3">
      <Field.Root name="require-review">
        <Field.Label>
          <Checkbox defaultChecked />
          Require a review before merging
        </Field.Label>
      </Field.Root>

      {/* `disabled` on the Field rather than on the Checkbox: it takes
        * precedence over the control's own prop AND puts `data-disabled` on the
        * label, so the words dim with the box instead of staying at full
        * contrast beside a greyed-out control. */}
      <Field.Root name="signed-commits" disabled>
        <Field.Label>
          <Checkbox />
          Require signed commits (Team plan)
        </Field.Label>
      </Field.Root>

      <Field.Root name="enforce-admins" disabled>
        <Field.Label>
          <Checkbox defaultChecked />
          Enforce for administrators (managed by your organisation)
        </Field.Label>
      </Field.Root>
    </div>
  );
}
