"use client";

import * as React from "react";
import { Tabs } from "@forte-ui/react";
import { DemoFrame, DemoControls, type DemoScope } from "./demo-frame";

const INITIAL: DemoScope = { theme: "inherit", dir: "ltr", motion: "inherit" };

/**
 * Preview / Code shell around a demo.
 *
 * `preview` and `code` arrive as already-rendered nodes from a server
 * component — the demo itself and the Shiki-highlighted markup both stay on
 * the server. This component only owns the tab and scope state, so adding
 * these controls costs the demo nothing in client JS.
 */
export function DemoShell({
  preview,
  code,
  title,
}: {
  preview: React.ReactNode;
  code: React.ReactNode;
  title?: string;
}) {
  const [scope, setScope] = React.useState<DemoScope>(INITIAL);
  // Remounting the subtree is the only reliable way to reset a demo whose
  // state lives inside the demo component itself.
  const [resetKey, setResetKey] = React.useState(0);

  return (
    <div className="my-5 overflow-hidden rounded-surface border border-border-muted bg-panel">
      {/* The rail is off because the HEADER draws it instead, one row out. The
        * strip shares that row with the filename, so a `line` variant's own
        * rail spans the two tabs and stops — a 155px stub sitting one pixel
        * above the header's full-width border, in the same color. A knob
        * rather than a class: it is a custom property, which a utility cannot
        * set, and it has to land on Tabs.Root, which is where it is declared. */}
      <Tabs.Root
        defaultValue="preview"
        variant="line"
        className="block"
        style={{ "--forte-tabs-rail-width": "0px" } as React.CSSProperties}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border-muted px-3">
          <Tabs.List className="gap-1">
            <Tabs.Tab value="preview" className="text-2">Preview</Tabs.Tab>
            <Tabs.Tab value="code" className="text-2">Code</Tabs.Tab>
            {/* Tabs.Indicator positions and animates itself from Base UI's
              * --active-tab-* variables; nothing to add here. */}
            <Tabs.Indicator />
          </Tabs.List>
          {title ? <span className="font-mono text-1 text-foreground-subtle">{title}</span> : null}
        </div>

        {/* Base UI makes the active panel focusable (Tab from the strip lands on
          * it), so it draws the library's outset focus ring — 4px outside its
          * box. The shell above is `overflow-hidden` with the panel flush to
          * its edges, so that ring was clipped on three sides and survived only
          * along the top, where it reaches into the header row: a green bar
          * under the tabs that read as a rendering fault. `data-focus-inset`
          * is the library's statement that a part sits in a clipping context
          * and rings INWARD instead — the same attribute every Tab carries. */}
        <Tabs.Panel value="preview" className="block" data-focus-inset="">
          <DemoFrame key={resetKey} scope={scope}>
            {preview}
          </DemoFrame>
          <DemoControls
            scope={scope}
            onChange={setScope}
            onReset={() => setResetKey((k) => k + 1)}
          />
        </Tabs.Panel>

        {/* The code panel supplies its own bordered figure, which would double
          * up on the shell's border — so the figure gives its own back. */}
        <Tabs.Panel
          value="code"
          className="block [&>figure]:rounded-none [&>figure]:border-0"
          data-focus-inset=""
        >
          {code}
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  );
}
