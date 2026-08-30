"use client";

import { PreviewCard } from "@forte-ui/react";

/**
 * A link long enough to wrap. Narrow the frame until it breaks across two
 * lines, then hover each line in turn: the card follows the line the pointer
 * is on rather than centring itself over the whole two-line block.
 */
export default function PreviewCardInline() {
  return (
    <p className="max-w-3xs text-2 leading-normal">
      Most of the interface vocabulary here comes from{" "}
      <PreviewCard.Root>
        <PreviewCard.Trigger href="https://base-ui.com">
          the Base UI primitives this library is built on
        </PreviewCard.Trigger>
        <PreviewCard.Popup size="sm">
          <PreviewCard.Arrow />
          <div className="grid">
            <span className="text-3 font-semibold">Base UI</span>
            <span className="text-1 text-foreground-muted">base-ui.com</span>
          </div>
          <p className="text-2 text-foreground-muted">
            Unstyled React components with the accessibility behaviour already
            wired up.
          </p>
        </PreviewCard.Popup>
      </PreviewCard.Root>
      , which supply the anatomy.
    </p>
  );
}
