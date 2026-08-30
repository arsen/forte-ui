"use client";

import { Field, NumberField } from "@dofortech/forte-ui";

export default function NumberFieldBasic() {
  return (
    <div className="w-full max-w-[16rem]">
      <Field.Root name="quantity">
        {/* Wrapping the label in a ScrubArea is what turns it into a drag
          * handle. The grip after the text, the resize cursor on hover and the
          * tint while dragging all ship with it — try dragging the word. */}
        <NumberField.Root defaultValue={1} min={1} max={99}>
          <NumberField.ScrubArea>
            <Field.Label>Quantity</Field.Label>
          </NumberField.ScrubArea>
          <NumberField.Group>
            <NumberField.Decrement />
            <NumberField.Input />
            <NumberField.Increment />
          </NumberField.Group>
        </NumberField.Root>
        <Field.Description>Between 1 and 99.</Field.Description>
      </Field.Root>
    </div>
  );
}
