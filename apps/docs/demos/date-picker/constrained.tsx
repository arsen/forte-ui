"use client";

import * as React from "react";
import { DatePicker } from "@forte-ui/react";

const TODAY = new Date();
const HORIZON = new Date(TODAY.getFullYear(), TODAY.getMonth() + 3, 0);

export default function DatePickerConstrained() {
  const [date, setDate] = React.useState<Date | null>(null);

  return (
    <DatePicker.Root selected={date} onSelect={setDate}>
      <DatePicker.Trigger aria-label="Appointment" className="w-56">
        <DatePicker.Value placeholder="Next available" />
        <DatePicker.Icon />
      </DatePicker.Trigger>
      <DatePicker.Popup>
        {/* Every `Calendar` prop is forwarded, so bounds and matchers work
          * exactly as they do on a bare calendar. */}
        <DatePicker.Calendar
          minDate={TODAY}
          maxDate={HORIZON}
          disabled={{ dayOfWeek: [0, 6] }}
        />
      </DatePicker.Popup>
    </DatePicker.Root>
  );
}
