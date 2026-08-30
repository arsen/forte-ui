"use client";

import { DatePicker, type DatePickerSize, type DatePickerVariant } from "@dofortech/forte-ui";

const SIZES: DatePickerSize[] = ["sm", "md", "lg"];
const VARIANTS: DatePickerVariant[] = ["outline", "soft", "ghost"];

export default function DatePickerSizes() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {SIZES.map((size) => (
          <DatePicker.Root key={size} defaultSelected={new Date(2026, 7, 27)}>
            <DatePicker.Trigger size={size} aria-label={`Date, size ${size}`}>
              <DatePicker.Value />
              <DatePicker.Icon />
            </DatePicker.Trigger>
            <DatePicker.Popup>
              <DatePicker.Calendar />
            </DatePicker.Popup>
          </DatePicker.Root>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {VARIANTS.map((variant) => (
          <DatePicker.Root key={variant} defaultSelected={new Date(2026, 7, 27)}>
            <DatePicker.Trigger variant={variant} aria-label={`Date, ${variant}`}>
              <DatePicker.Value />
              <DatePicker.Icon />
            </DatePicker.Trigger>
            <DatePicker.Popup>
              <DatePicker.Calendar />
            </DatePicker.Popup>
          </DatePicker.Root>
        ))}
      </div>
    </div>
  );
}
