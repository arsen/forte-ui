"use client";

import { Steps } from "@forte-ui/react";

/* `status` on an item overrides what `current` would give it. The reader is
 * on the third step, but the second one failed validation on the way past —
 * and the connector after it stays empty, because the line only fills after
 * a step that is actually done. */
export default function StepsError() {
  return (
    <Steps.Root current={2} className="w-full max-w-2xl">
      <Steps.Item>
        <Steps.Indicator />
        <Steps.Title>Account</Steps.Title>
      </Steps.Item>
      <Steps.Item status="error">
        <Steps.Indicator />
        <Steps.Title>Address</Steps.Title>
        <Steps.Description>Postcode not recognised</Steps.Description>
      </Steps.Item>
      <Steps.Item>
        <Steps.Indicator />
        <Steps.Title>Payment</Steps.Title>
      </Steps.Item>
      <Steps.Item>
        <Steps.Indicator />
        <Steps.Title>Review</Steps.Title>
      </Steps.Item>
    </Steps.Root>
  );
}
