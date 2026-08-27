"use client";

import * as React from "react";
import { Button, Dialog } from "@dofortech/pretty-ui";

const ASSETS = [
  { name: "hero-wide.png", size: "2400 × 1260", weight: "812 KB" },
  { name: "og-card.png", size: "1200 × 630", weight: "241 KB" },
  { name: "avatar-fallback.png", size: "512 × 512", weight: "18 KB" },
];

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// A wrapper is where the pointer-events handoff has to be repeated. The
// stylesheet gives `pointer-events: auto` back to the popup's DIRECT children,
// so this row — which spans the full width of the popup — would otherwise
// swallow every press in the empty space either side of the buttons, and
// outside-press dismissal would stop working in a band across the screen.
const pager = "pointer-events-none flex justify-center gap-(--pui-control-gap)";

const preview =
  "grid h-[10rem] place-items-center rounded-3 bg-panel font-mono text-1 text-foreground-muted";

export default function DialogOutsidePopup() {
  const [index, setIndex] = React.useState(0);
  const asset = ASSETS[index];

  return (
    <Dialog.Root onOpenChange={(open) => !open && setIndex(0)}>
      <Dialog.Trigger render={<Button variant="outline" />}>
        Preview assets
      </Dialog.Trigger>

      {/* The close button and the pager below are painted outside the panel,
          but they are still rendered inside Dialog.Popup — which is what keeps
          them in the tab order and in the accessibility tree. Everything
          outside the popup is inert while a modal dialog is open, so a button
          moved out of it would not merely be unstyled, it would be
          unreachable. Dialog.Surface is what makes that possible: its presence
          turns the popup into a transparent container and takes over the
          paint. */}
      <Dialog.Popup size="sm">
        <Dialog.Close
          aria-label="Close"
          // A direct child of the popup, so it gets its clicks back without
          // any help — and `flex-end` puts it clear of the panel's corner
          // rather than inside it.
          className="self-end"
          render={<Button iconOnly size="sm" tone="neutral" />}
        >
          <Icon>
            <path d="M18 6 6 18M6 6l12 12" />
          </Icon>
        </Dialog.Close>

        <Dialog.Surface>
          <Dialog.Title>{asset.name}</Dialog.Title>
          <Dialog.Description>
            {asset.size} · {asset.weight}
          </Dialog.Description>
          <div className={preview}>{asset.name}</div>
        </Dialog.Surface>

        <div className={pager}>
          <Button
            size="sm"
            tone="neutral"
            className="pointer-events-auto"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
          >
            Previous
          </Button>
          <Button
            size="sm"
            tone="neutral"
            className="pointer-events-auto"
            disabled={index === ASSETS.length - 1}
            onClick={() => setIndex((i) => i + 1)}
          >
            Next
          </Button>
        </div>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
