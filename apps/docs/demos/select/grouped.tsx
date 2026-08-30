"use client";

import { Select } from "@dofortech/forte-ui";

const regionGroups = [
  {
    label: "Americas",
    regions: [
      { value: "us-east-1", label: "us-east-1 · N. Virginia" },
      { value: "us-west-2", label: "us-west-2 · Oregon" },
      { value: "sa-east-1", label: "sa-east-1 · São Paulo" },
    ],
  },
  {
    label: "Europe",
    regions: [
      { value: "eu-west-1", label: "eu-west-1 · Ireland" },
      { value: "eu-central-1", label: "eu-central-1 · Frankfurt" },
    ],
  },
  {
    label: "Asia Pacific",
    regions: [
      { value: "ap-northeast-1", label: "ap-northeast-1 · Tokyo" },
      { value: "ap-southeast-2", label: "ap-southeast-2 · Sydney" },
    ],
  },
];

const regions = regionGroups.flatMap((group) => group.regions);

export default function SelectGrouped() {
  return (
    <div>
      <Select.Root items={regions} defaultValue="eu-west-1">
        <Select.Label>Deploy region</Select.Label>
        <Select.Trigger>
          <Select.Value />
          <Select.Icon />
        </Select.Trigger>
        <Select.Popup>
          {regionGroups.map((group) => (
            <Select.Group key={group.label}>
              <Select.GroupLabel>{group.label}</Select.GroupLabel>
              {group.regions.map((region) => (
                <Select.Item key={region.value} value={region.value}>
                  {region.label}
                </Select.Item>
              ))}
            </Select.Group>
          ))}
        </Select.Popup>
      </Select.Root>
    </div>
  );
}
