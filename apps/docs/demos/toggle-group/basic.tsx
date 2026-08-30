"use client";

import type { ReactNode } from "react";
import { Toggle, ToggleGroup } from "@dofortech/forte-ui";

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
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export default function ToggleGroupBasic() {
  return (
    // `role="group"` is not a labelable element, so the group cannot take a
    // <label> — it needs `aria-label` or `aria-labelledby` instead. Without one
    // these read as three unrelated buttons.
    <ToggleGroup aria-label="Text alignment" defaultValue={["left"]}>
      {/* Every toggle in a group needs a `value`: the group's value is the list
        * of pressed toggles' values, so one without it can never appear in it
        * (Base UI logs an error in development). */}
      <Toggle iconOnly value="left" aria-label="Align left">
        <Icon>
          <path d="M4 6h16M4 12h10M4 18h13" />
        </Icon>
      </Toggle>
      <Toggle iconOnly value="center" aria-label="Align center">
        <Icon>
          <path d="M4 6h16M7 12h10M6 18h12" />
        </Icon>
      </Toggle>
      <Toggle iconOnly value="right" aria-label="Align right">
        <Icon>
          <path d="M4 6h16M10 12h10M7 18h13" />
        </Icon>
      </Toggle>
    </ToggleGroup>
  );
}
