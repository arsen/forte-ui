"use client";

import { Field, Switch } from "@dofortech/forte-ui";

const sizes = [
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
] as const;

export default function SwitchSizes() {
  return (
    <div className="grid gap-4">
      {sizes.map(({ size, label }) => (
        <Field.Root key={size}>
          <Field.Label>
            <Switch size={size} defaultChecked />
            {label}
          </Field.Label>
        </Field.Root>
      ))}
    </div>
  );
}
