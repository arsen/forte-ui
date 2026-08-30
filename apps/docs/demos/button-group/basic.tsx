"use client";

import { Archive, Clock, Flag } from "lucide-react";
import { Button, ButtonGroup } from "@forte-ui/react";

const ICON = "size-4 shrink-0";

export default function ButtonGroupBasic() {
  return (
    // `role="group"` has no name of its own — `aria-label` is what tells a
    // screen reader these three answer the same question.
    <ButtonGroup.Root aria-label="Message actions">
      {/* `outline` is the natural variant for a fused group: every control
        * draws its own border, so the seams come for free — no separators. */}
      <Button variant="outline" tone="neutral">
        <Archive className={ICON} aria-hidden />
        Archive
      </Button>
      <Button variant="outline" tone="neutral">
        <Flag className={ICON} aria-hidden />
        Report
      </Button>
      <Button variant="outline" tone="neutral">
        <Clock className={ICON} aria-hidden />
        Snooze
      </Button>
    </ButtonGroup.Root>
  );
}
