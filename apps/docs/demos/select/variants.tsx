"use client";

import { Select } from "@dofortech/forte-ui";

const sortOrders = {
  newest: "Newest first",
  oldest: "Oldest first",
  name: "Name (A–Z)",
  size: "Largest first",
};

const variants = [
  { variant: "outline", label: "Outline" },
  { variant: "soft", label: "Soft" },
  { variant: "ghost", label: "Ghost" },
] as const;

export default function SelectVariants() {
  return (
    <>
      {variants.map(({ variant, label }) => (
        <div key={variant}>
          <Select.Root items={sortOrders} defaultValue="newest">
            <Select.Label>{label}</Select.Label>
            <Select.Trigger variant={variant}>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Popup>
              {Object.entries(sortOrders).map(([value, text]) => (
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
