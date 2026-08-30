"use client";

import { Field, Textarea } from "@forte-ui/react";

export default function TextareaBasic() {
  return (
    <div className="w-full max-w-[28rem]">
      <Field.Root name="notes">
        <Field.Label>Release notes</Field.Label>
        <Textarea placeholder="What changed in this release?" />
        <Field.Description>
          Markdown is supported. Drag the bottom edge for more room.
        </Field.Description>
      </Field.Root>
    </div>
  );
}
