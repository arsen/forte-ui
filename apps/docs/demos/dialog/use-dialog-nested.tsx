"use client";

import * as React from "react";
import {
  Button,
  Dialog,
  Field,
  Input,
  useDialog,
  type CustomDialogProps,
} from "@dofortech/pretty-ui";

const receipt = "m-0 font-mono text-1 text-foreground-muted";

/**
 * A dialog that asks a question of its own. `useDialog()` works inside a dialog
 * the provider is already rendering, and the second dialog stacks ON the first
 * — the parent steps back and dims rather than being covered by a new backdrop.
 */
function RenameProject({
  payload,
  close,
  dismiss,
}: CustomDialogProps<{ name: string }, string>) {
  const dialog = useDialog();
  const [name, setName] = React.useState(payload.name);
  const dirty = name.trim() !== payload.name;

  async function cancel() {
    if (dirty && !(await dialog.confirm("Discard your changes?"))) {
      return;
    }
    // Nothing to report, so the dialog is dismissed rather than answered:
    // `dismiss()` resolves the promise with `undefined`, exactly as Escape does.
    dismiss();
  }

  return (
    <Dialog.Popup size="sm">
      <Dialog.Title>Rename project</Dialog.Title>
      <Field.Root name="name">
        <Field.Label>Project name</Field.Label>
        <Input value={name} onValueChange={(value) => setName(value)} />
      </Field.Root>
      <Dialog.Footer>
        <Button variant="soft" tone="neutral" onClick={() => void cancel()}>
          Cancel
        </Button>
        <Button disabled={!dirty} onClick={() => close(name.trim())}>
          Rename
        </Button>
      </Dialog.Footer>
    </Dialog.Popup>
  );
}

function Trigger() {
  const dialog = useDialog();
  const [name, setName] = React.useState("Orbit landing page");

  async function rename() {
    const renamed = await dialog.show(RenameProject, { name });
    if (renamed !== undefined) {
      setName(renamed);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Button variant="outline" onClick={() => void rename()}>
        Rename…
      </Button>
      <p className={receipt}>{name}</p>
    </div>
  );
}

export default function DialogUseDialogNested() {
  return (
    <Dialog.Provider>
      <Trigger />
    </Dialog.Provider>
  );
}
