"use client";

import type { ReactNode } from "react";
import { Button, Tooltip } from "@dofortech/pretty-ui";

export default function TooltipWithProvider() {
  return (
    <Tooltip.Provider delay={400}>
      <div style={{ display: "flex", gap: "0.25rem" }}>
        <Tooltip.Root>
          <Tooltip.Trigger
            aria-label="Bold"
            render={<Button variant="ghost" tone="neutral" iconOnly />}
          >
            <BoldIcon />
          </Tooltip.Trigger>
          <Tooltip.Popup>
            <Tooltip.Arrow />
            Bold
          </Tooltip.Popup>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger
            aria-label="Italic"
            render={<Button variant="ghost" tone="neutral" iconOnly />}
          >
            <ItalicIcon />
          </Tooltip.Trigger>
          <Tooltip.Popup>
            <Tooltip.Arrow />
            Italic
          </Tooltip.Popup>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger
            aria-label="Underline"
            render={<Button variant="ghost" tone="neutral" iconOnly />}
          >
            <UnderlineIcon />
          </Tooltip.Trigger>
          <Tooltip.Popup>
            <Tooltip.Arrow />
            Underline
          </Tooltip.Popup>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger
            aria-label="Insert link"
            render={<Button variant="ghost" tone="neutral" iconOnly />}
          >
            <LinkIcon />
          </Tooltip.Trigger>
          <Tooltip.Popup>
            <Tooltip.Arrow />
            Insert link
          </Tooltip.Popup>
        </Tooltip.Root>
      </div>
    </Tooltip.Provider>
  );
}

function Icon({ children }: { children: ReactNode }) {
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

function BoldIcon() {
  return (
    <Icon>
      <path d="M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" />
    </Icon>
  );
}

function ItalicIcon() {
  return (
    <Icon>
      <path d="M19 4h-9M14 20H5M15 4 9 20" />
    </Icon>
  );
}

function UnderlineIcon() {
  return (
    <Icon>
      <path d="M6 4v6a6 6 0 0 0 12 0V4M4 21h16" />
    </Icon>
  );
}

function LinkIcon() {
  return (
    <Icon>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Icon>
  );
}
