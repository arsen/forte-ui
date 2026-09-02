"use client";

import { Steps } from "@forte-ui/react";

/* One number on the root. Every step before `current` is complete, that step
 * is active, and the rest are still to come — the items carry no state of
 * their own. */
export default function StepsBasic() {
  return (
    <Steps.Root current={1} className="w-full max-w-2xl">
      <Steps.Item>
        <Steps.Indicator />
        <Steps.Title>Account</Steps.Title>
        <Steps.Description>Email and password</Steps.Description>
      </Steps.Item>
      <Steps.Item>
        <Steps.Indicator />
        <Steps.Title>Address</Steps.Title>
        <Steps.Description>Where to send it</Steps.Description>
      </Steps.Item>
      <Steps.Item>
        <Steps.Indicator />
        <Steps.Title>Review</Steps.Title>
        <Steps.Description>Check and confirm</Steps.Description>
      </Steps.Item>
    </Steps.Root>
  );
}
