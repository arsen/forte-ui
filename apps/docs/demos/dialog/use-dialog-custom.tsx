"use client";

import * as React from "react";
import {
  Button,
  Dialog,
  useDialog,
  type CustomDialogProps,
} from "@dofortech/pretty-ui";

const ENVIRONMENTS = [
  { id: "production", label: "Production", detail: "orbit.example.com" },
  { id: "staging", label: "Staging", detail: "staging.orbit.example.com" },
  { id: "preview", label: "Preview", detail: "Per-branch URLs" },
];

const receipt = "m-0 font-mono text-1 text-foreground-muted";

/**
 * A dialog of your own. It renders the CONTENTS — one `Dialog.Popup` — and the
 * provider owns the `Dialog.Root` around it, which is what lets the promise
 * settle even when the dialog is dismissed rather than answered.
 */
function ChooseEnvironment({
  payload,
  close,
}: CustomDialogProps<{ current: string }, string>) {
  return (
    <Dialog.Popup size="sm">
      <Dialog.Title>Deploy to…</Dialog.Title>
      <Dialog.Description>
        The current branch is built and promoted in place.
      </Dialog.Description>
      <div className="flex flex-col gap-2">
        {ENVIRONMENTS.map((environment) => (
          <Button
            key={environment.id}
            variant={environment.id === payload.current ? "soft" : "outline"}
            fullWidth
            onClick={() => close(environment.id)}
          >
            {environment.label}
          </Button>
        ))}
      </div>
      <Dialog.Footer>
        <Dialog.Close render={<Button variant="ghost" tone="neutral" />}>
          Cancel
        </Dialog.Close>
      </Dialog.Footer>
    </Dialog.Popup>
  );
}

function Trigger() {
  const dialog = useDialog();
  const [target, setTarget] = React.useState("staging");

  async function choose() {
    // `show()` resolves with whatever the component passed to `close()`, or
    // with `undefined` when it was dismissed instead — hence the guard.
    const chosen = await dialog.show(ChooseEnvironment, { current: target });
    if (chosen !== undefined) {
      setTarget(chosen);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button variant="outline" onClick={() => void choose()}>
        Deploy
      </Button>
      <p className={receipt}>target: {target}</p>
    </div>
  );
}

export default function DialogUseDialogCustom() {
  return (
    <Dialog.Provider>
      <Trigger />
    </Dialog.Provider>
  );
}
