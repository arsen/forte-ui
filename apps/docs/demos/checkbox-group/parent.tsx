"use client";

import * as React from "react";
import { Checkbox, CheckboxGroup, Field } from "@forte-ui/react";

const PERMISSIONS = [
  { value: "read", label: "Read code and issues" },
  { value: "write", label: "Push to branches" },
  { value: "admin", label: "Manage settings and members" },
];

const ALL_VALUES = PERMISSIONS.map((permission) => permission.value);

export default function CheckboxGroupParent() {
  const [value, setValue] = React.useState<string[]>(["read"]);

  return (
    // Field.Root is what makes the Field.Item rows below legal — an item reads
    // the root's context and throws without it. Here the root carries no label
    // of its own: the parent checkbox's text is the heading, so the group takes
    // aria-label instead. A name cannot be borrowed by two things at once
    // without one of them being announced twice.
    <Field.Root name="permissions">
      <CheckboxGroup
        aria-label="Repository access"
        value={value}
        onValueChange={setValue}
        allValues={ALL_VALUES}
      >
        <Field.Item>
          <Field.Label>
            <Checkbox parent />
            Repository access
          </Field.Label>
        </Field.Item>

        <div className="ms-6 flex flex-col gap-2">
          {PERMISSIONS.map((permission) => (
            <Field.Item key={permission.value}>
              <Field.Label>
                <Checkbox value={permission.value} />
                {permission.label}
              </Field.Label>
            </Field.Item>
          ))}
        </div>
      </CheckboxGroup>
    </Field.Root>
  );
}
