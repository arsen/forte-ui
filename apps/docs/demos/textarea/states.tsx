"use client";

import { Field, Textarea } from "@dofortech/pretty-ui";

export default function TextareaStates() {
  return (
    <div className="flex w-full max-w-[28rem] flex-col gap-4">
      <Field.Root>
        <Field.Label>Placeholder</Field.Label>
        <Textarea rows={2} placeholder="Nothing typed yet" />
      </Field.Root>

      <Field.Root disabled>
        <Field.Label>Disabled</Field.Label>
        {/* The handle goes with the state: a control that cannot be edited
          * must not offer a drag that does nothing. */}
        <Textarea rows={2} defaultValue="Cannot be edited" />
      </Field.Root>

      {/* Read-only keeps full contrast, the text cursor AND the handle:
        * selecting, copying and reading a long value is the point of the
        * state, and a taller box makes all three easier. */}
      <Field.Root>
        <Field.Label>Read-only</Field.Label>
        <Textarea
          readOnly
          rows={2}
          defaultValue={"MIT License\n\nCopyright (c) 2026 Acme Inc."}
        />
      </Field.Root>
    </div>
  );
}
