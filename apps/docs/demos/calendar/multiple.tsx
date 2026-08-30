"use client";

import * as React from "react";
import { Calendar } from "@forte-ui/react";

export default function CalendarMultiple() {
  const [days, setDays] = React.useState<Date[]>([]);

  return (
    <Calendar
      mode="multiple"
      selected={days}
      /* `onSelect` hands back `null` only when the last day is cleared, so the
       * state stays an array and nothing downstream has to null-check it. */
      onSelect={(next) => setDays(next ?? [])}
      footer={
        days.length === 0
          ? "No days chosen."
          : `${days.length} ${days.length === 1 ? "day" : "days"} chosen.`
      }
    />
  );
}
