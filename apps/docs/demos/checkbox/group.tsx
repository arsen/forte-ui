"use client";

import { Checkbox, CheckboxGroup, Field } from "@dofortech/pretty-ui";

const days = [
  { value: "mon", label: "Monday" },
  { value: "wed", label: "Wednesday" },
  { value: "fri", label: "Friday" },
];

export default function CheckboxGroupDemo() {
  return (
    // The outer Field names the group — nativeLabel={false} because the label
    // belongs to the group, not to any one checkbox in it, so it must not
    // resolve to a single control with htmlFor. Each Field.Item then labels its
    // own row.
    <Field.Root name="digest-day">
      <Field.Label nativeLabel={false}>Send the weekly digest on</Field.Label>
      <CheckboxGroup defaultValue={["mon", "fri"]}>
        {days.map((day) => (
          <Field.Item key={day.value}>
            <Field.Label>
              <Checkbox value={day.value} />
              {day.label}
            </Field.Label>
          </Field.Item>
        ))}
      </CheckboxGroup>
    </Field.Root>
  );
}
