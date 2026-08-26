"use client";

import type { ReactNode } from "react";
import { Toggle } from "@dofortech/pretty-ui";

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
      // Decorative: the accessible name comes from the button's aria-label, and
      // a title-less <svg> left in the tree would be announced as "graphic".
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export default function ToggleIconOnly() {
  return (
    <div style={{ display: "flex", gap: "var(--pui-space-1)" }}>
      {/* `iconOnly` squares the button and pins its width to at least 24px, so
        * the hit target still clears WCAG SC 2.5.8 at `size="sm"`. An icon is
        * not an accessible name, so every one of these needs `aria-label`. */}
      <Toggle iconOnly aria-label="Mute notifications" defaultPressed>
        <Icon>
          <path d="M11 5 6 9H2v6h4l5 4V5Z" />
          <path d="m23 9-6 6" />
          <path d="m17 9 6 6" />
        </Icon>
      </Toggle>
      <Toggle iconOnly aria-label="Pin to top">
        <Icon>
          <path d="M12 17v5" />
          <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1Z" />
        </Icon>
      </Toggle>
      <Toggle iconOnly aria-label="Star this thread">
        <Icon>
          <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" />
        </Icon>
      </Toggle>
    </div>
  );
}
