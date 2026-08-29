"use client";

import { Tabs } from "@dofortech/pretty-ui";

const REGIONS = [
  { value: "us-east-1", label: "US East (N. Virginia)", detail: "42 instances, 3 alarms." },
  { value: "us-west-2", label: "US West (Oregon)", detail: "18 instances, no alarms." },
  { value: "eu-west-1", label: "Europe (Ireland)", detail: "27 instances, 1 alarm." },
  { value: "eu-central-1", label: "Europe (Frankfurt)", detail: "9 instances, no alarms." },
  { value: "ap-south-1", label: "Asia Pacific (Mumbai)", detail: "14 instances, 2 alarms." },
  { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)", detail: "31 instances, no alarms." },
  { value: "sa-east-1", label: "South America (São Paulo)", detail: "6 instances, no alarms." },
];

/* The column is far narrower than seven region names need, which is the whole
 * point: the strip scrolls instead of spilling out of it, the overflowing end
 * fades under the mask, and picking a tab off the edge — with the pointer or
 * with the arrow keys and Enter — brings it into view. Start at Tokyo, near the
 * end, to see the strip arrive already scrolled to it. */
export default function TabsOverflow() {
  return (
    <div className="w-full max-w-md">
      <Tabs.Root defaultValue="ap-northeast-1">
        <Tabs.List aria-label="Region">
          {REGIONS.map((region) => (
            <Tabs.Tab key={region.value} value={region.value}>
              {region.label}
            </Tabs.Tab>
          ))}
          <Tabs.Indicator />
        </Tabs.List>
        {REGIONS.map((region) => (
          <Tabs.Panel key={region.value} value={region.value}>
            {region.detail}
          </Tabs.Panel>
        ))}
      </Tabs.Root>
    </div>
  );
}
