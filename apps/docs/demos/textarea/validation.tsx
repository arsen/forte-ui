"use client";

import * as React from "react";
import { Button, Field, Form, Textarea } from "@dofortech/pretty-ui";

export default function TextareaValidation() {
  const [sent, setSent] = React.useState<string | null>(null);

  return (
    <div className="w-full max-w-[28rem]">
      <Form onFormSubmit={(values) => setSent(String(values.feedback ?? ""))}>
        <Field.Root name="feedback">
          <Field.Label>What went wrong?</Field.Label>
          {/* Native constraints, so the browser owns the validity and the
            * component only reflects it: the boundary and the caret turn
            * danger-coloured off `data-invalid`, which arrives from
            * Field.Control whether the rule is `required`, `minLength` or a
            * custom `validate`. */}
          <Textarea
            required
            minLength={20}
            autoResize
            rows={3}
            maxRows={10}
            placeholder="The more detail the better."
          />
          <Field.Error match="valueMissing">
            Tell us what happened before sending.
          </Field.Error>
          <Field.Error match="tooShort">
            Twenty characters or more, please — a few words rarely reproduce.
          </Field.Error>
        </Field.Root>

        <Button type="submit" className="self-start">
          Send report
        </Button>
      </Form>

      {sent ? (
        <p className="mt-4 text-2 text-success-text">Thanks — report sent.</p>
      ) : null}
    </div>
  );
}
