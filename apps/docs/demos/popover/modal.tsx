"use client";

import { Button, Popover } from "@forte-ui/react";

export default function PopoverModal() {
  return (
    <>
      <Popover.Root modal>
        <Popover.Trigger render={<Button variant="outline" tone="neutral" />}>
          Modal
        </Popover.Trigger>
        {/* The scrim is opt-in and belongs with `modal`: page scroll is
          * already locked and everything outside the popup is already inert,
          * so the dimming is what tells the user that. On a non-modal popover
          * it would lie. */}
        <Popover.Popup backdrop>
          <Popover.Arrow />
          <Popover.Title>Modal popover</Popover.Title>
          <Popover.Description>
            Page scroll is locked and the rest of the page ignores clicks. Tab
            cycles inside this popup and cannot leave it.
          </Popover.Description>
          <Popover.Footer>
            {/* Required, not decorative. With `modal`, rendering a Close
              * inside the popup is what switches focus trapping on — and it
              * is the only way out for a touch screen-reader user, who has
              * neither Escape nor an outside press. */}
            <Popover.Close render={<Button variant="soft" tone="neutral" />}>
              Close
            </Popover.Close>
          </Popover.Footer>
        </Popover.Popup>
      </Popover.Root>

      <Popover.Root modal="trap-focus">
        <Popover.Trigger render={<Button variant="outline" tone="neutral" />}>
          Trap focus only
        </Popover.Trigger>
        <Popover.Popup>
          <Popover.Arrow />
          <Popover.Title>Focus trapped</Popover.Title>
          <Popover.Description>
            Tab stays inside the popup, but the page behind still scrolls and
            still takes clicks.
          </Popover.Description>
          <Popover.Footer>
            <Popover.Close render={<Button variant="soft" tone="neutral" />}>
              Close
            </Popover.Close>
          </Popover.Footer>
        </Popover.Popup>
      </Popover.Root>
    </>
  );
}
