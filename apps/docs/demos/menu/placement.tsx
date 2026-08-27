"use client";

import { Menu } from "@dofortech/pretty-ui";

/* Every side Base UI accepts. The last two are the LOGICAL spellings of the two
 * above them — but they mirror only when the app mounts Base UI's
 * `DirectionProvider`, which resolves them from React context rather than from
 * the `dir` attribute the frame's direction toggle sets. These docs mount no
 * provider, so all four of the inline rows below land where `left` and `right`
 * do, in both directions. */
const SIDES = [
  "top",
  "bottom",
  "left",
  "right",
  "inline-start",
  "inline-end",
] as const;

const ALIGNS = ["start", "center", "end"] as const;

export default function MenuPlacement() {
  return (
    <div className="grid grid-cols-[auto_repeat(3,minmax(0,1fr))] items-center gap-2">
      <div />
      {ALIGNS.map((align) => (
        <p key={align} className="m-0 text-center text-1 text-foreground-muted">
          {align}
        </p>
      ))}

      {SIDES.map((side) => (
        <div key={side} className="contents">
          <p className="m-0 pe-2 text-end text-1 text-foreground-muted">
            {side}
          </p>
          {ALIGNS.map((align) => (
            <Menu.Root key={align}>
              {/* The visible label is the column's `align`; the accessible name
                * spells out the whole combination, since eighteen buttons all
                * reading "start", "center" or "end" would be indistinguishable
                * in a list of links and form controls. It still CONTAINS the
                * visible text, which is what SC 2.5.3 asks for. */}
              <Menu.Trigger
                className="w-full"
                aria-label={`${side} · ${align}`}
              >
                {align}
              </Menu.Trigger>
              {/* Both props are hints: the popup flips to the opposite side, or
                * shifts along the alignment axis, rather than overflow the
                * viewport — so a row near an edge may not land where it says. */}
              <Menu.Popup side={side} align={align}>
                <Menu.Item>Rename…</Menu.Item>
                <Menu.Item>Duplicate</Menu.Item>
                <Menu.Item>Archive</Menu.Item>
              </Menu.Popup>
            </Menu.Root>
          ))}
        </div>
      ))}
    </div>
  );
}
