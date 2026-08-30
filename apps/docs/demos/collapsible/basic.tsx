"use client";

import { Collapsible } from "@dofortech/forte-ui";

const column = "flex w-full max-w-lg flex-col gap-3 text-2 leading-normal";

export default function CollapsibleBasic() {
  return (
    <div className={column}>
      <p className="m-0">
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
