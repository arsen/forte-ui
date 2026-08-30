"use client";

import { Checkbox, Field } from "@forte-ui/react";

export default function CheckboxBasic() {
  return (
    // A checkbox has no text of its own, so it goes inside the label. Field
    // supplies the id wiring, and the label lays itself out as a row and takes
    // a pointer cursor because clicking it now toggles the control.
    <Field.Root name="build-alerts">
      <Field.Label>
        <Checkbox defaultChecked />
        Email me when a build fails
      </Field.Label>
    </Field.Root>
  );
}
