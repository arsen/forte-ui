"use client";

import * as React from "react";
import { Field, Textarea } from "@dofortech/pretty-ui";

const LIMIT = 160;

export default function TextareaCharacterCount() {
  const [value, setValue] = React.useState(
    "Building accessible interfaces, mostly in CSS.",
  );
  const remaining = LIMIT - value.length;

  return (
    <div className="w-full max-w-[28rem]">
      <Field.Root name="bio">
        <Field.Label>Bio</Field.Label>
        <Textarea
          autoResize
          rows={2}
          maxRows={6}
          // `maxLength` is the control the browser enforces; the counter below
          // only reports it. Leaving the enforcement to the platform is what
          // keeps paste, undo and IME composition behaving correctly.
          maxLength={LIMIT}
          value={value}
          onValueChange={setValue}
        />
        {/* The count lives inside the field's description, so it is already in
          * the textarea's `aria-describedby` and is read out WITH the field.
          * Deliberately not an `aria-live` region: this updates on every
          * keystroke, and a screen reader announcing "142 left" after each one
          * buries the letters the user is actually typing. */}
        <Field.Description
          className={`flex justify-between gap-4 tabular-nums ${
            remaining <= 20 ? "text-warning-text" : ""
          }`}
        >
          <span>Shown on your public profile.</span>
          <span>{remaining} left</span>
        </Field.Description>
      </Field.Root>
    </div>
  );
}
