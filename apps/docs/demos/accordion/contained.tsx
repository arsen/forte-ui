"use client";

import type { CSSProperties } from "react";
import { Accordion } from "@dofortech/pretty-ui";

const width: CSSProperties = { inlineSize: "min(32rem, 100%)" };

export default function AccordionContained() {
  return (
    <Accordion.Root variant="contained" defaultValue={["build"]} style={width}>
      <Accordion.Item value="build">
        <Accordion.Header>
          <Accordion.Trigger>Build</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          Passed in 1m 12s. 248 modules, no warnings.
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="test">
        <Accordion.Header>
          <Accordion.Trigger>Test</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          Passed in 3m 40s. 412 assertions across 96 files.
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="deploy">
        <Accordion.Header>
          <Accordion.Trigger>Deploy</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          Waiting on approval from a second reviewer.
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}
