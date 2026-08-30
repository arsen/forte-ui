"use client";

import * as React from "react";
import { Button, Toast, useToast } from "@forte-ui/react";

const PEOPLE = [
  { initials: "MO", name: "Maya Okonkwo", message: "Can you take a look at the migration?" },
  { initials: "TR", name: "Tomás Ruiz", message: "Shipped it — thanks for the review." },
  { initials: "AK", name: "Aiko Kimura", message: "Standup moved to 10:30." },
];

function Buttons() {
  const toast = useToast();
  const next = React.useRef(0);

  return (
    <Button
      variant="outline"
      onClick={() => {
        const person = PEOPLE[next.current % PEOPLE.length]!;
        next.current += 1;
        toast.show({
          title: person.name,
          description: person.message,
          // Anything in `data` reaches the renderer untouched.
          data: { initials: person.initials },
          action: { label: "Reply", onClick: () => {} },
        });
      }}
    >
      New message
    </Button>
  );
}

export default function ToastCustom() {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null);

  return (
    <div ref={setStage} className="relative min-h-[20rem] w-full">
      <Toast.Provider
        container={stage}
        // Every part still defaults its content from the toast, so a custom
        // arrangement does not mean restating the text.
        renderToast={(toast) => (
          <Toast.Item toast={toast}>
            <span
              className="grid size-7 shrink-0 place-items-center rounded-pill bg-primary-soft text-1 font-semibold text-primary-text"
              aria-hidden="true"
            >
              {String(toast.data?.initials ?? "?")}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <Toast.Title />
              <Toast.Description />
            </div>
            <Toast.Action />
            <Toast.Close />
          </Toast.Item>
        )}
      >
        <Buttons />
      </Toast.Provider>
    </div>
  );
}
