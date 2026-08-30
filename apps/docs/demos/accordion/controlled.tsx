"use client";

import * as React from "react";
import { Accordion, Button } from "@forte-ui/react";

const SECTIONS = [
  { value: "scope", title: "Scope", body: "Two teams, six weeks, one repository." },
  { value: "risks", title: "Risks", body: "The migration script has no dry-run mode yet." },
  { value: "owners", title: "Owners", body: "Platform leads the rollout; Web owns the cutover." },
];

const ALL = SECTIONS.map((section) => section.value);

const stack = "flex w-full max-w-lg flex-col gap-3";

const bar = "flex gap-2";

export default function AccordionControlled() {
  const [open, setOpen] = React.useState<string[]>(["scope"]);

  return (
    <div className={stack}>
      <div className={bar}>
        <Button variant="soft" size="sm" onClick={() => setOpen(ALL)}>
          Expand all
        </Button>
        <Button variant="soft" size="sm" onClick={() => setOpen([])}>
          Collapse all
        </Button>
      </div>

      <Accordion.Root
        multiple
        value={open}
        onValueChange={setOpen}
      >
        {SECTIONS.map((section) => (
          <Accordion.Item key={section.value} value={section.value}>
            <Accordion.Header>
              <Accordion.Trigger>{section.title}</Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel>{section.body}</Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}
