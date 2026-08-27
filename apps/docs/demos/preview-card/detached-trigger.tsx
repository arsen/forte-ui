"use client";

import { Button, PreviewCard } from "@dofortech/pretty-ui";

type Doc = { id: string; title: string; note: string };

const DOCS: Doc[] = [
  {
    id: "doc-tokens",
    title: "Tokens are the API",
    note: "Consume them, never invent a value — a typo in a var() fails silently.",
  },
  {
    id: "doc-axes",
    title: "Two axes, not a variant list",
    note: "variant is how loud a component is; tone is which colour set it draws from.",
  },
];

// Created once, at module scope. A handle made during render would be a new
// object on every pass and the root and its triggers would stop recognising
// each other. `React.useState(() => PreviewCard.createHandle())` is the escape
// hatch when the handle has to be per-instance.
const handbook = PreviewCard.createHandle<Doc>();

export default function PreviewCardDetachedTrigger() {
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      {/* These links are not children of PreviewCard.Root. They reach it
        * through the handle instead, which is what lets the card be declared
        * once, at the bottom, beside the data it renders — rather than nested
        * inside whichever paragraph happens to mention it. */}
      <p className="text-2 leading-normal">
        Two rules run through the whole codebase:{" "}
        {DOCS.map((doc, index) => (
          <span key={doc.id}>
            {index > 0 ? " and " : ""}
            <PreviewCard.Trigger id={doc.id} handle={handbook} payload={doc} href="#">
              {doc.title}
            </PreviewCard.Trigger>
          </span>
        ))}
        .
      </p>

      {/* The imperative half of the same handle. `open()` takes a TRIGGER ID —
        * the card still has to be anchored to something — so each link above
        * carries an explicit `id`. It is a no-op unless a root using this
        * handle is mounted; calls made before that are ignored rather than
        * queued. */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="soft"
          tone="neutral"
          size="sm"
          onClick={() => handbook.open(DOCS[0].id)}
        >
          Preview the first
        </Button>
        <Button
          variant="soft"
          tone="neutral"
          size="sm"
          onClick={() => handbook.close()}
        >
          Close
        </Button>
      </div>

      <PreviewCard.Root handle={handbook}>
        {({ payload }) => (
          <PreviewCard.Popup size="sm">
            <PreviewCard.Arrow />
            <span className="text-3 font-semibold">
              {payload?.title ?? "House rule"}
            </span>
            <p className="text-2 text-foreground-muted">
              {payload?.note ?? "Read CONTRIBUTING.md before touching a file."}
            </p>
          </PreviewCard.Popup>
        )}
      </PreviewCard.Root>
    </div>
  );
}
