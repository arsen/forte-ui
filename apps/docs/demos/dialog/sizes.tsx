"use client";

import { Button, Dialog, type DialogSize } from "@forte-ui/react";

const SIZES: { size: DialogSize; label: string }[] = [
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
  { size: "fullscreen", label: "Fullscreen" },
];

export default function DialogSizes() {
  return (
    <>
      {SIZES.map(({ size, label }) => (
        <Dialog.Root key={size}>
          <Dialog.Trigger render={<Button variant="outline" />}>
            {label}
          </Dialog.Trigger>
          <Dialog.Popup size={size}>
            <Dialog.Title>Release 4.2 is live</Dialog.Title>
            <Dialog.Description>
              Deploy previews now build in parallel, and the CLI reports the
              slowest step of every run.
            </Dialog.Description>
            <Dialog.Footer>
              <Dialog.Close render={<Button />}>Got it</Dialog.Close>
            </Dialog.Footer>
          </Dialog.Popup>
        </Dialog.Root>
      ))}
    </>
  );
}
