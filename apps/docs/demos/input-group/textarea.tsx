"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { InputGroup } from "@forte-ui/react";

const LIMIT = 280;

export default function InputGroupTextareaDemo() {
  const [value, setValue] = React.useState("");

  return (
    <div className="w-full max-w-[26rem]">
      <InputGroup.Root fullWidth>
        <InputGroup.Textarea
          placeholder="Write a comment…"
          aria-label="Comment"
          aria-describedby="comment-count"
          rows={3}
          maxRows={8}
          autoResize
          maxLength={LIMIT}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        <InputGroup.Addon align="block-end" className="justify-between">
          <InputGroup.Text id="comment-count">
            {value.length}/{LIMIT}
          </InputGroup.Text>
          <InputGroup.Button
            variant="solid"
            tone="primary"
            iconOnly
            aria-label="Post comment"
            disabled={value.trim() === ""}
          >
            <ArrowUp aria-hidden="true" />
          </InputGroup.Button>
        </InputGroup.Addon>
      </InputGroup.Root>
    </div>
  );
}
