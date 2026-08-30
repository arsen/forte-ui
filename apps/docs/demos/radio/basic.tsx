"use client";

import { Field, Radio, RadioGroup } from "@dofortech/forte-ui";

const REGIONS = [
  { value: "iad", label: "Washington, D.C." },
  { value: "fra", label: "Frankfurt" },
  { value: "syd", label: "Sydney" },
];

export default function RadioBasic() {
  return (
    // The outer Field names the group — nativeLabel={false} because the label
    // belongs to the group, not to any one option in it, so it must not
    // resolve to a single control through htmlFor. Each Field.Item then labels
    // its own row.
    <Field.Root name="region">
      <Field.Label nativeLabel={false}>Primary region</Field.Label>
      <RadioGroup defaultValue="fra">
        {REGIONS.map((region) => (
          <Field.Item key={region.value}>
            <Field.Label>
              <Radio value={region.value} />
              {region.label}
            </Field.Label>
          </Field.Item>
        ))}
      </RadioGroup>
    </Field.Root>
  );
}
