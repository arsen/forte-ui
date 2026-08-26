"use client";

import { Field, Input } from "@dofortech/pretty-ui";

const TAKEN = ["acme", "admin", "root"];

export default function FieldCustomValidation() {
  return (
    <div style={{ inlineSize: "min(24rem, 100%)" }}>
      <Field.Root
        name="workspace"
        validationMode="onChange"
        // Debounce is what makes onChange bearable: the callback runs once the
        // typing pauses, not on every keystroke.
        validationDebounceTime={300}
        validate={(value) => {
          const slug = String(value ?? "").trim();
          if (slug.length === 0) {
            return null;
          }
          if (!/^[a-z0-9-]+$/.test(slug)) {
            return "Use lowercase letters, numbers and dashes only.";
          }
          if (TAKEN.includes(slug)) {
            return `“${slug}” is already taken.`;
          }
          return null;
        }}
      >
        <Field.Label>Workspace</Field.Label>
        <Input placeholder="acme" />
        <Field.Description>
          Try “acme” — it is one of the names this demo rejects.
        </Field.Description>
        {/* No `match`: this renders whatever message `validate` returned. */}
        <Field.Error />
      </Field.Root>
    </div>
  );
}
