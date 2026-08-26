"use client";

import * as React from "react";
import {
  Button,
  Field,
  Fieldset,
  Form,
  Radio,
  RadioGroup,
} from "@dofortech/pretty-ui";

const SEATS = [
  { value: "1", label: "Just me" },
  { value: "5", label: "Up to 5" },
  { value: "25", label: "Up to 25" },
];

export default function RadioForm() {
  const [submitted, setSubmitted] = React.useState<Record<
    string,
    unknown
  > | null>(null);

  return (
    <div style={{ inlineSize: "min(26rem, 100%)" }}>
      <Form onFormSubmit={(values) => setSubmitted(values)}>
        {/* Fieldset.Legend names the whole section. The Field.Root inside
          * carries the `name` that the value is submitted under — the group
          * itself needs no `name` prop when it sits in a field. */}
        <Fieldset.Root>
          <Fieldset.Legend>Subscription</Fieldset.Legend>

          <Field.Root name="seats">
            <Field.Label nativeLabel={false}>Seats</Field.Label>
            <RadioGroup defaultValue="5" orientation="horizontal">
              {SEATS.map((seat) => (
                <Field.Item key={seat.value}>
                  <Field.Label>
                    <Radio value={seat.value} />
                    {seat.label}
                  </Field.Label>
                </Field.Item>
              ))}
            </RadioGroup>
          </Field.Root>

          {/* `required` on the group, with no defaultValue: nothing is
            * selected, so submitting fails validation and Form moves focus to
            * the first radio. The error matches `valueMissing`, exactly as it
            * would for a required <input>. */}
          <Field.Root name="billing">
            <Field.Label nativeLabel={false}>Billing period</Field.Label>
            <RadioGroup required>
              <Field.Item>
                <Field.Label>
                  <Radio value="monthly" />
                  Monthly
                </Field.Label>
              </Field.Item>
              <Field.Item>
                <Field.Label>
                  <Radio value="yearly" />
                  Yearly — two months free
                </Field.Label>
              </Field.Item>
            </RadioGroup>
            <Field.Error match="valueMissing">
              Choose how you would like to be billed.
            </Field.Error>
          </Field.Root>
        </Fieldset.Root>

        <Button type="submit" style={{ alignSelf: "flex-start" }}>
          Continue
        </Button>
      </Form>

      {submitted ? (
        <pre
          style={{
            marginBlockStart: "var(--pui-space-5)",
            padding: "var(--pui-space-4)",
            borderRadius: "var(--pui-radius-surface)",
            backgroundColor: "var(--pui-color-panel)",
            fontFamily: "var(--pui-font-mono)",
            fontSize: "var(--pui-font-size-1)",
            overflowX: "auto",
          }}
        >
          {JSON.stringify(submitted, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
