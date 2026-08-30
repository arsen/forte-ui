"use client";

import * as React from "react";
import { Button, Toast, useToast } from "@forte-ui/react";

function Inbox() {
  const toast = useToast();
  const [archived, setArchived] = React.useState(0);

  function archive() {
    setArchived((n) => n + 1);

    const handle = toast.show("Conversation archived", {
      action: {
        label: "Undo",
        onClick: () => {
          setArchived((n) => Math.max(0, n - 1));
          // Clicking the action does not close the toast on its own — an
          // action that can fail has to be able to say so. Close it here once
          // the undo has actually happened.
          handle.close();
        },
      },
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button variant="outline" onClick={archive}>
        Archive conversation
      </Button>
      <p className="m-0 text-2 text-foreground-muted">Archived: {archived}</p>
    </div>
  );
}

export default function ToastAction() {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null);

  return (
    <div ref={setStage} className="relative min-h-[14rem] w-full">
      <Toast.Provider container={stage}>
        <Inbox />
      </Toast.Provider>
    </div>
  );
}
