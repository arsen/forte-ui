"use client";

import * as React from "react";
import { Button, Field, OTPField } from "@forte-ui/react";

export default function OTPFieldControlled() {
  const [code, setCode] = React.useState("");
  const [log, setLog] = React.useState<string[]>([]);

  const note = (line: string) => setLog((lines) => [...lines.slice(-2), line]);

  return (
    <div className="flex w-full max-w-[24rem] flex-col gap-4">
      <Field.Root name="code">
        <Field.Label>Verification code</Field.Label>
        <OTPField.Root
          length={6}
          value={code}
          onValueChange={setCode}
          // Fires once the last slot fills, and again on a paste that
          // re-completes an already complete value — which onValueChange does
          // not, because the value did not change.
          onValueComplete={(value) => note(`complete: ${value}`)}
          // The characters that were dropped on the way in: a letter typed
          // into a numeric field, or the dashes in a pasted "482-913".
          onValueInvalid={(value) => note(`rejected: ${value}`)}
        />
      </Field.Root>

      <p className="my-0 font-mono text-1 text-foreground-muted">
        {code === "" ? "(empty)" : code} · {code.length}/6
      </p>

      {log.length > 0 ? (
        <ul className="my-0 list-none ps-0 font-mono text-1 text-foreground-subtle">
          {log.map((line, index) => (
            <li key={`${line}-${index}`}>{line}</li>
          ))}
        </ul>
      ) : null}

      <Button variant="soft" size="sm" onClick={() => setCode("")} className="self-start">
        Clear
      </Button>
    </div>
  );
}
