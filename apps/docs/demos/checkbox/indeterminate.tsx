"use client";

import * as React from "react";
import { Checkbox, Field } from "@dofortech/pretty-ui";

const FILES = [
  { value: "report", label: "quarterly-report.pdf" },
  { value: "budget", label: "budget-2026.xlsx" },
  { value: "notes", label: "handover-notes.md" },
];

const ALL_VALUES = FILES.map((file) => file.value);

export default function CheckboxIndeterminate() {
  const [selected, setSelected] = React.useState<string[]>(["report"]);

  const all = selected.length === FILES.length;
  const some = selected.length > 0 && !all;

  return (
    <Field.Root name="files">
      <Field.Item>
        <Field.Label>
          {/* `checked` and `indeterminate` are independent props, and the mixed
            * state is derived rather than stored: with one of three files
            * ticked the box is unchecked AND indeterminate, so the dash draws
            * and aria-checked reads "mixed". Activating it then reports
            * checked: true, because a mixed box is not a checked one. */}
          <Checkbox
            checked={all}
            indeterminate={some}
            onCheckedChange={(checked) =>
              setSelected(checked ? ALL_VALUES : [])
            }
          />
          Select all files
        </Field.Label>
      </Field.Item>

      <div className="ms-6 flex flex-col gap-2">
        {FILES.map((file) => (
          <Field.Item key={file.value}>
            <Field.Label>
              <Checkbox
                checked={selected.includes(file.value)}
                onCheckedChange={(checked) =>
                  setSelected((prev) =>
                    checked
                      ? [...prev, file.value]
                      : prev.filter((value) => value !== file.value),
                  )
                }
              />
              {file.label}
            </Field.Label>
          </Field.Item>
        ))}
      </div>
    </Field.Root>
  );
}
