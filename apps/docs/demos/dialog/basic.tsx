"use client";

import { Button, Dialog, Switch } from "@dofortech/pretty-ui";

const row = {
  display: "flex",
  alignItems: "center",
  gap: "var(--pui-space-3)",
} as const;

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
        <label style={row}>
          <Switch defaultChecked />
          Show my email address
        </label>
        <label style={row}>
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
