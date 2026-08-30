"use client";

import { Button, Tooltip } from "@forte-ui/react";

export default function TooltipBasic() {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        aria-label="Archive conversation"
        render={<Button variant="ghost" tone="neutral" iconOnly />}
      >
        <ArchiveIcon />
      </Tooltip.Trigger>
      <Tooltip.Popup>
        <Tooltip.Arrow />
        Archive conversation
      </Tooltip.Popup>
    </Tooltip.Root>
  );
}

function ArchiveIcon() {
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
      <rect x="3" y="3" width="18" height="5" rx="1" />
      <path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}
