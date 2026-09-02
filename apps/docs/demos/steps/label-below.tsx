"use client";

import { Steps } from "@forte-ui/react";

/* Every step takes an equal share of the row and its title sits under the
 * circle. The connector runs from circle centre to circle centre — which is
 * what the equal shares are for. */
export default function StepsLabelBelow() {
  return (
    <Steps.Root current={2} labelPlacement="below" className="w-full max-w-2xl">
      <Steps.Item>
        <Steps.Indicator />
        <Steps.Title>Cart</Steps.Title>
      </Steps.Item>
      <Steps.Item>
        <Steps.Indicator />
        <Steps.Title>Address</Steps.Title>
      </Steps.Item>
      <Steps.Item>
        <Steps.Indicator />
        <Steps.Title>Payment</Steps.Title>
        <Steps.Description>Card or invoice</Steps.Description>
      </Steps.Item>
      <Steps.Item>
        <Steps.Indicator />
        <Steps.Title>Done</Steps.Title>
      </Steps.Item>
    </Steps.Root>
  );
}
