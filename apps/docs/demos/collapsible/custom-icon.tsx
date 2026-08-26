"use client";

import type { CSSProperties } from "react";
import { Collapsible } from "@dofortech/pretty-ui";

const stack: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--pui-space-4)",
  inlineSize: "min(32rem, 100%)",
};

/* A solid caret rather than the default outlined chevron. Pointing DOWN, so
 * the trigger's 180° flip lands it pointing up — a marker that is symmetric
 * about the wrong axis (a plus, a dot) reads as not having moved. It needs no
 * `aria-hidden` of its own: Collapsible.Trigger wraps whatever you pass in a
 * box that already has one. */
function CaretDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      style={{ display: "block" }}
    >
      <path d="M8 11 4 6h8z" />
    </svg>
  );
}

export default function CollapsibleCustomIcon() {
  return (
    <div style={stack}>
      <Collapsible.Root variant="contained">
        <Collapsible.Trigger icon={<CaretDownIcon />}>
          A different marker
        </Collapsible.Trigger>
        <Collapsible.Panel>
          `icon` replaces the chevron inside the same rotating, `aria-hidden`
          box, so the rotation and its spring come for free.
        </Collapsible.Panel>
      </Collapsible.Root>

      <Collapsible.Root variant="contained">
        <Collapsible.Trigger icon={null}>No marker at all</Collapsible.Trigger>
        <Collapsible.Panel>
          `icon={null}` drops it. `aria-expanded` still announces the state, so
          nothing is lost for a screen reader — only for the eye.
        </Collapsible.Panel>
      </Collapsible.Root>
    </div>
  );
}
