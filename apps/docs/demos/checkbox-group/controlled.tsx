"use client";

import * as React from "react";
import { Button, Checkbox, CheckboxGroup, Field } from "@forte-ui/react";

const TOPICS = [
  { value: "releases", label: "Product releases" },
  { value: "incidents", label: "Incident reports" },
  { value: "billing", label: "Billing and invoices" },
  { value: "research", label: "Research invitations" },
];

const ALL_VALUES = TOPICS.map((topic) => topic.value);

export default function CheckboxGroupControlled() {
  const [value, setValue] = React.useState<string[]>(["incidents", "billing"]);

  return (
    <div className="w-full max-w-sm">
      <Field.Root name="topics">
        <Field.Label nativeLabel={false}>Email me about</Field.Label>
        {/* `value` + `onValueChange` rather than `defaultValue`. The callback's
          * first argument is the new array; the second carries the event
          * details, which this demo does not need. Holding the array yourself
          * is what lets something outside the group write to it — the two
          * buttons below set it directly. */}
        <CheckboxGroup value={value} onValueChange={setValue}>
          {TOPICS.map((topic) => (
            <Field.Item key={topic.value}>
              <Field.Label>
                <Checkbox value={topic.value} />
                {topic.label}
              </Field.Label>
            </Field.Item>
          ))}
        </CheckboxGroup>
        <Field.Description>
          {value.length === 0
            ? "You will not receive any email."
            : `${value.length} of ${TOPICS.length} selected.`}
        </Field.Description>
      </Field.Root>

      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setValue(ALL_VALUES)}>
          Select all
        </Button>
        <Button size="sm" variant="outline" onClick={() => setValue([])}>
          Clear
        </Button>
      </div>
    </div>
  );
}
