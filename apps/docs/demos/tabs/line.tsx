"use client";

import { Tabs } from "@forte-ui/react";

export default function TabsLine() {
  return (
    <Tabs.Root defaultValue="overview">
      <Tabs.List aria-label="Project sections">
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="deployments">Deployments</Tabs.Tab>
        <Tabs.Tab value="access">Access</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="overview">Deployed 4 minutes ago from main.</Tabs.Panel>
      <Tabs.Panel value="deployments">18 deploys, 2 rolled back.</Tabs.Panel>
      <Tabs.Panel value="access">6 members, 2 service tokens.</Tabs.Panel>
    </Tabs.Root>
  );
}
