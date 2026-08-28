"use client";

import * as React from "react";
import { Combobox } from "@dofortech/pretty-ui";

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

const sizes = [
  { size: "sm", label: "Small" },
  { size: "md", label: "Medium" },
  { size: "lg", label: "Large" },
] as const;

export default function ComboboxSizes() {
  return (
    <>
      {sizes.map(({ size, label }) => (
        <ComboboxOfSize key={size} size={size} label={label} />
      ))}
    </>
  );
}

function ComboboxOfSize({
  size,
  label,
}: {
  size: (typeof sizes)[number]["size"];
  label: string;
}) {
  const id = React.useId();

  return (
    <Combobox.Root items={cities}>
      <div>
        <label htmlFor={id} className="mb-1 block text-2 font-medium">
          {label}
        </label>
        <Combobox.InputGroup size={size}>
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
