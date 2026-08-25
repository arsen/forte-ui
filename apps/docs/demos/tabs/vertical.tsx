"use client";

import { Tabs } from "@dofortech/pretty-ui";

export default function TabsVertical() {
  return (
    <Tabs.Root defaultValue="profile" orientation="vertical">
      <Tabs.List aria-label="Account settings">
        <Tabs.Tab value="profile">Profile</Tabs.Tab>
        <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
        <Tabs.Tab value="billing">Billing</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="profile">Display name, avatar and time zone.</Tabs.Panel>
      <Tabs.Panel value="notifications">Email digest is on, weekly.</Tabs.Panel>
      <Tabs.Panel value="billing">Team plan, renews 1 September.</Tabs.Panel>
    </Tabs.Root>
  );
}
