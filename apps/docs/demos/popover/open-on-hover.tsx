"use client";

import { Button, Popover } from "@forte-ui/react";

export default function PopoverOpenOnHover() {
  return (
    <span className="inline-flex items-center gap-2">
      Monthly active users
      <Popover.Root>
        {/* This is the info-icon pattern, and `openOnHover` is what makes it
          * the accessible one. It reveals on hover like a tooltip for pointer
          * users, but the popup is still announced, still tabbable, and still
          * opens on press — so touch and screen-reader users are not left
          * with an icon that does nothing. */}
        <Popover.Trigger
          openOnHover
          delay={200}
          aria-label="About monthly active users"
          render={<Button variant="ghost" tone="neutral" size="sm" iconOnly />}
        >
          <InfoIcon />
        </Popover.Trigger>
        <Popover.Popup size="sm">
          <Popover.Arrow />
          <Popover.Description>
            Anyone who signed in at least once in the last 30 days. Service
            accounts are excluded.
          </Popover.Description>
        </Popover.Popup>
      </Popover.Root>
    </span>
  );
}

function InfoIcon() {
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}
