"use client";

import { Select } from "@dofortech/forte-ui";

const pageSizes = {
  "10": "10 per page",
  "25": "25 per page",
  "50": "50 per page",
  "100": "100 per page",
};

const sizes = [
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
] as const;

export default function SelectSizes() {
  return (
    <>
      {sizes.map(({ size, label }) => (
        <div key={size}>
          <Select.Root items={pageSizes} defaultValue="25">
            <Select.Label>{label}</Select.Label>
            <Select.Trigger size={size}>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Popup>
              {Object.entries(pageSizes).map(([value, text]) => (
                <Select.Item key={value} value={value}>
                  {text}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Root>
        </div>
      ))}
    </>
  );
}
