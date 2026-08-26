"use client";

import type { CSSProperties } from "react";
import { Collapsible } from "@dofortech/pretty-ui";

const column: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "var(--pui-space-3)",
  inlineSize: "min(32rem, 100%)",
  fontSize: "var(--pui-font-size-2)",
  lineHeight: "var(--pui-line-height-normal)",
};

export default function CollapsibleBasic() {
  return (
    <div style={column}>
      <p style={{ margin: 0 }}>
        Your export will include every project you own, as newline-delimited
        JSON, and a link will be emailed to you when it is ready.
      </p>

      <Collapsible.Root>
        <Collapsible.Trigger>What is in the file?</Collapsible.Trigger>
        <Collapsible.Panel>
          One record per project: its name, the date it was created, every
          revision, and the members who have ever had access. Attachments are
          referenced by URL rather than inlined.
        </Collapsible.Panel>
      </Collapsible.Root>
    </div>
  );
}
