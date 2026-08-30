"use client";

import { Button, Drawer } from "@forte-ui/react";

// Long enough to overflow a 4K display, so the scroll — and the swipe that
// only takes over once the scroll has bottomed out — is actually reachable.
const RELEASES: [string, string][] = [
  ["4.2.0", "Deploy previews build in parallel."],
  ["4.1.9", "Job logs stream from the first byte instead of the first line."],
  ["4.1.8", "Fixed a race that duplicated the first log line of a rerun."],
  ["4.1.7", "Concurrency groups accept a cancel-in-progress flag."],
  ["4.1.6", "The run list keeps its filters when you navigate back to it."],
  ["4.1.5", "Reduced memory use on repositories with very deep histories."],
  ["4.1.4", "Fixed a crash when a workspace had no default branch."],
  ["4.1.3", "The CLI reports the slowest step of every run."],
  ["4.1.2", "Environment variables are redacted in shared logs."],
  ["4.1.1", "Restored the keyboard shortcut for re-running a job."],
  ["4.1.0", "Job matrices accept expressions."],
  ["4.0.9", "Scheduled runs honour the repository's timezone."],
  ["4.0.8", "Cache keys may include the runner architecture."],
  ["4.0.7", "Fixed truncated output on steps that write faster than 1 MB/s."],
  ["4.0.6", "Reduced cold-start time on the smallest runner."],
  ["4.0.5", "Webhook retries use exponential backoff."],
  ["4.0.4", "Fixed duplicate notifications on cancelled runs."],
  ["4.0.3", "Artifacts over 2 GB upload in chunks."],
  ["4.0.2", "Secrets are masked in step names as well as step output."],
  ["4.0.1", "Fixed a regression that skipped the final cleanup step."],
  ["4.0.0", "New runner image, based on Ubuntu 24.04."],
  ["3.9.6", "Backported the artifact chunking fix."],
  ["3.9.5", "Fixed a deadlock when two jobs shared a cache key."],
  ["3.9.4", "Improved error messages for malformed workflow files."],
  ["3.9.3", "Run summaries render task lists."],
  ["3.9.2", "Fixed an off-by-one in the retry counter."],
  ["3.9.1", "Self-hosted runners report their own disk pressure."],
  ["3.9.0", "Reusable workflows accept typed inputs."],
];

const entry = "flex flex-col gap-1 border-t border-border-muted py-3";

const version = "font-mono text-1 font-semibold";

const note = "text-foreground-muted";

export default function DrawerScrollable() {
  return (
    <Drawer.Root side="right">
      <Drawer.Trigger render={<Button variant="outline" />}>
        Release notes
      </Drawer.Trigger>
      <Drawer.Popup>
        <Drawer.Content>
          <Drawer.Title>Release notes</Drawer.Title>
          <Drawer.Description>
            Everything shipped in the last six months.
          </Drawer.Description>
          <div>
            {RELEASES.map(([v, text]) => (
              <div key={v} className={entry}>
                <span className={version}>{v}</span>
                <span className={note}>{text}</span>
              </div>
            ))}
          </div>
        </Drawer.Content>
        {/* Outside Drawer.Content, so it pins to the bottom of the drawer
            instead of scrolling away with the list. */}
        <Drawer.Footer>
          <Drawer.Close render={<Button />}>Close</Drawer.Close>
        </Drawer.Footer>
      </Drawer.Popup>
    </Drawer.Root>
  );
}
