"use client";

import { InputGroup, Spinner } from "@dofortech/pretty-ui";

export default function InputGroupLoading() {
  return (
    <div className="w-full max-w-[22rem]">
      <InputGroup.Root fullWidth>
        <InputGroup.Input
          defaultValue="pretty-ui"
          aria-label="Package name"
          aria-describedby="name-check"
        />
        <InputGroup.Addon align="inline-end">
          {/* The spinner is its own live region, so the wait is announced
            * without any wiring beyond the label. */}
          <Spinner size="sm" label="Checking availability" id="name-check" />
        </InputGroup.Addon>
      </InputGroup.Root>
    </div>
  );
}
