"use client";

import { Button, Dialog } from "@dofortech/forte-ui";

export default function DialogNested() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="outline" />}>
        Manage billing
      </Dialog.Trigger>
      <Dialog.Popup>
        <Dialog.Title>Billing</Dialog.Title>
        <Dialog.Description>
          The Team plan renews on 3 September for $240, billed to the card
          ending 4242.
        </Dialog.Description>

        <Dialog.Root>
          <Dialog.Trigger render={<Button variant="soft" />}>
            Change plan
          </Dialog.Trigger>
          <Dialog.Popup size="sm">
            <Dialog.Title>Switch to Business</Dialog.Title>
            <Dialog.Description>
              $480 a month for up to 50 seats. The change takes effect at the
              next renewal, and today’s invoice is unaffected.
            </Dialog.Description>
            <Dialog.Footer>
              <Dialog.Close render={<Button variant="soft" tone="neutral" />}>
                Back
              </Dialog.Close>
              <Dialog.Close render={<Button />}>Confirm switch</Dialog.Close>
            </Dialog.Footer>
          </Dialog.Popup>
        </Dialog.Root>

        <Dialog.Footer>
          <Dialog.Close render={<Button variant="soft" tone="neutral" />}>
            Close
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
