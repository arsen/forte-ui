"use client";

import { Field, Select } from "@forte-ui/react";

const REGIONS = {
  "eu-west-1": "Europe (Ireland)",
  "us-east-1": "US East (N. Virginia)",
  "ap-south-1": "Asia Pacific (Mumbai)",
};

export default function FieldWithSelect() {
  return (
    <div className="w-full max-w-sm">
      <Field.Root name="region">
        {/* nativeLabel={false} because the control is a <button>. A native
          * <label> would hand the trigger its :hover state and open the popup
          * on every label click; with it off the pair is wired up with
          * aria-labelledby instead, and the label renders as a <div>. */}
        <Field.Label nativeLabel={false}>Deploy region</Field.Label>
        <Select.Root items={REGIONS} defaultValue="eu-west-1">
          <Select.Trigger fullWidth>
            <Select.Value />
            <Select.Icon />
          </Select.Trigger>
          <Select.Popup>
            {Object.entries(REGIONS).map(([value, label]) => (
              <Select.Item key={value} value={value}>
                {label}
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Root>
        <Field.Description>
          Data never leaves the region you pick.
        </Field.Description>
      </Field.Root>
    </div>
  );
}
