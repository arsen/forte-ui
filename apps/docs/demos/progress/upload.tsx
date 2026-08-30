"use client";

import * as React from "react";
import { Button, Progress, ProgressCircle } from "@forte-ui/react";

/* The realistic shape of a real upload, and the reason `value` accepts `null`
 * rather than there being an `indeterminate` prop: the same bar is
 * indeterminate while the request is in flight and determinate the moment the
 * first byte-count comes back. Nothing remounts, so the sweeping segment
 * settles into the real value on the same transition the rest of the upload
 * runs on, instead of unmounting and flashing an empty rail.
 *
 * The live region is the STATUS LINE, not the bar. A bar announces its value,
 * which a screen reader would then read out on every one of these ticks; what
 * a listener actually wants is the three moments that matter. `aria-live` on a
 * separate element is how you get one without the other. */
const TICK_MS = 260;

export default function ProgressUpload() {
  const [value, setValue] = React.useState<number | null>(null);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    if (!running) return undefined;

    // A beat of "no idea yet" before the first byte-count arrives — the state
    // this demo exists to show, and the one most progress bars skip straight
    // past by starting at 0.
    const start = setTimeout(() => setValue(0), 900);
    const tick = setInterval(() => {
      setValue((current) => {
        if (current == null) return current;
        if (current >= 100) return current;
        return Math.min(100, current + 7);
      });
    }, TICK_MS);

    return () => {
      clearTimeout(start);
      clearInterval(tick);
    };
  }, [running]);

  React.useEffect(() => {
    if (value === 100) setRunning(false);
  }, [value]);

  const done = value === 100;
  const status = done ? "Upload complete" : running ? "Uploading" : "Idle";

  function start() {
    setValue(null);
    setRunning(true);
  }

  return (
    <div className="grid justify-items-start gap-5">
      <Button onClick={start} disabled={running}>
        {done ? "Upload again" : "Start upload"}
      </Button>

      <div className="flex w-full max-w-md flex-wrap items-center gap-6">
        <Progress.Root
          value={value}
          // Green on completion is the one place a tone change is worth the
          // extra prop: it marks an end state that the bar's own geometry —
          // full — is easy to mistake for "nearly there".
          tone={done ? "success" : "primary"}
          className="min-w-3xs flex-1"
        >
          <Progress.Label>Uploading render.mov</Progress.Label>
          <Progress.Value>
            {(formatted, current) => (current == null ? "Starting…" : formatted)}
          </Progress.Value>
          <Progress.Track>
            <Progress.Indicator />
          </Progress.Track>
        </Progress.Root>

        <ProgressCircle.Root value={value} tone={done ? "success" : "primary"}>
          <ProgressCircle.Track>
            <ProgressCircle.Indicator />
          </ProgressCircle.Track>
          <ProgressCircle.Value />
          <ProgressCircle.Label className="forte-visually-hidden">
            Uploading render.mov
          </ProgressCircle.Label>
        </ProgressCircle.Root>
      </div>

      <span aria-live="polite" className="text-1 text-foreground-muted">
        {status}
      </span>
    </div>
  );
}
