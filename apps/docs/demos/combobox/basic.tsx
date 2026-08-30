"use client";

import * as React from "react";
import { Combobox } from "@forte-ui/react";

const fruits = [
  "Apple",
  "Banana",
  "Blackberry",
  "Blueberry",
  "Cherry",
  "Grape",
  "Kiwi",
  "Mango",
  "Orange",
  "Papaya",
  "Peach",
  "Pear",
  "Pineapple",
  "Pomegranate",
  "Raspberry",
  "Strawberry",
  "Watermelon",
];

export default function ComboboxBasic() {
  const id = React.useId();

  return (
    <Combobox.Root items={fruits}>
      <div>
        {/* A native label, because the INPUT is the form control here.
            Combobox.Label targets the trigger and belongs to the
            input-inside-popup pattern. */}
        <label htmlFor={id} className="mb-1 block text-2 font-medium">
          Fruit
        </label>
        <Combobox.InputGroup>
          <Combobox.Input id={id} placeholder="e.g. Apple" />
          <Combobox.Clear aria-label="Clear selection" />
          <Combobox.Trigger aria-label="Open popup" />
        </Combobox.InputGroup>
      </div>
      <Combobox.Popup>
        <Combobox.Empty>No fruits found.</Combobox.Empty>
        <Combobox.List>
          {(fruit: string) => (
            <Combobox.Item key={fruit} value={fruit}>
              {fruit}
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Root>
  );
}
