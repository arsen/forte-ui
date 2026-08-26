"use client";

import { Button, Drawer, type DrawerSide } from "@dofortech/pretty-ui";

const SIDES: { side: DrawerSide; label: string; blurb: string }[] = [
  {
    side: "left",
    label: "Left",
    blurb: "Navigation lives here. Drag toward the left edge to dismiss.",
  },
  {
    side: "right",
    label: "Right",
    blurb: "Filters, details and inspectors — the usual right-hand panel.",
  },
  {
    side: "top",
    label: "Top",
    blurb: "Good for a command bar or a site-wide notice.",
  },
  {
    side: "bottom",
    label: "Bottom",
    blurb: "The mobile action sheet. Drag it down to dismiss.",
  },
];

export default function DrawerSides() {
  return (
    <>
      {SIDES.map(({ side, label, blurb }) => (
        <Drawer.Root key={side} side={side}>
          <Drawer.Trigger render={<Button variant="outline" />}>
            {label}
          </Drawer.Trigger>
          <Drawer.Popup>
            <Drawer.Handle />
            <Drawer.Content>
              <Drawer.Title>{label} drawer</Drawer.Title>
              <Drawer.Description>{blurb}</Drawer.Description>
              <Drawer.Footer>
                <Drawer.Close render={<Button />}>Close</Drawer.Close>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Root>
      ))}
    </>
  );
}
