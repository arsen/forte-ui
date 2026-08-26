"use client";

import { Field, Input } from "@dofortech/pretty-ui";

export default function InputMultiline() {
  return (
    <div style={{ inlineSize: "min(26rem, 100%)" }}>
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
