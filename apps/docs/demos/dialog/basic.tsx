"use client";

import { Button, Dialog, Switch } from "@dofortech/forte-ui";

const row = "flex items-center gap-3";

export default function DialogBasic() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="outline" />}>
        Edit profile
      </Dialog.Trigger>
      <Dialog.Popup size="sm">
        <Dialog.Title>Edit profile</Dialog.Title>
        <Dialog.Description>
          These details are visible to everyone in the workspace.
        </Dialog.Description>
        <label className={row}>
          <Switch defaultChecked />
          Show my email address
        </label>
        <label className={row}>
          <Switch />
          Show my local time
        </label>
        <Dialog.Footer>
          <Dialog.Close render={<Button variant="soft" tone="neutral" />}>
            Cancel
          </Dialog.Close>
          <Dialog.Close render={<Button />}>Save changes</Dialog.Close>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
