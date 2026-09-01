"use client";

import { Copy } from "lucide-react";
import { Button, ButtonGroup, Input } from "@forte-ui/react";

const ICON = "size-4 shrink-0";

export default function ButtonGroupInput() {
  return (
    // An input fuses like any other control — it draws the same 1px border a
    // button does. The Text cell renders as a <label> here, so clicking the
    // prefix drops the caret into the field.
    <ButtonGroup.Root aria-label="Clone repository">
      <ButtonGroup.Text render={<label htmlFor="clone-url" />}>
        https://
      </ButtonGroup.Text>
      <Input
        id="clone-url"
        defaultValue="github.com/arsen/forte-ui.git"
        readOnly
      />
      <Button variant="outline" tone="neutral" iconOnly aria-label="Copy URL">
        <Copy className={ICON} />
      </Button>
    </ButtonGroup.Root>
  );
}
