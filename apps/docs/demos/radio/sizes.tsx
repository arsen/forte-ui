"use client";

import { Field, Radio, RadioGroup } from "@dofortech/pretty-ui";

const SIZES = [
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
] as const;

export default function RadioSizes() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--pui-space-5)",
      }}
    >
      {SIZES.map(({ size, label }) => (
        // One group per size, each showing both states — the dot is what
        // changes with the size, and it only exists on the selected option.
        <Field.Root key={size} name={`size-${size}`}>
          <Field.Label nativeLabel={false}>{label}</Field.Label>
          <RadioGroup defaultValue="on" orientation="horizontal">
            <Field.Item>
              <Field.Label>
                <Radio size={size} value="on" />
                Selected
              </Field.Label>
            </Field.Item>
            <Field.Item>
              <Field.Label>
                <Radio size={size} value="off" />
                Not selected
              </Field.Label>
            </Field.Item>
          </RadioGroup>
        </Field.Root>
      ))}
    </div>
  );
}
