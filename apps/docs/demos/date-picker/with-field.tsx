"use client";

import { DatePicker, Field } from "@forte-ui/react";

export default function DatePickerWithField() {
  return (
    <div className="w-full max-w-sm">
      <Field.Root name="starts">
        {/* nativeLabel={false} because the control is a <button>. A native
          * <label> would hand the trigger its :hover state and open the
          * calendar on every label click; with it off the pair is wired up
          * with aria-labelledby instead — which is also what satisfies the
          * trigger's accessible-name requirement without an aria-label. */}
        <Field.Label nativeLabel={false}>Starts on</Field.Label>
        <DatePicker.Root>
          <DatePicker.Trigger fullWidth>
            <DatePicker.Value placeholder="Pick a date" />
            <DatePicker.Icon />
          </DatePicker.Trigger>
          <DatePicker.Popup>
            <DatePicker.Calendar captionLayout="dropdown" />
          </DatePicker.Popup>
        </DatePicker.Root>
        <Field.Description>Invitations go out that morning.</Field.Description>
      </Field.Root>
    </div>
  );
}
