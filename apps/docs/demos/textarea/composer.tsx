"use client";

import * as React from "react";
import { Avatar, Button, Textarea } from "@dofortech/forte-ui";

export default function TextareaComposer() {
  const [draft, setDraft] = React.useState("");
  const [posted, setPosted] = React.useState<string[]>([
    "The row bounds are what sold me — no more jumping submit button.",
  ]);

  const trimmed = draft.trim();

  function post() {
    if (!trimmed) return;
    setPosted((all) => [...all, trimmed]);
    setDraft("");
  }

  return (
    <div className="flex w-full max-w-[32rem] flex-col gap-4">
      <ul className="flex list-none flex-col gap-3 p-0">
        {posted.map((comment, i) => (
          <li key={i} className="flex gap-3">
            <Avatar.Root size="sm" tone="secondary">
              <Avatar.Fallback label="Bea Rivera">BR</Avatar.Fallback>
            </Avatar.Root>
            <p className="m-0 text-2 leading-normal">{comment}</p>
          </li>
        ))}
      </ul>

      <div className="flex gap-3">
        <Avatar.Root size="sm" tone="primary">
          <Avatar.Fallback label="Ada Lovelace">AL</Avatar.Fallback>
        </Avatar.Root>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          {/* The composer shape: `soft` so it reads as part of the thread
            * rather than as a form, one row at rest, and a ceiling so a long
            * comment scrolls instead of pushing Post out of reach. */}
          <Textarea
            variant="soft"
            autoResize
            rows={1}
            maxRows={8}
            fullWidth
            value={draft}
            onValueChange={setDraft}
            aria-label="Write a comment"
            placeholder="Write a comment…"
            onKeyDown={(event) => {
              // Enter on its own has to keep inserting a newline — this is a
              // textarea, and the shortcut is the modifier, not the key.
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                post();
              }
            }}
          />

          <div className="flex items-center justify-between gap-3">
            <span className="text-1 text-foreground-muted">
              <kbd className="font-mono">⌘</kbd> +{" "}
              <kbd className="font-mono">Enter</kbd> to post
            </span>
            <Button size="sm" onClick={post} disabled={!trimmed}>
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
