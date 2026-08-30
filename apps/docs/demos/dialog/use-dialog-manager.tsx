"use client";

import * as React from "react";
import { Button, Dialog } from "@forte-ui/react";

// Created at module scope, outside React. In an app this lives in its own file
// — `export const dialogs = Dialog.createManager()` — and anything that is not
// a component imports it: a fetch wrapper, a router guard, a store.
const dialogs = Dialog.createManager();

/** Stands in for a module that knows nothing about React. */
async function publish(): Promise<string> {
  const confirmed = await dialogs.confirmWithInput({
    title: "Publish to production?",
    description:
      "Everyone on the internet sees this build the moment it finishes.",
    confirmValue: "publish",
    confirmLabel: "Publish",
    tone: "primary",
  });

  if (!confirmed) {
    return "cancelled";
  }

  await dialogs.alert({
    title: "Publishing",
    description: "You will get an email when the build finishes.",
  });
  return "published";
}

const receipt = "m-0 font-mono text-1 text-foreground-muted";

export default function DialogUseDialogManager() {
  const [state, setState] = React.useState("idle");

  // `manager` is what connects the two: the provider renders this manager's
  // stack instead of one of its own.
  return (
    <Dialog.Provider manager={dialogs}>
      <div className="flex flex-col items-center gap-4">
        <Button
          variant="outline"
          onClick={() => {
            void publish().then(setState);
          }}
        >
          Publish
        </Button>
        <p className={receipt}>{state}</p>
      </div>
    </Dialog.Provider>
  );
}
