"use client";

import * as React from "react";
import {
  Button,
  Checkbox,
  CheckboxGroup,
  Field,
  Fieldset,
  Form,
} from "@dofortech/pretty-ui";

const PROTOCOLS = [
  { value: "http", label: "HTTP" },
  { value: "https", label: "HTTPS" },
  { value: "ssh", label: "SSH" },
];

export default function CheckboxGroupForm() {
  const [submitted, setSubmitted] = React.useState<Record<
    string,
    unknown
  > | null>(null);

  return (
    <div className="w-full max-w-[26rem]">
      <Form onFormSubmit={(values) => setSubmitted(values)}>
        {/* Field.Root carries the `name` the array is submitted under. The
          * fieldset RENDERS AS the group rather than wrapping it, so one
          * element is both the <fieldset> Base UI names with its legend and
          * the group that owns the value — a wrapper would name the fieldset
          * and leave the group inside it anonymous. Both stylesheets then
          * apply, so the gap is restated: a fieldset spaces whole fields,
          * and these are checkbox rows. */}
        <Field.Root
          name="protocols"
          validate={(value) =>
            Array.isArray(value) && value.length > 0
              ? null
              : "Pick at least one protocol."
          }
        >
          <Fieldset.Root render={<CheckboxGroup className="gap-2" />}>
            <Fieldset.Legend>Allowed network protocols</Fieldset.Legend>

            {PROTOCOLS.map((protocol) => (
              <Field.Item key={protocol.value}>
                <Field.Label>
                  <Checkbox value={protocol.value} />
                  {protocol.label}
                </Field.Label>
              </Field.Item>
            ))}
          </Fieldset.Root>

          {/* No `match`: this renders whatever message `validate` returned.
            * A checkbox group has no `valueMissing` of its own — an empty
            * array is a perfectly valid value to the browser — so "at least
            * one" has to be stated. */}
          <Field.Error />
        </Field.Root>

        <Button type="submit" className="self-start">
          Save
        </Button>
      </Form>

      {submitted ? (
        <pre className="mt-5 overflow-x-auto rounded-surface bg-panel p-4 font-mono text-1">
          {JSON.stringify(submitted, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
