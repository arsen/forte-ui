"use client";

import * as React from "react";
import {
  Button,
  Dialog,
  Field,
  Form,
  Input,
  Select,
} from "@forte-ui/react";

const SCOPES = {
  read: "Read only",
  write: "Read and write",
  admin: "Full access",
};

const stack = "flex flex-col items-center gap-4";

const receipt = "m-0 font-mono text-1 text-foreground-muted";

export default function DialogForm() {
  // Controlled, because the FORM decides when the dialog closes — not the
  // button that submits it. See the note on the submit button below.
  const [open, setOpen] = React.useState(false);
  const [key, setKey] = React.useState<string | null>(null);

  return (
    <div className={stack}>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger render={<Button variant="outline" />}>
          New API key
        </Dialog.Trigger>
        <Dialog.Popup size="sm">
          <Dialog.Title>Create an API key</Dialog.Title>
          <Dialog.Description>
            The secret is shown once, immediately after it is created.
          </Dialog.Description>

          {/* The form wraps the footer as well as the fields, so the submit
              button below is the form's submit button without needing a
              `form` attribute pointing back at it by id. */}
          <Form
            onFormSubmit={(values) => {
              setKey(
                `${values.label} · ${SCOPES[values.scope as keyof typeof SCOPES]}`,
              );
              setOpen(false);
            }}
          >
            <Field.Root name="label">
              <Field.Label>Key name</Field.Label>
              <Input required placeholder="CI deploy" />
              <Field.Error match="valueMissing">
                Give the key a name you will recognise in six months.
              </Field.Error>
            </Field.Root>

            <Field.Root name="scope">
              <Field.Label nativeLabel={false}>Scope</Field.Label>
              <Select.Root items={SCOPES} defaultValue="read">
                <Select.Trigger fullWidth>
                  <Select.Value />
                  <Select.Icon />
                </Select.Trigger>
                {/* The select's popup portals to <body> like the dialog does,
                    and lands above it on its own: the dialog viewport sits at
                    z-index 40, one band under the 50 the anchored popups use. */}
                <Select.Popup>
                  {Object.entries(SCOPES).map(([value, label]) => (
                    <Select.Item key={value} value={value}>
                      {label}
                    </Select.Item>
                  ))}
                </Select.Popup>
              </Select.Root>
            </Field.Root>

            <Dialog.Footer>
              <Dialog.Close render={<Button variant="soft" tone="neutral" />}>
                Cancel
              </Dialog.Close>
              {/* NOT a Dialog.Close. A close button closes on press, before
                  the form has had a chance to validate — so an empty key name
                  would dismiss the dialog and submit nothing. The dialog is
                  closed from `onFormSubmit` instead, which only runs once
                  every field passes. */}
              <Button type="submit">Create key</Button>
            </Dialog.Footer>
          </Form>
        </Dialog.Popup>
      </Dialog.Root>

      {key ? <p className={receipt}>Created: {key}</p> : null}
    </div>
  );
}
