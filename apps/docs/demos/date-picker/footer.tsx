"use client";

import { Button, DatePicker, Popover } from "@dofortech/forte-ui";

export default function DatePickerFooterDemo() {
  return (
    /* `multiple` never closes on a pick — you are still choosing — so the
     * popup needs a way out that is not the Escape key. `Popover.Close` works
     * inside the popup because the surface IS a popover. */
    <DatePicker.Root mode="multiple">
      <DatePicker.Trigger aria-label="Blackout dates" className="w-64">
        <DatePicker.Value placeholder="No dates blocked" />
        <DatePicker.Icon />
      </DatePicker.Trigger>
      <DatePicker.Popup>
        <DatePicker.Calendar />
        <DatePicker.Footer>
          <DatePicker.Clear />
          <Popover.Close render={<Button size="sm" variant="soft" />}>Done</Popover.Close>
        </DatePicker.Footer>
      </DatePicker.Popup>
    </DatePicker.Root>
  );
}
