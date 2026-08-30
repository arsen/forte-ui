"use client";

import * as React from "react";
import { Combobox } from "@dofortech/forte-ui";

const languages = [
  "C#",
  "C++",
  "Elixir",
  "Go",
  "Haskell",
  "Java",
  "JavaScript",
  "Kotlin",
  "Python",
  "Ruby",
  "Rust",
  "Swift",
  "TypeScript",
  "Zig",
];

export default function ComboboxMultiple() {
  const id = React.useId();

  return (
    <Combobox.Root items={languages} multiple defaultValue={["TypeScript"]}>
      <div className="w-[22rem] max-w-full">
        <label htmlFor={id} className="mb-1 block text-2 font-medium">
          Programming languages
        </label>
        <Combobox.InputGroup fullWidth>
          <Combobox.Chips>
            <Combobox.Value>
              {(value: string[]) => (
                <React.Fragment>
                  {value.map((language) => (
                    <Combobox.Chip key={language} aria-label={language}>
                      {language}
                      <Combobox.ChipRemove
                        aria-label={`Remove ${language}`}
                      />
                    </Combobox.Chip>
                  ))}
                  {/* The input renders LAST inside the chips container so it
                      wraps onto the same line as the final chip. Backspace in
                      the empty input removes that chip. */}
                  <Combobox.Input
                    id={id}
                    placeholder={value.length > 0 ? "" : "e.g. TypeScript"}
                  />
                </React.Fragment>
              )}
            </Combobox.Value>
          </Combobox.Chips>
        </Combobox.InputGroup>
      </div>
      <Combobox.Popup>
        <Combobox.Empty>No languages found.</Combobox.Empty>
        <Combobox.List>
          {(language: string) => (
            <Combobox.Item key={language} value={language}>
              {language}
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Root>
  );
}
