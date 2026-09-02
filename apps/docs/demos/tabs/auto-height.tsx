"use client";

import * as React from "react";
import { Field, Switch, Tabs } from "@forte-ui/react";

const CHANGES = [
  "Popovers keep focus inside them while a nested dialog is open.",
  "The date picker accepts a typed range as well as a picked one.",
  "Tables remember their sort order across a route change.",
  "Reduced-motion users get every cue, without the travel.",
  "Popovers keep focus inside them while a nested dialog is open.",
  "The date picker accepts a typed range as well as a picked one.",
  "Tables remember their sort order across a route change.",
  "Reduced-motion users get every cue, without the travel.",
];

const PEOPLE = [
  { name: "R. Okonkwo", commits: "9 commits" },
  { name: "S. Lindqvist", commits: "4 commits" },
  { name: "M. Haddad", commits: "1 commit" },
];

export default function TabsAutoHeight() {
  const [autoHeight, setAutoHeight] = React.useState(true);

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <Tabs.Root defaultValue="summary" autoHeight={autoHeight}>
        <Tabs.List aria-label="Release 4.2">
          <Tabs.Tab value="summary">Summary</Tabs.Tab>
          <Tabs.Tab value="changes">Changes</Tabs.Tab>
          <Tabs.Tab value="people">People</Tabs.Tab>
          <Tabs.Indicator />
        </Tabs.List>

        <Tabs.Panel value="summary" className="p-2">Shipped on 2 September, behind a flag.</Tabs.Panel>

        <Tabs.Panel value="changes" className="p-4">
          <div className="flex flex-col gap-2">
            {CHANGES.map((change, index) => (
              <div key={index}>{change}</div>
            ))}
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="people" className="p-4">
          <div className="flex flex-col gap-2">
            {PEOPLE.map((person) => (
              <div key={person.name} className="flex justify-between gap-3">
                <span>{person.name}</span>
                <span className="text-foreground-muted">{person.commits}</span>
              </div>
            ))}
          </div>
        </Tabs.Panel>
      </Tabs.Root>

      <Field.Root name="auto-height">
        <Field.Label>
          <Switch checked={autoHeight} onCheckedChange={setAutoHeight} />
          Animate the height
        </Field.Label>
      </Field.Root>
    </div>
  );
}
