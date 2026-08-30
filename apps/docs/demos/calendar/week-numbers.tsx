"use client";

import { Calendar } from "@forte-ui/react";

export default function CalendarWeekNumbers() {
  return (
    <Calendar
      /* ISO 8601 all the way through: weeks run Monday to Sunday, so the
       * numbers in the gutter only line up with the rows when the grid starts
       * on Monday too. */
      weekStartsOn={1}
      showWeekNumbers
      /* Six rows every month, so a calendar in a popover keeps one height
       * instead of growing and shrinking as you page through the year. */
      fixedWeeks
      defaultMonth={new Date(2026, 1, 1)}
    />
  );
}
