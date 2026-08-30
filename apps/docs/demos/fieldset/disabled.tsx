"use client";

import { Checkbox, Field, Fieldset, Input, Switch } from "@dofortech/forte-ui";

export default function FieldsetDisabled() {
  return (
    <div className="w-full max-w-md">
      {/* `disabled` on a <fieldset> is native, so it reaches every control
        * inside — including ones this library knows nothing about. */}
      <Fieldset.Root disabled>
        <Fieldset.Legend>Custom domain</Fieldset.Legend>
        <Field.Root name="domain">
          <Field.Label>Domain</Field.Label>
          <Input defaultValue="acme.example" />
          <Field.Description>Available on the Team plan.</Field.Description>
        </Field.Root>
        <Field.Root name="redirect">
          <Field.Label>
            <Checkbox defaultChecked />
            Redirect the default subdomain
          </Field.Label>
        </Field.Root>
        <Field.Root name="https">
          <Field.Label>
            <Switch defaultChecked />
            Force HTTPS
          </Field.Label>
        </Field.Root>
      </Fieldset.Root>
    </div>
  );
}
