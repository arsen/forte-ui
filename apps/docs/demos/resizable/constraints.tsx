"use client";

import * as React from "react";
import { Resizable } from "@dofortech/pretty-ui";

/* `minSize` and `maxSize` take a px string as readily as a percentage, and a
 * px constraint is re-resolved against the group's measured width — so the
 * `220px` floor below survives the demo frame being narrowed. `onLayout`
 * reports the result in percent, which is what the group stores. */
export default function ResizableConstraints() {
  const [sizes, setSizes] = React.useState<number[]>([]);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <Resizable.Group
        orientation="horizontal"
        onLayout={setSizes}
        className="h-44 overflow-hidden rounded-surface border border-border-muted"
      >
        <Resizable.Panel defaultSize={40} minSize="220px" maxSize="60%">
          <div className="h-full p-4 text-2 text-foreground-muted">
            <p className="m-0 font-medium text-foreground">min 220px · max 60%</p>
            <p className="m-0">A floor in pixels is the constraint a sidebar actually has.</p>
          </div>
        </Resizable.Panel>
        <Resizable.Handle grip />
        <Resizable.Panel minSize="20%">
          <div className="h-full p-4 text-2 text-foreground-muted">
            <p className="m-0 font-medium text-foreground">min 20%</p>
            <p className="m-0">Mixing units in one group is fine; everything resolves to percent.</p>
          </div>
        </Resizable.Panel>
      </Resizable.Group>

      <p className="m-0 font-mono text-1 text-foreground-subtle">
        onLayout → [{sizes.map((size) => size.toFixed(1)).join(", ")}]
      </p>
    </div>
  );
}
