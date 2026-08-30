"use client";

import { Field, InputGroup } from "@dofortech/forte-ui";

export default function InputGroupTextAddons() {
  return (
    <div className="flex w-full max-w-[22rem] flex-col gap-4">
      <Field.Root name="site">
        <Field.Label>Site address</Field.Label>
        <InputGroup.Root>
          <InputGroup.Addon>
            <InputGroup.Text>https://</InputGroup.Text>
          </InputGroup.Addon>
          <InputGroup.Input placeholder="example" />
          <InputGroup.Addon align="inline-end">
            <InputGroup.Text>.com</InputGroup.Text>
          </InputGroup.Addon>
        </InputGroup.Root>
        <Field.Description>
          Protocol and domain are added for you.
        </Field.Description>
      </Field.Root>

      <Field.Root name="price">
        <Field.Label>Price</Field.Label>
        <InputGroup.Root>
          <InputGroup.Addon>
            <InputGroup.Text>$</InputGroup.Text>
          </InputGroup.Addon>
          <InputGroup.Input
            placeholder="0.00"
            inputMode="decimal"
            // The prefix and suffix are visual; this is what a screen reader
            // gets instead of hunting for the "$".
            aria-describedby="price-currency"
          />
          <InputGroup.Addon align="inline-end">
            <InputGroup.Text id="price-currency">USD</InputGroup.Text>
          </InputGroup.Addon>
        </InputGroup.Root>
      </Field.Root>
    </div>
  );
}
