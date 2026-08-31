"use client";

import { Select } from "@forte-ui/react";

const branches = {
  main: "main",
  develop: "develop",
  "release/2.4": "release/2.4",
  "feat/popup-motion": "feat/popup-motion",
  "fix/scroll-arrows": "fix/scroll-arrows",
  "chore/deps": "chore/deps",
};

const modes = [
  { label: "Aligned to selection", alignItemWithTrigger: true },
  { label: "Menu placement", alignItemWithTrigger: false },
] as const;

export default function SelectMenuPlacement() {
  return (
    <>
      {modes.map(({ label, alignItemWithTrigger }) => (
        <div key={label} className="w-[14rem]">
          <Select.Root items={branches} defaultValue="release/2.4">
            <Select.Label>{label}</Select.Label>
            <Select.Trigger fullWidth>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Popup alignItemWithTrigger={alignItemWithTrigger}>
              {Object.entries(branches).map(([value, text]) => (
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
