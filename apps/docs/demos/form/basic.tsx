"use client";

import * as React from "react";
import {
  Button,
  Checkbox,
  Field,
  Form,
  Input,
  Select,
  Switch,
} from "@forte-ui/react";

const PLANS = { hobby: "Hobby", team: "Team", enterprise: "Enterprise" };

export default function FormBasic() {
  const [submitted, setSubmitted] = React.useState<Record<
    string,
    unknown
  > | null>(null);

  return (
    <div className="w-full max-w-[26rem]">
      <Form
        onFormSubmit={(values) => setSubmitted(values)}
        // Every control below reaches `values` under the name on its
        // Field.Root — no wiring, no onChange handlers, no state.
      >
        <Field.Root name="workspace">
          <Field.Label>Workspace name</Field.Label>
          <Input required placeholder="acme" />
          <Field.Error match="valueMissing">
            Give the workspace a name.
          </Field.Error>
        </Field.Root>

        <Field.Root name="plan">
          <Field.Label nativeLabel={false}>Plan</Field.Label>
          <Select.Root items={PLANS} defaultValue="hobby">
            <Select.Trigger fullWidth>
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Popup>
              {Object.entries(PLANS).map(([value, label]) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Root>
        </Field.Root>

        <Field.Root name="analytics">
          <Field.Label>
            <Switch defaultChecked />
            Share anonymous usage data
          </Field.Label>
        </Field.Root>

        <Field.Root name="terms">
          <Field.Label>
            <Checkbox required />I accept the terms of service
          </Field.Label>
          <Field.Error match="valueMissing">
            The terms have to be accepted.
          </Field.Error>
        </Field.Root>

        <Button type="submit" className="self-start">
          Create workspace
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
