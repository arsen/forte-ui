"use client";

import { Field, Radio, RadioGroup } from "@forte-ui/react";

const SPEEDS = [
  { value: "1", label: "1x" },
  { value: "1.5", label: "1.5x" },
  { value: "2", label: "2x" },
  { value: "3", label: "3x" },
];

export default function RadioOrientation() {
  return (
    <Field.Root name="playback-speed">
      <Field.Label nativeLabel={false}>Playback speed</Field.Label>
      {/* Layout only. All four arrow keys still move between the options, so
        * a horizontal group answers to Up and Down as well as Left and Right —
        * which is what a native radio group does too. */}
      <RadioGroup orientation="horizontal" defaultValue="1.5">
        {SPEEDS.map((speed) => (
          <Field.Item key={speed.value}>
            <Field.Label>
              <Radio value={speed.value} />
              {speed.label}
            </Field.Label>
          </Field.Item>
        ))}
      </RadioGroup>
    </Field.Root>
  );
}
