"use client";

import { Kbd } from "@forte-ui/react";

export default function KbdBasic() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Kbd>⌘K</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>Tab</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>⏎</Kbd>
      <Kbd>F2</Kbd>
    </div>
  );
}
