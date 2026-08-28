"use client";

import * as React from "react";
import { Calendar } from "@dofortech/pretty-ui";

const AUGUST = new Date(2026, 7, 1);

export default function CalendarDisabledDates() {
  const [date, setDate] = React.useState<Date | null>(null);

  return (
    <Calendar
      mode="single"
      defaultMonth={AUGUST}
      minDate={AUGUST}
      maxDate={new Date(2026, 8, 30)}
      /* An array of matchers is a union: a day is blocked if ANY of them
       * claims it. Weekends, a shutdown week, and one public holiday. */
      disabled={[
        { dayOfWeek: [0, 6] },
        { from: new Date(2026, 7, 10), to: new Date(2026, 7, 14) },
        new Date(2026, 8, 7),
      ]}
      selected={date}
      onSelect={setDate}
      footer={
        date
          ? date.toLocaleDateString("en-US", { dateStyle: "full" })
          : "Weekdays in August and September, minus the shutdown week."
      }
    />
  );
}
