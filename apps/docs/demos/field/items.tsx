"use client";

import { Checkbox, CheckboxGroup, Field } from "@forte-ui/react";

const SCOPES = [
  {
    value: "read",
    label: "Read",
    description: "List and fetch every resource in the workspace.",
  },
  {
    value: "write",
    label: "Write",
    description: "Create and update resources, but never delete them.",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Manage members, billing and API keys.",
  },
];

export default function FieldItems() {
  return (
    <div className="w-full max-w-[26rem]">
      {/* One Field.Root names the group; one Field.Item per row gives each
        * member its own label and description without opening a second field. */}
      <Field.Root name="scopes">
        <Field.Label nativeLabel={false}>Token scopes</Field.Label>
        <CheckboxGroup defaultValue={["read"]} className="gap-3">
          {SCOPES.map((scope) => (
            <Field.Item key={scope.value}>
              <Field.Label>
                <Checkbox value={scope.value} />
                {scope.label}
              </Field.Label>
              <Field.Description>{scope.description}</Field.Description>
            </Field.Item>
          ))}
        </CheckboxGroup>
      </Field.Root>
    </div>
  );
}
