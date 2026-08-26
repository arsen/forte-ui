"use client";

import { Field, Switch } from "@dofortech/pretty-ui";

export default function SwitchDisabled() {
  return (
    <div style={{ display: "grid", gap: "var(--pui-space-4)" }}>
      {/* `disabled` on the Field, not on the Switch: it takes precedence over
        * the control's own prop and dims the label with it, so the reason the
        * setting is unavailable does not sit at full contrast beside a
        * greyed-out control. */}
      <Field.Root disabled>
        <Field.Label>
          <Switch />
          Custom domain (available on the Team plan)
        </Field.Label>
      </Field.Root>
      <Field.Root disabled>
        <Field.Label>
          <Switch defaultChecked />
          Two-factor authentication (enforced by your workspace)
        </Field.Label>
      </Field.Root>
    </div>
  );
}
