"use client";

import { Checkbox, CheckboxGroup } from "@dofortech/pretty-ui";

const days = [
  { value: "mon", label: "Monday" },
  { value: "wed", label: "Wednesday" },
  { value: "fri", label: "Friday" },
];

export default function CheckboxGroupDemo() {
  return (
    <CheckboxGroup
      aria-labelledby="digest-days-label"
      defaultValue={["mon", "fri"]}
    >
      <span id="digest-days-label" style={{ fontWeight: 600 }}>
        Send the weekly digest on
      </span>
      {days.map((day) => (
        <label
          key={day.value}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "var(--pui-space-2)",
          }}
        >
          <Checkbox name="digest-day" value={day.value} />
          {day.label}
        </label>
      ))}
    </CheckboxGroup>
  );
}
