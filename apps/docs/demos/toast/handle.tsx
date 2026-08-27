"use client";

import * as React from "react";
import { Button, Toast, useToast, type ToastHandle } from "@dofortech/pretty-ui";

function Upload() {
  const toast = useToast();
  // The handle is what connects the three buttons: whichever one is pressed
  // next acts on the toast the first one raised.
  const upload = React.useRef<ToastHandle | null>(null);
  const [running, setRunning] = React.useState(false);

  function start() {
    upload.current = toast.loading("Uploading avatar.png", {
      description: "This one never dismisses itself.",
      dismissible: false,
    });
    setRunning(true);
  }

  function finish() {
    // Same card, rewritten in place — no second toast appears, and the
    // success one now auto-dismisses on the provider's timeout. Every field
    // in an update REPLACES the old one, so `dismissible` has to be restated
    // to give the finished toast its close button back.
    upload.current?.update("Uploaded avatar.png", {
      type: "success",
      description: undefined,
      dismissible: true,
    });
    setRunning(false);
  }

  function cancel() {
    upload.current?.close();
    setRunning(false);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button variant="outline" disabled={running} onClick={start}>
        Start upload
      </Button>
      <Button variant="outline" disabled={!running} onClick={finish}>
        Finish it
      </Button>
      <Button variant="outline" tone="danger" disabled={!running} onClick={cancel}>
        Cancel it
      </Button>
    </div>
  );
}

export default function ToastHandleDemo() {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null);

  return (
    <div ref={setStage} className="relative min-h-[14rem] w-full">
      <Toast.Provider container={stage}>
        <Upload />
      </Toast.Provider>
    </div>
  );
}
