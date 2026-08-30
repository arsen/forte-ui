"use client";

import * as React from "react";
import { Calendar } from "@forte-ui/react";

/* No initial date: `new Date()` in a state initialiser runs once on the
 * server and again in the browser, and a demo that hydrates with a different
 * "today" than it rendered with is a mismatch, not a feature. */
export default function CalendarBasic() {
  const [date, setDate] = React.useState<Date | null>(null);

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={setDate}
      footer={
        date
          ? date.toLocaleDateString("en-US", { dateStyle: "full" })
          : "Pick a day to see it here."
      }
    />
  );
}
