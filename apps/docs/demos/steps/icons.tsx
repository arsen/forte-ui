"use client";

import { Steps } from "@forte-ui/react";
import { CreditCard, MapPin, PackageCheck, User } from "lucide-react";

/* Children of the indicator replace the number in every state — the fill
 * colour still carries the status, and the completed step still gets its
 * visually hidden "Completed" for a screen reader. A direct-child svg is
 * sized off the circle's text, so it follows the size preset. */
export default function StepsIcons() {
  return (
    <Steps.Root current={2} labelPlacement="below" className="w-full max-w-2xl">
      <Steps.Item>
        <Steps.Indicator>
          <User aria-hidden />
        </Steps.Indicator>
        <Steps.Title>Account</Steps.Title>
      </Steps.Item>
      <Steps.Item>
        <Steps.Indicator>
          <MapPin aria-hidden />
        </Steps.Indicator>
        <Steps.Title>Address</Steps.Title>
      </Steps.Item>
      <Steps.Item>
        <Steps.Indicator>
          <CreditCard aria-hidden />
        </Steps.Indicator>
        <Steps.Title>Payment</Steps.Title>
      </Steps.Item>
      <Steps.Item>
        <Steps.Indicator>
          <PackageCheck aria-hidden />
        </Steps.Indicator>
        <Steps.Title>Delivery</Steps.Title>
      </Steps.Item>
    </Steps.Root>
  );
}
