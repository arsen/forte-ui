"use client";

import { Field, Switch } from "@dofortech/pretty-ui";

const SETTINGS = [
  {
    id: "product-updates",
    name: "Product updates",
    description: "New features and changes, at most once a month.",
    defaultChecked: true,
  },
  {
    id: "security-alerts",
    name: "Security alerts",
    description: "Sign-ins from new devices, and password changes.",
    defaultChecked: true,
  },
  {
    id: "weekly-digest",
    name: "Weekly digest",
    description: "A Monday summary of your team's activity.",
    defaultChecked: false,
  },
];

const panel =
  "w-full max-w-[30rem] rounded-surface border border-border-muted bg-panel";

// Field.Root is a column by default. This row layout is the one thing the
// component cannot guess, so the demo sets it — everything else (the id, the
// aria-describedby, the label and description styling) comes from Field.
const row = "flex-row items-center justify-between gap-5 p-4";

export default function SwitchSettingsList() {
  return (
    <div className={panel}>
      {SETTINGS.map((setting, index) => (
        <Field.Root
          key={setting.id}
          name={setting.id}
          className={index === 0 ? row : `${row} border-t border-border-muted`}
        >
          {/* The label sits beside the switch rather than around it, which is
            * the whole reason this needs no `nativeButton`: Field points the
            * label's htmlFor at the switch's hidden input, and that input is a
            * labelable element. */}
          <div>
            <Field.Label>{setting.name}</Field.Label>
            <Field.Description>{setting.description}</Field.Description>
          </div>
          <Switch defaultChecked={setting.defaultChecked} />
        </Field.Root>
      ))}
    </div>
  );
}
