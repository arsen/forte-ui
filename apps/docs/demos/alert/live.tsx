"use client";

import * as React from "react";
import { Alert, Button } from "@dofortech/forte-ui";

export default function AlertLive() {
  const [result, setResult] = React.useState<"none" | "saved" | "failed">("none");

  return (
    <div className="grid w-full gap-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setResult("saved")}>
          Save
        </Button>
        <Button size="sm" variant="outline" tone="danger" onClick={() => setResult("failed")}>
          Save and fail
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setResult("none")}>
          Clear
        </Button>
      </div>

      {/* `polite` waits for a pause in whatever the screen reader is already
        * reading. It is the right level for a confirmation: the user asked
        * for this and is not in a hurry to hear it. */}
      {result === "saved" ? (
        <Alert.Root tone="success" live="polite">
          <Alert.Icon />
          <Alert.Title>Changes saved</Alert.Title>
        </Alert.Root>
      ) : null}

      {/* `assertive` interrupts. Keep it for failures the user has to act on
        * — here, work that did not make it to the server. */}
      {result === "failed" ? (
        <Alert.Root tone="danger" live="assertive">
          <Alert.Icon />
          <Alert.Title>Changes were not saved</Alert.Title>
          <Alert.Description>The connection dropped. Your edits are still here.</Alert.Description>
        </Alert.Root>
      ) : null}
    </div>
  );
}
