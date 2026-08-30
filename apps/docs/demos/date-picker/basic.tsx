"use client";

import * as React from "react";
import { DatePicker } from "@forte-ui/react";

export default function DatePickerBasic() {
  const [date, setDate] = React.useState<Date | null>(null);

  return (
    <DatePicker.Root selected={date} onSelect={setDate}>
      <DatePicker.Trigger aria-label="Due date" className="w-56">
        <DatePicker.Value placeholder="Pick a date" />
        <DatePicker.Icon />
      </DatePicker.Trigger>
      <DatePicker.Popup>
        <DatePicker.Calendar />
      </DatePicker.Popup>
    </DatePicker.Root>
  );
}
