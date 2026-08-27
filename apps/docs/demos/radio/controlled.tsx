"use client";

import * as React from "react";
import { Field, Radio, RadioGroup } from "@dofortech/pretty-ui";

const CADENCES = [
  { value: "realtime", label: "As it happens", note: "Roughly 40 emails a day." },
  { value: "daily", label: "Daily digest", note: "One email, every morning." },
  { value: "weekly", label: "Weekly digest", note: "One email, on Mondays." },
  { value: "off", label: "Never", note: "You will still see in-app alerts." },
];

export default function RadioControlled() {
  const [cadence, setCadence] = React.useState("daily");
  const note = CADENCES.find((c) => c.value === cadence)?.note;

  return (
    <div className="w-full max-w-sm">
      <Field.Root name="cadence">
        <Field.Label nativeLabel={false}>Email me</Field.Label>
        {/* `value` + `onValueChange` rather than `defaultValue`. The callback's
          * first argument is the new value; the second carries the event
          * details, which this demo does not need. */}
        <RadioGroup value={cadence} onValueChange={setCadence}>
          {CADENCES.map((option) => (
            <Field.Item key={option.value}>
              <Field.Label>
                <Radio value={option.value} />
                {option.label}
              </Field.Label>
            </Field.Item>
          ))}
        </RadioGroup>
        <Field.Description>{note}</Field.Description>
      </Field.Root>
    </div>
  );
}
