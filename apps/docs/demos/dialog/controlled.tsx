"use client";

import * as React from "react";
import { Button, Dialog } from "@forte-ui/react";

type Job = {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  duration: string;
};

const JOBS: Job[] = [
  {
    id: "nightly-backup",
    name: "Nightly backup",
    schedule: "Every day at 02:00 UTC",
    lastRun: "Today at 02:00",
    duration: "4 min 12 s",
  },
  {
    id: "usage-rollup",
    name: "Usage rollup",
    schedule: "Every hour, on the hour",
    lastRun: "Today at 14:00",
    duration: "38 s",
  },
  {
    id: "invoice-sweep",
    name: "Invoice sweep",
    schedule: "First of the month at 06:00 UTC",
    lastRun: "1 August at 06:00",
    duration: "2 min 05 s",
  },
];

const stack = "flex w-full max-w-sm flex-col gap-2";

const rows = "flex flex-col";

const row = "flex justify-between gap-4 border-t border-border-muted py-2";

const label = "text-foreground-muted";

export default function DialogControlled() {
  // Two pieces of state, not one. `open` is what the dialog is told; `job` is
  // what it reads. They stop being true at different moments — see
  // onOpenChangeComplete below.
  const [open, setOpen] = React.useState(false);
  const [job, setJob] = React.useState<Job | null>(null);

  function inspect(next: Job) {
    setJob(next);
    setOpen(true);
  }

  return (
    <div className={stack}>
      {JOBS.map((item) => (
        <Button
          key={item.id}
          variant="outline"
          tone="neutral"
          fullWidth
          onClick={() => inspect(item)}
        >
          {item.name}
        </Button>
      ))}

      {/* No Dialog.Trigger anywhere: the rows above are ordinary buttons that
          happen to set state, and the dialog only ever reads it. */}
      <Dialog.Root
        open={open}
        // Every exit reports here — Escape, an outside press and Dialog.Close
        // alike. Accept all of them; a controlled dialog that filters one out
        // stays on screen after the user has already dismissed it.
        onOpenChange={setOpen}
        // Base UI keeps the popup mounted until the closing gesture finishes,
        // so the job has to outlive the `false`. Clearing it in onOpenChange
        // would empty the title and body in full view of the animation.
        onOpenChangeComplete={(nowOpen) => {
          if (!nowOpen) {
            setJob(null);
          }
        }}
      >
        <Dialog.Popup size="sm">
          {job ? (
            <>
              <Dialog.Title>{job.name}</Dialog.Title>
              <Dialog.Description>{job.schedule}</Dialog.Description>
              <div className={rows}>
                <div className={row}>
                  <span className={label}>Last run</span>
                  <span>{job.lastRun}</span>
                </div>
                <div className={row}>
                  <span className={label}>Duration</span>
                  <span>{job.duration}</span>
                </div>
              </div>
            </>
          ) : null}
          <Dialog.Footer>
            {/* Closing from inside the dialog goes through Dialog.Close, not
                through setOpen(false). It is the same state change either way,
                but this one keeps the button a real close control for
                assistive technology. */}
            <Dialog.Close render={<Button variant="soft" tone="neutral" />}>
              Close
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Popup>
      </Dialog.Root>
    </div>
  );
}
