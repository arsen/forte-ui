"use client";

import * as React from "react";
import { Calendar } from "@dofortech/forte-ui";

/* The bounds do three jobs at once: they stop the arrows at the ends, they
 * trim the year dropdown to exactly this span, and they disable every day
 * outside it. */
const EARLIEST = new Date(1920, 0, 1);
const LATEST = new Date();

export default function CalendarDropdown() {
  const [date, setDate] = React.useState<Date | null>(null);

  return (
    <Calendar
      mode="single"
      captionLayout="dropdown"
      defaultMonth={new Date(1995, 5, 1)}
      minDate={EARLIEST}
      maxDate={LATEST}
      selected={date}
      onSelect={setDate}
      footer={date ? date.toLocaleDateString("en-US", { dateStyle: "long" }) : "Date of birth"}
    />
  );
}
