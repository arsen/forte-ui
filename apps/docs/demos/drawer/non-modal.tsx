"use client";

import * as React from "react";
import { Button, Drawer, type DrawerVariant } from "@forte-ui/react";

const VARIANTS: DrawerVariant[] = ["edge", "floating"];

export default function DrawerNonModal() {
  const [clicks, setClicks] = React.useState(0);

  return (
    <>
      {VARIANTS.map((variant) => (
        // `modal={false}` alone is not enough for a panel meant to stay up:
        // the first click on the supposedly usable page would dismiss it, and
        // in a non-modal drawer so would focus merely moving outside.
        // `disablePointerDismissal` closes both routes, leaving Escape,
        // Drawer.Close and the swipe as the deliberate ways out.
        <Drawer.Root
          key={variant}
          side="right"
          modal={false}
          disablePointerDismissal
        >
          <Drawer.Trigger render={<Button variant="outline" />}>
            {variant === "edge" ? "Edge" : "Floating"} panel
          </Drawer.Trigger>
          {/* No scrim either — a dimmed page that still works reads as a page
              that is broken. */}
          <Drawer.Popup variant={variant} size="sm" backdrop={false}>
            <Drawer.Content>
              <Drawer.Title>Reviewer notes</Drawer.Title>
              <Drawer.Description>
                The page behind this panel is still live: no scrim, no focus
                trap, no scroll lock. Keep working with it open — the counter
                below still counts.
              </Drawer.Description>
              <Drawer.Footer>
                <Drawer.Close render={<Button variant="soft" tone="neutral" />}>
                  Close
                </Drawer.Close>
              </Drawer.Footer>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Root>
      ))}

      <Button
        variant="soft"
        tone="neutral"
        onClick={() => setClicks((n) => n + 1)}
      >
        Still clickable — {clicks}
      </Button>
    </>
  );
}
