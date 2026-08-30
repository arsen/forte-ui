"use client";

import * as React from "react";
import { NavigationMenu } from "@dofortech/forte-ui";

/* Every side Base UI accepts. The last two are the LOGICAL spellings of the
 * two above them — but they mirror only when the app mounts Base UI's
 * `DirectionProvider`, which resolves them from React context rather than from
 * the `dir` attribute the frame's direction toggle sets. These docs mount no
 * provider, so the inline rows land where `left` and `right` do, in both
 * directions. */
const SIDES = ["top", "bottom", "left", "right", "inline-start", "inline-end"] as const;
const ALIGNS = ["start", "center", "end"] as const;

export default function NavigationMenuPlacement() {
  const [side, setSide] = React.useState<(typeof SIDES)[number]>("bottom");
  const [align, setAlign] = React.useState<(typeof ALIGNS)[number]>("center");

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex flex-wrap items-center justify-center gap-4">
        <label className="flex items-center gap-2 text-1 text-foreground-muted">
          side
          <select
            className="rounded-control border border-border bg-panel px-2 py-1 text-2 text-foreground"
            value={side}
            onChange={(event) => setSide(event.target.value as (typeof SIDES)[number])}
          >
            {SIDES.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-1 text-foreground-muted">
          align
          <select
            className="rounded-control border border-border bg-panel px-2 py-1 text-2 text-foreground"
            value={align}
            onChange={(event) => setAlign(event.target.value as (typeof ALIGNS)[number])}
          >
            {ALIGNS.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>

      <NavigationMenu.Root aria-label="Placement">
        <NavigationMenu.List>
          <NavigationMenu.Item>
            <NavigationMenu.Trigger>Placement</NavigationMenu.Trigger>
            <NavigationMenu.Content>
              <NavigationMenu.Link href="/components/navigation-menu" closeOnClick>
                <NavigationMenu.LinkTitle>
                  side={`"${side}"`} · align={`"${align}"`}
                </NavigationMenu.LinkTitle>
                <NavigationMenu.LinkDescription>
                  Both are hints: the panel flips or shifts rather than overflow
                  the viewport, so a bar near an edge may not land where it says.
                </NavigationMenu.LinkDescription>
              </NavigationMenu.Link>
            </NavigationMenu.Content>
          </NavigationMenu.Item>
        </NavigationMenu.List>

        <NavigationMenu.Popup side={side} align={align} arrow />
      </NavigationMenu.Root>
    </div>
  );
}
