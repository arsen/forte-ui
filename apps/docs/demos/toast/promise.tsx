"use client";

import * as React from "react";
import { Button, Toast, useToast } from "@dofortech/pretty-ui";

/** Stands in for a network call: resolves or rejects after a moment. */
function publish(shouldFail: boolean) {
  return new Promise<{ url: string }>((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("the build step timed out"));
      } else {
        resolve({ url: "acme.dev/blog/four-two" });
      }
    }, 1800);
  });
}

function Buttons() {
  const toast = useToast();

  function run(shouldFail: boolean) {
    // The returned promise is the original one, rejection intact — so the
    // toast is a side effect and not a replacement for handling the error.
    toast
      .promise(publish(shouldFail), {
        loading: "Publishing post…",
        success: (result) => ({ title: "Post published", description: result.url }),
        error: (error) => ({
          title: "Publish failed",
          description: error instanceof Error ? error.message : "Unknown error",
        }),
      })
      .catch(() => {
        /* already reported above; swallowed so the demo does not log */
      });
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button variant="outline" onClick={() => run(false)}>
        Publish
      </Button>
      <Button variant="outline" tone="danger" onClick={() => run(true)}>
        Publish (fails)
      </Button>
    </div>
  );
}

export default function ToastPromise() {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null);

  return (
    <div ref={setStage} className="relative min-h-[14rem] w-full">
      <Toast.Provider container={stage}>
        <Buttons />
      </Toast.Provider>
    </div>
  );
}
