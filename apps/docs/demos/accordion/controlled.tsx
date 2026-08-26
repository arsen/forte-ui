"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import { Accordion, Button } from "@dofortech/pretty-ui";

const SECTIONS = [
  { value: "scope", title: "Scope", body: "Two teams, six weeks, one repository." },
  { value: "risks", title: "Risks", body: "The migration script has no dry-run mode yet." },
  { value: "owners", title: "Owners", body: "Platform leads the rollout; Web owns the cutover." },
];

const ALL = SECTIONS.map((section) => section.value);

const stack: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--pui-space-3)",
  inlineSize: "min(32rem, 100%)",
};

const bar: CSSProperties = { display: "flex", gap: "var(--pui-space-2)" };

export default function AccordionControlled() {
  const [open, setOpen] = React.useState<string[]>(["scope"]);

  return (
    <div style={stack}>
      <div style={bar}>
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
