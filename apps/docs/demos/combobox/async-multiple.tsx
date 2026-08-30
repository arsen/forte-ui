"use client";

import * as React from "react";
import { Combobox, Spinner } from "@dofortech/forte-ui";

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

export default function ComboboxAsyncMultiple() {
  const id = React.useId();

  const [results, setResults] = React.useState<Person[]>([]);
  const [selected, setSelected] = React.useState<Person[]>([]);
  const [query, setQuery] = React.useState("");
  const [isPending, startTransition] = React.useTransition();

  const { contains } = Combobox.useFilter();
  const abortControllerRef = React.useRef<AbortController | null>(null);
  // The freshest selection, for callbacks that fire between renders.
  const selectedRef = React.useRef<Person[]>([]);

  const trimmed = query.trim();

  // Selected people stay in `items` even when the current search does not
  // return them, or the combobox would treat those values as gone.
  const items = React.useMemo(() => {
    const merged = [...results];
    selected.forEach((person) => {
      if (!results.some((result) => result.id === person.id)) {
        merged.push(person);
      }
    });
    return merged;
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
      return selected.length > 0 ? null : "Start typing to search people…";
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
      multiple
      // The server already filtered; see the single-select async demo.
      filter={null}
      onOpenChangeComplete={(open) => {
        if (!open) {
          setResults(selectedRef.current);
        }
      }}
      onValueChange={(nextSelected) => {
        selectedRef.current = nextSelected;
        setSelected(nextSelected);
        setQuery("");
        if (nextSelected.length === 0) {
          setResults([]);
        }
      }}
      onInputValueChange={(nextQuery, { reason }) => {
        setQuery(nextQuery);

        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        if (nextQuery === "") {
          setResults(selectedRef.current);
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
      <div className="w-[22rem] max-w-full">
        <label htmlFor={id} className="mb-1 block text-2 font-medium">
          Assign reviewers
        </label>
        <Combobox.InputGroup fullWidth>
          <Combobox.Chips>
            <Combobox.Value>
              {(value: Person[]) => (
                <React.Fragment>
                  {value.map((person) => (
                    <Combobox.Chip key={person.id} aria-label={person.name}>
                      {person.name}
                      <Combobox.ChipRemove
                        aria-label={`Remove ${person.name}`}
                      />
                    </Combobox.Chip>
                  ))}
                  <Combobox.Input
                    id={id}
                    placeholder={value.length > 0 ? "" : "e.g. Michael"}
                  />
                </React.Fragment>
              )}
            </Combobox.Value>
          </Combobox.Chips>
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
