"use client";

import * as React from "react";
import { Button, Field, Form, Input } from "@dofortech/forte-ui";

/** Stands in for the request. Anything but "free@example.com" is accepted. */
async function signUp(
  values: Record<string, unknown>,
): Promise<{ errors: Record<string, string> }> {
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (values.email === "free@example.com") {
    return { errors: { email: "That address is already registered." } };
  }
  return { errors: {} };
}

export default function FormServerErrors() {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [pending, setPending] = React.useState(false);

  return (
    <div className="w-full max-w-sm">
      <Form
        errors={errors}
        // Base UI mirrors `errors` into its own state and drops a field's
        // entry as soon as that field changes — a server error describes a
        // value the server has seen, so it stops being true once the value
        // moves. Nothing to clear by hand.
        onFormSubmit={async (values) => {
          setPending(true);
          const result = await signUp(values);
          setPending(false);
          setErrors(result.errors);
        }}
      >
        <Field.Root name="email">
          <Field.Label>Email</Field.Label>
          <Input type="email" required defaultValue="free@example.com" />
          {/* No `match`: the same element renders the browser's constraint
            * message and whatever the server sent back for this name. */}
          <Field.Error />
        </Field.Root>

        <Button type="submit" loading={pending} className="self-start">
          Sign up
        </Button>
      </Form>
    </div>
  );
}
