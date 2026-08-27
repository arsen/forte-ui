"use client";

import { ScrollArea, Tabs } from "@dofortech/pretty-ui";

const SECTIONS = [
  ["overview", "Overview", "Deployed 4 minutes ago from main."],
  ["deployments", "Deployments", "18 deploys this week, 2 rolled back."],
  ["analytics", "Analytics", "9,713 requests, 0.6% errors."],
  ["speed", "Speed insights", "LCP 1.2s at the 75th percentile."],
  ["logs", "Logs", "412 entries in the last hour."],
  ["storage", "Storage", "2.1 GB of 10 GB used."],
  ["integrations", "Integrations", "GitHub, Linear and Slack connected."],
  ["settings", "Settings", "Production branch is main."],
];

export default function ScrollAreaTabs() {
  return (
    <Tabs.Root defaultValue="overview" className="w-full max-w-[30rem]">
      {/* The padding gives the horizontal scrollbar a lane of its own below the
          rail. Without it the track overlays the rail and the sliding
          indicator, and the two read as one smudged line. */}
      <ScrollArea.Root className="pb-3">
        <ScrollArea.Viewport>
          <ScrollArea.Content>
            <Tabs.List aria-label="Project sections">
              {SECTIONS.map(([value, label]) => (
                <Tabs.Tab key={value} value={value}>
                  {label}
                </Tabs.Tab>
              ))}
              <Tabs.Indicator />
            </Tabs.List>
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="horizontal">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
      {SECTIONS.map(([value, , body]) => (
        <Tabs.Panel key={value} value={value}>
          {body}
        </Tabs.Panel>
      ))}
    </Tabs.Root>
  );
}
