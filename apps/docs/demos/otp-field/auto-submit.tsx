"use client";

import * as React from "react";
import { Button, Field, Form, OTPField } from "@forte-ui/react";

// Stands in for the request a real app would make.
const CORRECT = "482913";

export default function OTPFieldAutoSubmit() {
  const [code, setCode] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "checking" | "rejected" | "verified">(
    "idle",
  );

  return (
    <div className="flex w-full max-w-[24rem] flex-col gap-3">
      <Form
        onFormSubmit={async (values) => {
          setStatus("checking");
          await new Promise((resolve) => setTimeout(resolve, 700));
          if (values.code === CORRECT) {
            setStatus("verified");
            return;
          }
          setStatus("rejected");
          // Emptying the field is not housekeeping: onValueComplete fires on
          // the transition INTO a complete value, so overtyping six digits
          // that are already six digits would never submit again.
          setCode("");
        }}
      >
        <Field.Root name="code">
          <Field.Label>Enter the code we sent you</Field.Label>
          {/* autoSubmit: the code IS the form, so a Verify button would be a
            * step whose only content is "yes, the six digits I just typed".
            * The button stays for everyone the keystroke route does not
            * reach. */}
          <OTPField.Root
            length={6}
            autoSubmit
            value={code}
            onValueChange={setCode}
            readOnly={status === "checking" || status === "verified"}
          />
          <Field.Description>
            Try {CORRECT}, or anything else to watch it fail.
          </Field.Description>
        </Field.Root>

        <Button
          type="submit"
          loading={status === "checking"}
          disabled={status === "verified"}
          className="self-start"
        >
          {status === "verified" ? "Verified" : "Verify"}
        </Button>
      </Form>

      {/* A live region rather than a Field.Error: the code is not INVALID —
        * six digits is exactly what was asked for — it is simply not the right
        * six digits, which is an answer from the server, not a constraint. */}
      <p role="status" className="my-0 text-2 text-danger-text empty:hidden">
        {status === "rejected" ? "That code is not right. Check it and try again." : null}
      </p>
    </div>
  );
}
