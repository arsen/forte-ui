"use client";

import { Menu, Plus } from "lucide-react";
import { AppBar, Button, Tabs } from "@forte-ui/react";

const ICON = "size-4 shrink-0";

export default function AppBarSection() {
  return (
    <Tabs.Root defaultValue="open" variant="line" className="w-full">
      {/* A section is a full-width second row. Anything goes in it; a tab
        * strip is the classic, with its panels living below the bar. */}
      <AppBar.Root variant="panel">
        <AppBar.Leading>
          <Button variant="ghost" tone="neutral" iconOnly aria-label="Open navigation">
            <Menu className={ICON} />
          </Button>
        </AppBar.Leading>
        <AppBar.Title>Issues</AppBar.Title>
        <AppBar.Trailing>
          <Button variant="solid" tone="primary" size="sm">
            <Plus className={ICON} />
            New issue
          </Button>
        </AppBar.Trailing>
        <AppBar.Section>
          <Tabs.List aria-label="Issue state">
            <Tabs.Tab value="open">Open</Tabs.Tab>
            <Tabs.Tab value="closed">Closed</Tabs.Tab>
            <Tabs.Tab value="all">All</Tabs.Tab>
            <Tabs.Indicator />
          </Tabs.List>
        </AppBar.Section>
      </AppBar.Root>

      <div className="p-5 text-2 text-foreground-muted">
        <Tabs.Panel value="open">14 open issues.</Tabs.Panel>
        <Tabs.Panel value="closed">231 closed issues.</Tabs.Panel>
        <Tabs.Panel value="all">245 issues.</Tabs.Panel>
      </div>
    </Tabs.Root>
  );
}
