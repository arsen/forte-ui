"use client";

import { AlertDialog, Button } from "@dofortech/forte-ui";

export default function DialogAlert() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger render={<Button tone="danger" />}>
        Delete project
      </AlertDialog.Trigger>
      <AlertDialog.Popup size="sm">
        <AlertDialog.Title>Delete “Orbit landing page”?</AlertDialog.Title>
        <AlertDialog.Description>
          The project, its 42 deployments and its build logs are removed
          immediately. This cannot be undone.
        </AlertDialog.Description>
        <AlertDialog.Footer align="between">
          <AlertDialog.Close render={<Button variant="soft" tone="neutral" />}>
            Keep project
          </AlertDialog.Close>
          <AlertDialog.Close render={<Button tone="danger" />}>
            Delete project
          </AlertDialog.Close>
        </AlertDialog.Footer>
      </AlertDialog.Popup>
    </AlertDialog.Root>
  );
}
