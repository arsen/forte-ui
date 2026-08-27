"use client";

import { Field, Radio, RadioGroup } from "@dofortech/pretty-ui";

const VISIBILITY = [
  {
    value: "private",
    label: "Private",
    description: "Only you and the people you invite can see this project.",
  },
  {
    value: "internal",
    label: "Internal",
    description: "Everyone in your organisation can see it. Nobody outside can.",
  },
  {
    value: "public",
    label: "Public",
    description: "Anyone on the internet can see it. Only you can push.",
  },
];

export default function RadioDescriptions() {
  return (
    <div className="w-full max-w-[26rem]">
      <Field.Root name="visibility">
        <Field.Label nativeLabel={false}>Visibility</Field.Label>
        {/* One Field.Item per option: it gives each row its own label AND its
          * own description, wired to that radio with aria-describedby, without
          * opening a second field. A plain <p> under the label would be read
          * out as part of the group instead, or not at all. */}
        <RadioGroup defaultValue="internal" className="gap-3">
          {VISIBILITY.map((option) => (
            <Field.Item key={option.value}>
              <Field.Label>
                <Radio value={option.value} />
                {option.label}
              </Field.Label>
              <Field.Description>{option.description}</Field.Description>
            </Field.Item>
          ))}
        </RadioGroup>
      </Field.Root>
    </div>
  );
}
