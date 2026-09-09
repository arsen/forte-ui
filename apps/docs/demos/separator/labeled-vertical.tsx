"use client";

import { Button, Input, Separator } from "@forte-ui/react";

const column = "flex flex-1 flex-col gap-3";
const heading = "m-0 text-3";
const copy = "m-0 text-2 text-foreground-muted";

export default function SeparatorLabeledVertical() {
  return (
    <div className="flex w-full max-w-[30rem] gap-5">
      <div className={column}>
        <h3 className={heading}>Upload a file</h3>
        <p className={copy}>CSV or JSON, up to 10 MB.</p>
        <Button variant="outline">Choose file</Button>
      </div>

      {/* Upright, with a half-line above and below. In a flex row the halves
        * stretch to the taller column, exactly as the plain rule would. */}
      <Separator orientation="vertical">or</Separator>

      <div className={column}>
        <h3 className={heading}>Paste a link</h3>
        <Input placeholder="https://" aria-label="Link" />
        <Button>Fetch</Button>
      </div>
    </div>
  );
}
