"use client";

import * as React from "react";
import { Combobox } from "@dofortech/forte-ui";

interface Produce {
  id: string;
  label: string;
}

interface ProduceGroup {
  value: string;
  items: Produce[];
}

const groupedProduce: ProduceGroup[] = [
  {
    value: "Fruits",
    items: [
      { id: "apple", label: "Apple" },
      { id: "banana", label: "Banana" },
      { id: "grape", label: "Grape" },
      { id: "kiwi", label: "Kiwi" },
      { id: "mango", label: "Mango" },
      { id: "orange", label: "Orange" },
      { id: "strawberry", label: "Strawberry" },
    ],
  },
  {
    value: "Vegetables",
    items: [
      { id: "broccoli", label: "Broccoli" },
      { id: "carrot", label: "Carrot" },
      { id: "cauliflower", label: "Cauliflower" },
      { id: "cucumber", label: "Cucumber" },
      { id: "kale", label: "Kale" },
      { id: "pepper", label: "Bell pepper" },
      { id: "spinach", label: "Spinach" },
    ],
  },
];

export default function ComboboxGrouped() {
  const id = React.useId();

  return (
    <Combobox.Root items={groupedProduce}>
      <div>
        <label htmlFor={id} className="mb-1 block text-2 font-medium">
          Produce
        </label>
        <Combobox.InputGroup>
          <Combobox.Input id={id} placeholder="e.g. Mango" />
          <Combobox.Clear aria-label="Clear selection" />
          <Combobox.Trigger aria-label="Open popup" />
        </Combobox.InputGroup>
      </div>
      <Combobox.Popup>
        <Combobox.Empty>No produce found.</Combobox.Empty>
        <Combobox.List>
          {(group: ProduceGroup) => (
            <Combobox.Group key={group.value} items={group.items}>
              <Combobox.GroupLabel>{group.value}</Combobox.GroupLabel>
              {/* Collection renders the group's FILTERED items, so a query
                  narrows each group instead of hiding the headings. */}
              <Combobox.Collection>
                {(item: Produce) => (
                  <Combobox.Item key={item.id} value={item}>
                    {item.label}
                  </Combobox.Item>
                )}
              </Combobox.Collection>
            </Combobox.Group>
          )}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Root>
  );
}
