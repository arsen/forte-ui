"use client";

import * as React from "react";
import { Button, Toast } from "@forte-ui/react";

// Created at module scope, outside React. In an app this lives in its own
// file — `export const toaster = Toast.createManager()` — and anything that
// is not a component imports it: an API client, a store, a socket handler.
const toaster = Toast.createManager();

/** Stands in for a module that knows nothing about React. */
async function refreshSession() {
  const handle = toaster.loading("Refreshing session…");
  await new Promise((resolve) => {
    setTimeout(resolve, 1200);
  });
  handle.update("Session refreshed", { type: "success" });
}

export default function ToastManager() {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null);

  return (
    <div ref={setStage} className="relative min-h-[14rem] w-full">
      {/* `toastManager` is what connects the two. Pass the manager's `base`. */}
      <Toast.Provider container={stage} toastManager={toaster.base}>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" onClick={() => void refreshSession()}>
            Refresh session
          </Button>
          <Button variant="outline" onClick={() => toaster.error("Request failed: 503")}>
            Report an error
          </Button>
        </div>
      </Toast.Provider>
    </div>
  );
}
