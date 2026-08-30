"use client";

import { Field, Switch } from "@dofortech/forte-ui";

export default function SwitchBasic() {
  return (
    // The switch goes inside the label — it renders no text of its own, and
    // Field wires the two together without an id in sight.
    <Field.Root name="email-notifications">
      <Field.Label>
        <Switch defaultChecked />
        Email notifications
      </Field.Label>
    </Field.Root>
  );
}
