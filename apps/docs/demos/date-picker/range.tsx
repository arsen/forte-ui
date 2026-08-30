"use client";

import * as React from "react";
import { DatePicker, type CalendarRange } from "@dofortech/forte-ui";

export default function DatePickerRange() {
  const [range, setRange] = React.useState<CalendarRange | null>(null);

  return (
    /* No `closeOnSelect`: in range mode the default is to close once BOTH
     * ends are in, which is the only moment the answer is complete. */
    <DatePicker.Root mode="range" selected={range} onSelect={setRange}>
      <DatePicker.Trigger aria-label="Stay" className="w-72">
        <DatePicker.Value placeholder="Check in — check out" />
        <DatePicker.Icon />
      </DatePicker.Trigger>
      <DatePicker.Popup>
        <DatePicker.Calendar numberOfMonths={2} />
      </DatePicker.Popup>
    </DatePicker.Root>
  );
}
