"use client";

import { Field, Textarea } from "@forte-ui/react";

export default function TextareaAutoResize() {
  return (
    <div className="flex w-full max-w-[28rem] flex-col gap-5">
      <Field.Root name="answer">
        <Field.Label>Answer</Field.Label>
        {/* Two rows at rest, eight at most, and it scrolls past that rather
          * than pushing the submit button off the screen. Both numbers are
          * ROWS, so they hold at every size and every density. */}
        <Textarea
          autoResize
          rows={2}
          maxRows={8}
          placeholder="Start typing — the box grows with you."
        />
        <Field.Description>
          Grows between 2 and 8 rows, then scrolls.
        </Field.Description>
      </Field.Root>

      <Field.Root name="answer-fixed">
        <Field.Label>The same field without it</Field.Label>
        <Textarea
          rows={2}
          placeholder="Start typing — this one scrolls instead."
        />
        <Field.Description>
          Fixed at 2 rows, with a handle to drag.
        </Field.Description>
      </Field.Root>
    </div>
  );
}
