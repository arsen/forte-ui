"use client";

import * as React from "react";
import { Alert, Button } from "@dofortech/pretty-ui";

export default function AlertDismissible() {
  const [open, setOpen] = React.useState(true);
  /* Tracked separately from `open` on purpose: the two callbacks fire at
    * opposite ends of the exit, and this is the one that means "the card has
    * actually left". Keying the button off `open` instead would pop it up
    * beside a card that is still on screen. */
  const [gone, setGone] = React.useState(false);

  return (
    <div className="grid w-full gap-3">
      {/* Uncontrolled: no state, no handler. `Alert.Close` runs the exit and
        * the root removes itself when the transition finishes. */}
      <Alert.Root tone="warning">
        <Alert.Icon />
        <Alert.Title>Two invoices are overdue</Alert.Title>
        <Alert.Description>
          Settle them before the 30th to keep the account active.
        </Alert.Description>
        <Alert.Close />
      </Alert.Root>

      {/* Controlled: `open` is yours, and setting it to false starts the exit
        * rather than ending it — the card is still on screen for the length of
        * the transition. Rendering it as `{open && <Alert.Root>}` instead
        * would skip the animation entirely, because React takes the element
        * out of the DOM before any of it can run. */}
      <Alert.Root
        tone="info"
        open={open}
        onOpenChange={setOpen}
        onExitComplete={() => setGone(true)}
      >
        <Alert.Icon />
        <Alert.Title>Your export is ready</Alert.Title>
        <Alert.Description>The link is good for seven days.</Alert.Description>
        <Alert.Close />
      </Alert.Root>

      {gone ? (
        <Button
          variant="outline"
          size="sm"
          className="justify-self-start"
          onClick={() => {
            setGone(false);
            setOpen(true);
          }}
        >
          Bring it back
        </Button>
      ) : null}
    </div>
  );
}
