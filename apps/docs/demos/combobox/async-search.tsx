"use client";

import * as React from "react";
import { Combobox, Spinner } from "@forte-ui/react";

interface Person {
  id: string;
  name: string;
  title: string;
}

const directory: Person[] = [
  { id: "leslie", name: "Leslie Alexander", title: "Product Manager" },
  { id: "kathryn", name: "Kathryn Murphy", title: "Marketing Lead" },
  { id: "courtney", name: "Courtney Henry", title: "Design Systems" },
  { id: "michael", name: "Michael Foster", title: "Engineering Manager" },
  { id: "lindsay", name: "Lindsay Walton", title: "Product Designer" },
  { id: "tom", name: "Tom Cook", title: "Frontend Engineer" },
  { id: "whitney", name: "Whitney Francis", title: "Customer Success" },
  { id: "jacob", name: "Jacob Jones", title: "Security Engineer" },
  { id: "arlene", name: "Arlene McCoy", title: "Data Analyst" },
  { id: "jerome", name: "Jerome Bell", title: "DevOps Engineer" },
];

async function searchPeople(
  query: string,
  match: (text: string, query: string) => boolean,
): Promise<Person[]> {
  // Stands in for a network request.
  await new Promise((resolve) => {
    setTimeout(resolve, Math.random() * 400 + 100);
  });
  return directory.filter(
    (person) => match(person.name, query) || match(person.title, query),
  );
}

export default function ComboboxAsyncSearch() {
  const id = React.useId();

  const [results, setResults] = React.useState<Person[]>([]);
  const [selected, setSelected] = React.useState<Person | null>(null);
  const [query, setQuery] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  const { contains } = Combobox.useFilter();
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const trimmed = query.trim();

  // The selected person stays in `items` even when the current search does
  // not return them, or the combobox would treat the value as gone.
  const items = React.useMemo(() => {
    if (!selected || results.some((person) => person.id === selected.id)) {
      return results;
    }
    return [...results, selected];
  }, [results, selected]);

  function getStatus() {
    if (isPending) {
      return (
        <React.Fragment>
          <Spinner size="sm" aria-hidden />
          Searching…
        </React.Fragment>
      );
    }
    if (trimmed === "") {
      return selected ? null : "Start typing to search people…";
    }
    if (results.length === 0) {
      return `No matches for "${trimmed}".`;
    }
    return null;
  }

  const status = getStatus();

  return (
    <Combobox.Root
      items={items}
      itemToStringLabel={(person: Person) => person.name}
      // The server already filtered; filtering again client-side would drop
      // results whose match was on a field the input text no longer contains.
      filter={null}
      onOpenChangeComplete={(open) => {
        if (!open && selected) {
          setResults([selected]);
        }
      }}
      onValueChange={(nextSelected) => {
        setSelected(nextSelected);
        setQuery("");
      }}
      onInputValueChange={(nextQuery, { reason }) => {
        setQuery(nextQuery);

        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        if (nextQuery === "") {
          setResults([]);
          return;
        }
        if (reason === "item-press") {
          return;
        }

        startTransition(async () => {
          const people = await searchPeople(nextQuery, contains);
          if (controller.signal.aborted) {
            return;
          }
          startTransition(() => {
            setResults(people);
          });
        });
      }}
    >
      <div>
        <label htmlFor={id} className="mb-1 block text-2 font-medium">
          Assign reviewer
        </label>
        <Combobox.InputGroup>
          <Combobox.Input id={id} placeholder="e.g. Michael" />
          <Combobox.Clear aria-label="Clear selection" />
          <Combobox.Trigger aria-label="Open popup" />
        </Combobox.InputGroup>
      </div>
      <Combobox.Popup aria-busy={isPending || undefined}>
        <Combobox.Status>{status}</Combobox.Status>
        <Combobox.Empty />
        <Combobox.List>
          {(person: Person) => (
            <Combobox.Item key={person.id} value={person}>
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{person.name}</span>
                <span className="truncate text-1 text-foreground-muted">
                  {person.title}
                </span>
              </span>
            </Combobox.Item>
          )}
        </Combobox.List>
      </Combobox.Popup>
    </Combobox.Root>
  );
}
