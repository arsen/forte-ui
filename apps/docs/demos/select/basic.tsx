"use client";

import { Select } from "@forte-ui/react";

const timeZones = {
  "America/Los_Angeles": "Pacific — Los Angeles",
  "America/New_York": "Eastern — New York",
  "America/Sao_Paulo": "Brasília — São Paulo",
  "Europe/London": "GMT — London",
  "Europe/Berlin": "Central European — Berlin",
  "Africa/Lagos": "West Africa — Lagos",
  "Asia/Dubai": "Gulf — Dubai",
  "Asia/Kolkata": "India — Kolkata",
  "Asia/Tokyo": "Japan — Tokyo",
  "Australia/Sydney": "Eastern Australia — Sydney",
};

export default function SelectBasic() {
  return (
    <Select.Root items={timeZones} defaultValue="Europe/London">
      <Select.Trigger aria-label="Time zone">
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      <Select.Popup>
        {Object.entries(timeZones).map(([value, label]) => (
          <Select.Item key={value} value={value}>
            {label}
          </Select.Item>
        ))}
      </Select.Popup>
    </Select.Root>
  );
}
