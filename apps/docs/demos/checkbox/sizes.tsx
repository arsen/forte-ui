"use client";

import { Checkbox, Field } from "@dofortech/forte-ui";

const sizes = [
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
] as const;

export default function CheckboxSizes() {
  return (
    <>
      {sizes.map(({ size, label }) => (
        <Field.Root key={size}>
          <Field.Label>
            <Checkbox size={size} defaultChecked />
            {label}
          </Field.Label>
        </Field.Root>
      ))}
    </>
  );
}
