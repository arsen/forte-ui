"use client";

import { Collapsible } from "@dofortech/forte-ui";

const stack = "flex w-full max-w-lg flex-col gap-4";

/* A solid caret rather than the default outlined chevron. Pointing DOWN, so
 * the trigger's 180° flip lands it pointing up — a marker that is symmetric
 * about the wrong axis (a plus, a dot) reads as not having moved. It needs no
 * `aria-hidden` of its own: Collapsible.Trigger wraps whatever you pass in a
 * box that already has one. */
function CaretDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="block">
      <path d="M8 11 4 6h8z" />
    </svg>
  );
}

export default function CollapsibleCustomIcon() {
  return (
    <div className={stack}>
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
