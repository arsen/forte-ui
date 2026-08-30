"use client";

import { Tabs } from "@forte-ui/react";

export default function TabsDisabledTab() {
  return (
    <Tabs.Root defaultValue="usage">
      <Tabs.List aria-label="Workspace administration">
        <Tabs.Tab value="usage">Usage</Tabs.Tab>
        <Tabs.Tab value="members">Members</Tabs.Tab>
        <Tabs.Tab value="audit" disabled>
          Audit log
        </Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="usage">412 of 500 build minutes used.</Tabs.Panel>
      <Tabs.Panel value="members">6 members, 1 pending invite.</Tabs.Panel>
      <Tabs.Panel value="audit">Available on the Enterprise plan.</Tabs.Panel>
    </Tabs.Root>
  );
}
