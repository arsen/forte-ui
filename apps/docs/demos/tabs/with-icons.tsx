"use client";

import { Tabs } from "@forte-ui/react";

function ActivityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <rect x="2" y="9" width="3" height="5" rx="1" />
      <rect x="6.5" y="5" width="3" height="9" rx="1" />
      <rect x="11" y="2" width="3" height="12" rx="1" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="5" r="3" />
      <path d="M2.5 14a5.5 5.5 0 0 1 11 0z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M4.5 1h4l4 4v8.5A1.5 1.5 0 0 1 11 15H4.5A1.5 1.5 0 0 1 3 13.5v-11A1.5 1.5 0 0 1 4.5 1z" />
    </svg>
  );
}

export default function TabsWithIcons() {
  return (
    <Tabs.Root defaultValue="activity">
      <Tabs.List aria-label="Workspace">
        <Tabs.Tab value="activity">
          <ActivityIcon />
          Activity
        </Tabs.Tab>
        <Tabs.Tab value="people">
          <PeopleIcon />
          People
        </Tabs.Tab>
        <Tabs.Tab value="files">
          <FileIcon />
          Files
        </Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="activity">14 events since Monday.</Tabs.Panel>
      <Tabs.Panel value="people">6 members, 1 pending invite.</Tabs.Panel>
      <Tabs.Panel value="files">238 files, 1.4 GB stored.</Tabs.Panel>
    </Tabs.Root>
  );
}
