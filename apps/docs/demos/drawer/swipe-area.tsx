"use client";

import { Button, Drawer } from "@dofortech/pretty-ui";

const hint = {
  maxInlineSize: "22rem",
  margin: 0,
  color: "var(--pui-color-foreground-muted)",
  fontSize: "var(--pui-font-size-1)",
  textAlign: "center",
} as const;

export default function DrawerSwipeArea() {
  return (
    <Drawer.Root side="left">
      {/* The strip that listens for the opening gesture. It sits outside the
          portal because it has to exist while the drawer is closed. */}
      <Drawer.SwipeArea />

      <Drawer.Trigger render={<Button variant="outline" />}>
        Open navigation
      </Drawer.Trigger>
      <p style={hint}>
        Drag inward from the left edge of the window to open this one without
        touching the button. The button stays, because a gesture nobody can see
        is a gesture most people never find.
      </p>

      <Drawer.Popup size="sm">
        <Drawer.Handle />
        <Drawer.Content>
          <Drawer.Title>Workspace</Drawer.Title>
          <Drawer.Description>
            Swipe back toward the left edge to dismiss.
          </Drawer.Description>
          <Drawer.Footer align="start">
            <Drawer.Close render={<Button variant="soft" tone="neutral" />}>
              Close
            </Drawer.Close>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Root>
  );
}
