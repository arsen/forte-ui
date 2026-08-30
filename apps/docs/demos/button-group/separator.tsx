"use client";

import { Button, ButtonGroup } from "@forte-ui/react";

export default function ButtonGroupSeparator() {
  return (
    // `soft` buttons have no visible border, so fused bare they read as one
    // unbroken slab — the separator is what puts the seams back.
    <ButtonGroup.Root aria-label="Deployment">
      <Button variant="soft" tone="neutral">Build</Button>
      <ButtonGroup.Separator />
      <Button variant="soft" tone="neutral">Preview</Button>
      <ButtonGroup.Separator />
      <Button variant="soft" tone="neutral">Deploy</Button>
    </ButtonGroup.Root>
  );
}
