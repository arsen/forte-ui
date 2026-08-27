"use client";

import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from "lucide-react";
import { Toggle, ToggleGroup, Toolbar } from "@dofortech/pretty-ui";

const ICON = "size-4 shrink-0";

export default function ToolbarBasic() {
  return (
    // `role="toolbar"` is not a labelable element, so the bar cannot take a
    // <label> — it needs `aria-label` or `aria-labelledby` instead.
    <Toolbar.Root aria-label="Formatting">
      {/* A ToggleGroup inside a toolbar does NOT open a second keyboard mode.
        * Base UI's ToggleGroup checks for a toolbar above it and, finding one,
        * skips its own roving focus so its toggles join the BAR's arrow-key
        * order. Nothing here has to know that — it is why you can drop the
        * group straight in. */}
      <ToggleGroup aria-label="Text style" multiple defaultValue={["bold"]}>
        <Toggle iconOnly value="bold" aria-label="Bold">
          <Bold className={ICON} />
        </Toggle>
        <Toggle iconOnly value="italic" aria-label="Italic">
          <Italic className={ICON} />
        </Toggle>
        <Toggle iconOnly value="underline" aria-label="Underline">
          <Underline className={ICON} />
        </Toggle>
      </ToggleGroup>

      <Toolbar.Separator />

      <ToggleGroup aria-label="Alignment" defaultValue={["left"]}>
        <Toggle iconOnly value="left" aria-label="Align left">
          <AlignLeft className={ICON} />
        </Toggle>
        <Toggle iconOnly value="center" aria-label="Align center">
          <AlignCenter className={ICON} />
        </Toggle>
        <Toggle iconOnly value="right" aria-label="Align right">
          <AlignRight className={ICON} />
        </Toggle>
      </ToggleGroup>

      <Toolbar.Separator />

      {/* Left alone, `Toolbar.Button` is a `Button` that happens to be in the
        * bar's arrow-key order — every variant, tone and size still applies.
        * The primary action asks for `solid` explicitly, because the default
        * here is `ghost`: a row of solid buttons has no hierarchy left to
        * spend on the one that matters. */}
      <Toolbar.Button variant="solid" tone="primary">
        Publish
      </Toolbar.Button>
    </Toolbar.Root>
  );
}
