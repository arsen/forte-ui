"use client";

import type { ReactNode } from "react";
import { Toggle, ToggleGroup } from "@dofortech/pretty-ui";

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

export default function ToggleGroupMultiple() {
  return (
    // `multiple` lets any number of toggles be pressed at once. Without it,
    // pressing one unpresses the rest — but pressing the pressed one still
    // turns it off, so "nothing selected" stays reachable either way.
    <ToggleGroup
      multiple
      defaultValue={["bold", "italic"]}
      aria-label="Text formatting options"
    >
      <Toggle iconOnly value="bold" aria-label="Bold">
        <Icon>
          <path d="M6 4h8a4 4 0 0 1 0 8H6z" />
          <path d="M6 12h9a4 4 0 0 1 0 8H6z" />
        </Icon>
      </Toggle>
      <Toggle iconOnly value="italic" aria-label="Italic">
        <Icon>
          <path d="M19 4h-9M14 20H5M15 4 9 20" />
        </Icon>
      </Toggle>
      <Toggle iconOnly value="underline" aria-label="Underline">
        <Icon>
          <path d="M6 4v6a6 6 0 0 0 12 0V4M4 21h16" />
        </Icon>
      </Toggle>
    </ToggleGroup>
  );
}
