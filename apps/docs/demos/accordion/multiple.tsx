"use client";

import { Accordion } from "@forte-ui/react";

const width = "w-full max-w-lg";

export default function AccordionMultiple() {
  return (
    <Accordion.Root multiple defaultValue={["cpu", "memory"]} className={width}>
      <Accordion.Item value="cpu">
        <Accordion.Header>
          <Accordion.Trigger>CPU</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          4 vCPU, averaging 18% over the last hour.
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="memory">
        <Accordion.Header>
          <Accordion.Trigger>Memory</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          2.1 GB of 8 GB in use. No swap.
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="disk">
        <Accordion.Header>
          <Accordion.Trigger>Disk</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          64 GB of 100 GB used, growing about 1 GB a week.
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}
