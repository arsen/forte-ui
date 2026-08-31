"use client";

import { Button, Kbd } from "@forte-ui/react";

export default function KbdComposed() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* The cap draws itself out of `currentColor`, so it needs nothing
        * changed to sit on a solid fill, a soft one, or none at all.
        *
        * `aria-hidden` on each cap, because a glyph inside a button lands in
        * the button's accessible NAME — "Send ⌘⏎" is announced as "Send place
        * of interest sign return symbol". `aria-keyshortcuts` carries the
        * keys instead, spelled in words. */}
      <Button aria-keyshortcuts="Meta+Enter">
        Send
        <Kbd aria-hidden="true">⌘⏎</Kbd>
      </Button>
      <Button variant="soft" tone="neutral" aria-keyshortcuts="Meta+S">
        Save draft
        <Kbd aria-hidden="true">⌘S</Kbd>
      </Button>
      <Button variant="outline" tone="neutral" aria-keyshortcuts="Escape">
        Discard
        <Kbd aria-hidden="true">Esc</Kbd>
      </Button>
    </div>
  );
}
