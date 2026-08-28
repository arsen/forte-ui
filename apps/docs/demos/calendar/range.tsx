"use client";

import * as React from "react";
import { Calendar, type CalendarRange } from "@dofortech/pretty-ui";

/* Whole days apart, counted through the calendar rather than the clock:
 * subtracting timestamps is an hour out across a DST boundary, which turns a
 * seven-night stay into 6.96 and then, after rounding, into six. */
function nights(range: CalendarRange) {
  if (!range.to) {
    return 0;
  }
  const from = Date.UTC(range.from.getFullYear(), range.from.getMonth(), range.from.getDate());
  const to = Date.UTC(range.to.getFullYear(), range.to.getMonth(), range.to.getDate());
  return (to - from) / 86400000;
}

export default function CalendarRangeDemo() {
  const [range, setRange] = React.useState<CalendarRange | null>(null);

  return (
    <Calendar
      mode="range"
      numberOfMonths={2}
      selected={range}
      onSelect={setRange}
      footer={
        range?.to
          ? `${nights(range)} nights — ${range.from.toLocaleDateString("en-US", { dateStyle: "medium" })} to ${range.to.toLocaleDateString("en-US", { dateStyle: "medium" })}`
          : range?.from
            ? "Now pick the day you leave."
            : "Pick the day you arrive."
      }
    />
  );
}
