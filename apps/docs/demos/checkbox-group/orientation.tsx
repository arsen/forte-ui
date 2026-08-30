"use client";

import { Checkbox, CheckboxGroup, Field } from "@forte-ui/react";

const FORMATS = [
  { value: "csv", label: "CSV" },
  { value: "json", label: "JSON" },
  { value: "parquet", label: "Parquet" },
  { value: "xlsx", label: "Excel" },
];

export default function CheckboxGroupOrientation() {
  return (
    <Field.Root name="export-formats">
      <Field.Label nativeLabel={false}>Export as</Field.Label>
      {/* Layout only. Every checkbox stays its own tab stop in both
        * orientations, so nothing about the keyboard changes — unlike a
        * ToggleGroup, where the orientation decides which arrow keys are
        * bound. Horizontal groups wrap rather than overflow. */}
      <CheckboxGroup orientation="horizontal" defaultValue={["csv"]}>
        {FORMATS.map((format) => (
          <Field.Item key={format.value}>
            <Field.Label>
              <Checkbox value={format.value} />
              {format.label}
            </Field.Label>
          </Field.Item>
        ))}
      </CheckboxGroup>
    </Field.Root>
  );
}
