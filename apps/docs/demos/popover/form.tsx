"use client";

import * as React from "react";
import { Button, Field, Input, Popover } from "@dofortech/forte-ui";

export default function PopoverForm() {
  const [name, setName] = React.useState("Weekly digest");
  const nameRef = React.useRef<HTMLInputElement>(null);

  return (
    <Popover.Root>
      <Popover.Trigger render={<Button variant="outline" tone="neutral" />}>
        Rename report
      </Popover.Trigger>
      {/* `initialFocus` points at the input instead of letting focus land on
        * the first tabbable element, which here would be the same thing —
        * but say so explicitly and it survives a close button being added
        * above it later. Base UI still overrides it for touch opens, where
        * focusing an input would throw up the virtual keyboard. */}
      <Popover.Popup initialFocus={nameRef}>
        <Popover.Arrow />
        <Popover.Title>Rename report</Popover.Title>
        <Field.Root name="report-name">
          <Field.Label>Report name</Field.Label>
          <Input
            ref={nameRef}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Field.Root>
        <Popover.Footer>
          {/* Both buttons close, so both are Popover.Close — it is the same
            * state change as calling close() yourself, but it keeps them real
            * close controls for assistive technology. */}
          <Popover.Close render={<Button variant="soft" tone="neutral" />}>
            Cancel
          </Popover.Close>
          <Popover.Close render={<Button />}>Save</Popover.Close>
        </Popover.Footer>
      </Popover.Popup>
    </Popover.Root>
  );
}
