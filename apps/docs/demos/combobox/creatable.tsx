"use client";

import * as React from "react";
import { Button, Combobox, Dialog, Field, Input } from "@dofortech/pretty-ui";

interface LabelItem {
  /** Set on the synthetic "Create …" row only; holds the pending name. */
  creatable?: string;
  id: string;
  value: string;
}

const initialLabels: LabelItem[] = [
  { id: "bug", value: "bug" },
  { id: "docs", value: "documentation" },
  { id: "enhancement", value: "enhancement" },
  { id: "help-wanted", value: "help wanted" },
  { id: "good-first-issue", value: "good first issue" },
];

export default function ComboboxCreatable() {
  const id = React.useId();

  const [labels, setLabels] = React.useState<LabelItem[]>(initialLabels);
  const [selected, setSelected] = React.useState<LabelItem[]>([]);
  const [query, setQuery] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const createInputRef = React.useRef<HTMLInputElement | null>(null);
  const pendingQueryRef = React.useRef("");
  const highlightedRef = React.useRef<LabelItem | undefined>(undefined);

  const trimmed = query.trim();
  const lowered = trimmed.toLocaleLowerCase();
  const exactExists = labels.some(
    (label) => label.value.trim().toLocaleLowerCase() === lowered,
  );

  // While the query matches nothing exactly, a synthetic "Create …" row rides
  // along at the end of the list.
  const items: LabelItem[] =
    trimmed !== "" && !exactExists
      ? [
          ...labels,
          { creatable: trimmed, id: `create:${lowered}`, value: `Create "${trimmed}"` },
        ]
      : labels;

  // Enter with no highlighted item: select the exact match if one exists,
  // otherwise offer to create the query.
  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter" || highlightedRef.current || trimmed === "") {
      return;
    }
    const existing = labels.find(
      (label) => label.value.trim().toLocaleLowerCase() === lowered,
    );
    if (existing) {
      setSelected((prev) =>
        prev.some((item) => item.id === existing.id) ? prev : [...prev, existing],
      );
      setQuery("");
      return;
    }
    pendingQueryRef.current = trimmed;
    setDialogOpen(true);
  }

  function handleCreateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = createInputRef.current?.value.trim() ?? "";
    if (!value) {
      return;
    }
    const normalized = value.toLocaleLowerCase();
    const existing = labels.find(
      (label) => label.value.trim().toLocaleLowerCase() === normalized,
    );
    if (existing) {
      setSelected((prev) =>
        prev.some((item) => item.id === existing.id) ? prev : [...prev, existing],
      );
    } else {
      const newItem: LabelItem = {
        id: normalized.replace(/\s+/g, "-"),
        value,
      };
      setLabels((prev) => [...prev, newItem]);
      setSelected((prev) => [...prev, newItem]);
    }
    setDialogOpen(false);
    setQuery("");
  }

  return (
    <React.Fragment>
      <Combobox.Root
        items={items}
        multiple
        value={selected}
        inputValue={query}
        onInputValueChange={setQuery}
        onItemHighlighted={(item) => {
          highlightedRef.current = item;
        }}
        onValueChange={(next) => {
          // Choosing the synthetic row must not "select" it — it opens the
          // creation dialog instead, and the real item is selected on submit.
          const creatable = next.find(
            (item) =>
              item.creatable &&
              !selected.some((current) => current.id === item.id),
          );
          if (creatable?.creatable) {
            pendingQueryRef.current = creatable.creatable;
            setDialogOpen(true);
            return;
          }
          setSelected(next.filter((item) => !item.creatable));
          setQuery("");
        }}
      >
        <div className="w-[22rem] max-w-full">
          <label htmlFor={id} className="mb-1 block text-2 font-medium">
            Labels
          </label>
          <Combobox.InputGroup fullWidth>
            <Combobox.Chips>
              <Combobox.Value>
                {(value: LabelItem[]) => (
                  <React.Fragment>
                    {value.map((label) => (
                      <Combobox.Chip key={label.id} aria-label={label.value}>
                        {label.value}
                        <Combobox.ChipRemove
                          aria-label={`Remove ${label.value}`}
                        />
                      </Combobox.Chip>
                    ))}
                    <Combobox.Input
                      id={id}
                      placeholder={value.length > 0 ? "" : "e.g. bug"}
                      onKeyDown={handleInputKeyDown}
                    />
                  </React.Fragment>
                )}
              </Combobox.Value>
            </Combobox.Chips>
          </Combobox.InputGroup>
        </div>
        <Combobox.Popup>
          <Combobox.Empty>No labels found.</Combobox.Empty>
          <Combobox.List>
            {(item: LabelItem) => (
              <Combobox.Item key={item.id} value={item}>
                {item.creatable ? `Create "${item.creatable}"` : item.value}
              </Combobox.Item>
            )}
          </Combobox.List>
        </Combobox.Popup>
      </Combobox.Root>

      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Popup size="sm" initialFocus={createInputRef}>
          <Dialog.Title>Create new label</Dialog.Title>
          <Dialog.Description>Add a new label to select.</Dialog.Description>
          <form onSubmit={handleCreateSubmit}>
            <Field.Root name="label">
              <Field.Label>Label name</Field.Label>
              <Input
                ref={createInputRef}
                defaultValue={pendingQueryRef.current}
                placeholder="Label name"
                required
              />
            </Field.Root>
            <Dialog.Footer>
              <Dialog.Close render={<Button variant="soft" tone="neutral" />}>
                Cancel
              </Dialog.Close>
              <Button type="submit">Create</Button>
            </Dialog.Footer>
          </form>
        </Dialog.Popup>
      </Dialog.Root>
    </React.Fragment>
  );
}
