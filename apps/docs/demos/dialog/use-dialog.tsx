"use client";

import * as React from "react";
import { Button, Dialog, useDialog } from "@dofortech/pretty-ui";

const receipt = "m-0 font-mono text-1 text-foreground-muted";

function Questions() {
  const dialog = useDialog();
  const [answer, setAnswer] = React.useState<string | null>(null);

  async function acknowledge() {
    await dialog.alert({
      title: "Invitation sent",
      description: "ada@example.com can accept it for the next seven days.",
    });
    setAnswer("alert() resolved");
  }

  async function discard() {
    // A bare message becomes the title, which is the dialog's accessible name.
    const confirmed = await dialog.confirm("Discard this draft?");
    setAnswer(`confirm() → ${confirmed}`);
  }

  async function deleteProject() {
    const confirmed = await dialog.confirmWithInput({
      title: "Delete “Orbit landing page”?",
      description:
        "The project, its 42 deployments and its build logs are removed immediately. This cannot be undone.",
      confirmValue: "orbit-landing",
      confirmLabel: "Delete project",
    });
    setAnswer(`confirmWithInput() → ${confirmed}`);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={() => void acknowledge()}>
          Alert
        </Button>
        <Button variant="outline" onClick={() => void discard()}>
          Confirm
        </Button>
        <Button variant="outline" tone="danger" onClick={() => void deleteProject()}>
          Type to confirm
        </Button>
      </div>
      {answer ? <p className={receipt}>{answer}</p> : null}
    </div>
  );
}

export default function DialogUseDialog() {
  // One provider, as high in the app as the dialogs need to reach. Here that
  // is the demo; in an app it is the root layout.
  return (
    <Dialog.Provider>
      <Questions />
    </Dialog.Provider>
  );
}
