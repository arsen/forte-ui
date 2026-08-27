"use client";

import { Field, Input } from "@dofortech/pretty-ui";

export default function InputMultiline() {
  return (
    <div className="w-full max-w-[26rem]">
      <Field.Root name="notes">
        <Field.Label>Release notes</Field.Label>
        {/* Swapping the element out is all it takes — the styles follow the
          * tag, and the fixed control height is replaced by a minimum. */}
        <Input render={<textarea rows={4} />} placeholder="What changed?" />
        <Field.Description>Markdown is supported.</Field.Description>
      </Field.Root>
    </div>
  );
}
