"use client";

import { Select } from "@dofortech/pretty-ui";

const languages = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  "pt-BR": "Português (Brasil)",
  ja: "日本語",
};

export default function SelectWithLabel() {
  return (
    <div style={{ width: "16rem" }}>
      <Select.Root items={languages} defaultValue="en">
        <Select.Label>Interface language</Select.Label>
        <Select.Trigger fullWidth>
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
        <Select.Popup>
          {Object.entries(languages).map(([value, label]) => (
            <Select.Item key={value} value={value}>
              {label}
            </Select.Item>
          ))}
        </Select.Popup>
      </Select.Root>
    </div>
  );
}
