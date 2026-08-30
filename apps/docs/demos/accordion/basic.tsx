"use client";

import { Accordion } from "@dofortech/forte-ui";

const width = "w-full max-w-lg";

export default function AccordionBasic() {
  return (
    <Accordion.Root defaultValue={["shipping"]} className={width}>
      <Accordion.Item value="shipping">
        <Accordion.Header>
          <Accordion.Trigger>When will my order ship?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          Orders placed before 14:00 leave the same working day. Everything else
          goes out the next morning.
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="returns">
        <Accordion.Header>
          <Accordion.Trigger>Can I return something?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          Within 30 days, unopened, with the receipt. Refunds land back on the
          original card in about a week.
        </Accordion.Panel>
      </Accordion.Item>

      <Accordion.Item value="tracking">
        <Accordion.Header>
          <Accordion.Trigger>Where is my tracking number?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>
          In the dispatch email, and on the order page once the parcel has been
          collected by the courier.
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  );
}
