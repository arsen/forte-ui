"use client";

import { Combobox } from "@dofortech/pretty-ui";

interface Country {
  value: string;
  label: string;
}

const countries: Country[] = [
  { value: "ar", label: "Argentina" },
  { value: "au", label: "Australia" },
  { value: "br", label: "Brazil" },
  { value: "ca", label: "Canada" },
  { value: "cl", label: "Chile" },
  { value: "de", label: "Germany" },
  { value: "eg", label: "Egypt" },
  { value: "es", label: "Spain" },
  { value: "fr", label: "France" },
  { value: "gb", label: "United Kingdom" },
  { value: "in", label: "India" },
  { value: "it", label: "Italy" },
  { value: "jp", label: "Japan" },
  { value: "ke", label: "Kenya" },
  { value: "kr", label: "South Korea" },
  { value: "mx", label: "Mexico" },
  { value: "ng", label: "Nigeria" },
  { value: "nl", label: "Netherlands" },
  { value: "nz", label: "New Zealand" },
  { value: "pl", label: "Poland" },
  { value: "pt", label: "Portugal" },
  { value: "se", label: "Sweden" },
  { value: "us", label: "United States" },
  { value: "vn", label: "Vietnam" },
];

export default function ComboboxInputInPopup() {
  return (
    <div className="w-[16rem]">
      <Combobox.Root items={countries}>
        {/* Here the TRIGGER is the form control, so Combobox.Label is the
            right labelling part — it focuses the trigger on click. */}
        <Combobox.Label>Country</Combobox.Label>
        <Combobox.Trigger fullWidth>
          <Combobox.Value placeholder="Select country" />
          <Combobox.Icon />
        </Combobox.Trigger>
        <Combobox.Popup aria-label="Select country">
          <Combobox.Input placeholder="e.g. Japan" />
          <Combobox.Empty>No countries found.</Combobox.Empty>
          <Combobox.List>
            {(country: Country) => (
              <Combobox.Item key={country.value} value={country}>
                {country.label}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>
    </div>
  );
}
