"use client";

import * as React from "react";
import { Button, Dialog, Input } from "@dofortech/forte-ui";

const LINK = "https://orbit.example.com/p/8fa21c";

// The library ships no icon set, so a demo draws its own — the same shape
// lucide's `x` uses, sized in `em` so it tracks the button's font size.
function CloseIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

const header = "flex items-start justify-between gap-4";

// The heading column has to carry the popup's own gap. `.title + .description`
// tightens the pair with a NEGATIVE top margin that cancels that gap — so in a
// wrapper with no gap of its own the description would ride up onto the title.
// Reading the knob rather than hardcoding `gap-4` keeps the two in step if an
// app retunes `--forte-dialog-gap`.
const heading = "flex min-w-0 flex-col gap-(--forte-dialog-gap)";

const linkRow = "flex gap-(--forte-control-gap)";

export default function DialogHeader() {
  const [copied, setCopied] = React.useState(false);

  return (
    // Reset the button's label on the way out, so a dialog reopened later
    // does not claim it has already copied anything.
    <Dialog.Root onOpenChange={(open) => !open && setCopied(false)}>
      <Dialog.Trigger render={<Button variant="outline" />}>
        Share project
      </Dialog.Trigger>
      <Dialog.Popup size="sm">
        <div className={header}>
          <div className={heading}>
            <Dialog.Title>Share “Orbit landing page”</Dialog.Title>
            <Dialog.Description>
              Anyone with the link can read the project until you revoke it.
            </Dialog.Description>
          </div>
          {/* `iconOnly` squares the button off and holds the 24px minimum hit
              target from WCAG SC 2.5.8. There is no text to announce, so the
              `aria-label` is not optional — without it the button is read out
              as just "button".

              The negative margins pull it back into the popup's padding so the
              × sits in the corner rather than indented from it, and `-mt-1`
              lines its centre up with the title's first line rather than with
              the top of the text box. */}
          <Dialog.Close
            iconOnly
            aria-label="Close"
            className="-mt-1 -me-2 shrink-0"
          >
            <CloseIcon />
          </Dialog.Close>
        </div>

        <div className={linkRow}>
          {/* `readOnly`, not `disabled`: the value is still selectable and
              still reachable by keyboard, it just cannot be edited. */}
          <Input readOnly fullWidth aria-label="Share link" value={LINK} />
          {/* The label is the feedback — a copy that says nothing back leaves
              the user pressing the button twice. */}
          <Button
            variant="soft"
            tone="neutral"
            onClick={() => {
              navigator.clipboard?.writeText(LINK).then(
                () => setCopied(true),
                () => setCopied(false),
              );
            }}
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        {/* A dialog can have both. The corner × is the escape hatch that is
            always in the same place; the footer is where the decision lives. */}
        <Dialog.Footer>
          <Dialog.Close render={<Button variant="soft" tone="neutral" />}>
            Revoke link
          </Dialog.Close>
          <Dialog.Close render={<Button />}>Done</Dialog.Close>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
