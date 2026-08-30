"use client";

import { Button, Popover } from "@forte-ui/react";

export default function PopoverBasic() {
  return (
    <Popover.Root>
      <Popover.Trigger render={<Button variant="outline" tone="neutral" />}>
        Notifications
      </Popover.Trigger>
      <Popover.Popup>
        <Popover.Arrow />
        <Popover.Title>Notifications</Popover.Title>
        <Popover.Description>
          You are all caught up. New activity in the workspace will show up
          here.
        </Popover.Description>
      </Popover.Popup>
    </Popover.Root>
  );
}
