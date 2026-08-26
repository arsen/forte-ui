"use client";

import { Button, Drawer, type DrawerSide } from "@dofortech/pretty-ui";

const SIDES: DrawerSide[] = ["left", "right", "bottom"];

export default function DrawerFloating() {
  return (
    <>
      {SIDES.map((side) => (
        <Drawer.Root key={side} side={side}>
          <Drawer.Trigger render={<Button variant="outline" />}>
            Floating {side}
          </Drawer.Trigger>
          <Drawer.Popup variant="floating" size="sm">
            <Drawer.Handle />
            <Drawer.Content>
              <Drawer.Title>Detached from the edge</Drawer.Title>
              <Drawer.Description>
                A floating drawer is inset on every side, so all four corners
                are rounded and the page stays visible around it.
              </Drawer.Description>
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
