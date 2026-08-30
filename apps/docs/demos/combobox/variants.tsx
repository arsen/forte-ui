"use client";

import * as React from "react";
import { Combobox } from "@dofortech/forte-ui";

const cities = [
  "Amsterdam",
  "Berlin",
  "Lisbon",
  "London",
  "Madrid",
  "Paris",
  "Prague",
  "Vienna",
  "Warsaw",
];

const variants = [
  { variant: "outline", label: "Outline" },
  { variant: "soft", label: "Soft" },
  { variant: "ghost", label: "Ghost" },
] as const;

export default function ComboboxVariants() {
  return (
    <>
      {variants.map(({ variant, label }) => (
        <ComboboxOfVariant key={variant} variant={variant} label={label} />
      ))}
    </>
  );
}

function ComboboxOfVariant({
  variant,
  label,
}: {
  variant: (typeof variants)[number]["variant"];
  label: string;
}) {
  const id = React.useId();

  return (
    <Combobox.Root items={cities}>
      <div>
        <label htmlFor={id} className="mb-1 block text-2 font-medium">
          {label}
        </label>
        <Combobox.InputGroup variant={variant}>
          <Combobox.Input id={id} placeholder="e.g. Lisbon" />
          <Combobox.Clear aria-label="Clear selection" />
          <Combobox.Trigger aria-label="Open popup" />
        </Combobox.InputGroup>
      </div>
      <Combobox.Popup>
        <Combobox.Empty>No cities found.</Combobox.Empty>
        <Combobox.List>
          {(city: string) => (
            <Combobox.Item key={city} value={city}>
              {city}
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Root>
  );
}
