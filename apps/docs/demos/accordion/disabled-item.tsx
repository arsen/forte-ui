"use client";

import { Accordion } from "@dofortech/pretty-ui";

const width = "w-full max-w-lg";

export default function AccordionDisabledItem() {
  return (
    <Accordion.Root variant="contained" defaultValue={["plan"]} className={width}>
      <Accordion.Item value="plan">
        <Accordion.Header>
          <Accordion.Trigger>Plan</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Team, billed annually. Renews in March.</Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="seats">
        <Accordion.Header>
          <Accordion.Trigger>Seats</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>12 of 20 in use.</Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="invoices" disabled>
        <Accordion.Header>
          <Accordion.Trigger>Invoices</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Only workspace owners can see invoices.</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}
