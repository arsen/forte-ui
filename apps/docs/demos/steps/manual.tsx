"use client";

import { Steps } from "@forte-ui/react";

/* No `current` on the root: each item says what it is. This is a list that
 * is not a straight line — an order's history, where the steps are events
 * rather than pages, and "complete" does not imply the one before it. */
export default function StepsManual() {
  return (
    <Steps.Root orientation="vertical" variant="dot" tone="success" className="w-full max-w-lg">
      <Steps.Item status="complete">
        <Steps.Indicator />
        <Steps.Title>Order placed</Steps.Title>
        <Steps.Description>Monday, 09:12</Steps.Description>
      </Steps.Item>
      <Steps.Item status="complete">
        <Steps.Indicator />
        <Steps.Title>Payment confirmed</Steps.Title>
        <Steps.Description>Monday, 09:14</Steps.Description>
      </Steps.Item>
      <Steps.Item status="active">
        <Steps.Indicator />
        <Steps.Title>Packed</Steps.Title>
        <Steps.Description>In progress at the Leeds warehouse</Steps.Description>
      </Steps.Item>
      <Steps.Item>
        <Steps.Indicator />
        <Steps.Title>Shipped</Steps.Title>
      </Steps.Item>
      <Steps.Item>
        <Steps.Indicator />
        <Steps.Title>Delivered</Steps.Title>
      </Steps.Item>
    </Steps.Root>
  );
}
