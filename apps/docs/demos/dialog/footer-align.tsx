"use client";

import { Button, Dialog, type DialogFooterAlign } from "@dofortech/pretty-ui";

const ALIGNS: { align: DialogFooterAlign; blurb: string }[] = [
  {
    align: "start",
    blurb:
      "Actions sit under the text they follow. Right for a dialog read left to right, top to bottom.",
  },
  {
    align: "center",
    blurb:
      "One action, centred. Reads as an acknowledgement rather than a choice.",
  },
  {
    align: "end",
    blurb:
      "The default. The confirm lands closest to where the eye leaves the dialog.",
  },
  {
    align: "between",
    blurb:
      "The two are pushed apart, which is what you want when one of them is destructive.",
  },
];

export default function DialogFooterAlignment() {
  return (
    <>
      {ALIGNS.map(({ align, blurb }) => (
        <Dialog.Root key={align}>
          <Dialog.Trigger render={<Button variant="outline" />}>
            {align}
          </Dialog.Trigger>
          <Dialog.Popup>
            <Dialog.Title>align=&ldquo;{align}&rdquo;</Dialog.Title>
            <Dialog.Description>{blurb}</Dialog.Description>
            {/* The footer is a flex row that wraps, so on a narrow screen the
                buttons stack and the alignment applies to each line. */}
            <Dialog.Footer align={align}>
              <Dialog.Close render={<Button variant="soft" tone="neutral" />}>
                Cancel
              </Dialog.Close>
              <Dialog.Close render={<Button />}>Confirm</Dialog.Close>
            </Dialog.Footer>
          </Dialog.Popup>
        </Dialog.Root>
      ))}
    </>
  );
}
