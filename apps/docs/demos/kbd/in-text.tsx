"use client";

import { Kbd } from "@forte-ui/react";

export default function KbdInText() {
  return (
    <p className="m-0 max-w-[36ch] text-2 leading-normal">
      Press <Kbd>⌘K</Kbd> to open the palette, <Kbd>↑</Kbd> and <Kbd>↓</Kbd> to
      move through it, and <Kbd>Esc</Kbd> to put it away.
    </p>
  );
}
