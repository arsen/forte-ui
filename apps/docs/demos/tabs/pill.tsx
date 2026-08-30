"use client";

import { Tabs } from "@forte-ui/react";

export default function TabsPill() {
  return (
    <Tabs.Root defaultValue="7d" variant="pill">
      <Tabs.List aria-label="Reporting period">
        <Tabs.Tab value="24h">24 hours</Tabs.Tab>
        <Tabs.Tab value="7d">7 days</Tabs.Tab>
        <Tabs.Tab value="30d">30 days</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="24h">1,284 requests, 0.4% errors.</Tabs.Panel>
      <Tabs.Panel value="7d">9,713 requests, 0.6% errors.</Tabs.Panel>
      <Tabs.Panel value="30d">41,506 requests, 0.5% errors.</Tabs.Panel>
    </Tabs.Root>
  );
}
