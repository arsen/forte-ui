"use client";

import { Kbd, KbdGroup } from "@forte-ui/react";

export default function KbdGroupDemo() {
  return (
    <div className="flex flex-col items-start gap-3">
      {/* A chord as separate caps. No separator needed — the caps do it. */}
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>⇧</Kbd>
        <Kbd>P</Kbd>
      </KbdGroup>

      {/* Spelled-out keys read better with the plus written between them —
        * plain text inside the group is fine, and takes the group's gap. */}
      <KbdGroup className="text-2 text-foreground-muted">
        <Kbd>Ctrl</Kbd>+<Kbd>Alt</Kbd>+<Kbd>Del</Kbd>
      </KbdGroup>

      {/* A sequence rather than a chord. */}
      <KbdGroup className="text-2 text-foreground-muted">
        <Kbd>G</Kbd> then <Kbd>D</Kbd>
      </KbdGroup>
    </div>
  );
}
