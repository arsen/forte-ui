"use client";

import { Select } from "@forte-ui/react";

const formats = [
  { value: "csv", label: "CSV", available: true },
  { value: "json", label: "JSON", available: true },
  { value: "xlsx", label: "Excel workbook — Pro plan", available: false },
  { value: "pdf", label: "PDF report — Pro plan", available: false },
];

export default function SelectDisabledItems() {
  return (
    <div>
      <Select.Root items={formats} defaultValue="csv">
        <Select.Label>Export format</Select.Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
        <Select.Popup>
          {formats.map((format) => (
            <Select.Item
              key={format.value}
              value={format.value}
              disabled={!format.available}
            >
              {format.label}
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Root>
    </div>
  );
}
