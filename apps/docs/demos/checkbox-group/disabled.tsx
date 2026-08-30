"use client";

import { Checkbox, CheckboxGroup, Field } from "@forte-ui/react";

const REGIONS = [
  { value: "us-east", label: "US East" },
  { value: "eu-west", label: "EU West" },
  { value: "ap-south", label: "AP South" },
];

export default function CheckboxGroupDisabled() {
  return (
    <div className="flex flex-col gap-6">
      {/* `disabled` on the Field rather than on the group: it takes precedence
        * over the group's own prop AND puts `data-disabled` on the labels, so
        * the words dim with the boxes instead of staying at full contrast
        * beside greyed-out controls. */}
      <Field.Root name="regions" disabled>
        <Field.Label nativeLabel={false}>Replicate to</Field.Label>
        <CheckboxGroup defaultValue={["us-east"]}>
          {REGIONS.map((region) => (
            <Field.Item key={region.value}>
              <Field.Label>
                <Checkbox value={region.value} />
                {region.label}
              </Field.Label>
            </Field.Item>
          ))}
        </CheckboxGroup>
        <Field.Description>
          Replication is fixed for the duration of a migration.
        </Field.Description>
      </Field.Root>

      {/* One row disabled inside an enabled group. `disabled` goes on the
        * Field.Item for the same reason it goes on the Field.Root above: put
        * it on the Checkbox alone and only the box dims, leaving the reason
        * the option is unavailable at full contrast beside a greyed-out
        * control. */}
      <Field.Root name="regions-partial">
        <Field.Label nativeLabel={false}>Replicate to</Field.Label>
        <CheckboxGroup defaultValue={["us-east"]}>
          {REGIONS.map((region) => (
            <Field.Item
              key={region.value}
              disabled={region.value === "ap-south"}
            >
              <Field.Label>
                <Checkbox value={region.value} />
                {region.label}
                {region.value === "ap-south" ? " — not on your plan" : ""}
              </Field.Label>
            </Field.Item>
          ))}
        </CheckboxGroup>
      </Field.Root>
    </div>
  );
}
