"use client";

import * as React from "react";
import { Avatar, Button, Card, Skeleton } from "@forte-ui/react";

const ARTICLE = {
  author: "Adaobi Okonkwo",
  initials: "AO",
  meta: "Design systems · 6 min read",
  title: "One variable, every colour",
  body: `The palette is rebuilt from a single seed
with relative colour syntax: no JavaScript,
no build step, no runtime theming layer.`,
};

export default function SkeletonCard() {
  const [loading, setLoading] = React.useState(true);

  async function reload() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2200));
    setLoading(false);
  }

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    /* `w-full max-w-sm` lives HERE, on the wrapper, not on the card — and the
     * wrapper is not `justify-items-start`. Both halves matter: a grid whose
     * items are `start`-justified sizes each area to MAX-CONTENT, so a `w-full`
     * card inside one resolves its width against its own contents and is sized
     * by the placeholders rather than by the layout. The card then grew 55px
     * wider the moment the real text arrived — a horizontal shift, in the demo
     * whose entire claim is that nothing moves. A definite width on the wrapper
     * is what makes `w-full` mean something. */
    <div className="grid w-full max-w-sm gap-4">
      <Button className="justify-self-start" onClick={reload} disabled={loading}>
        Reload article
      </Button>

      {/* The group is mounted in BOTH states, which is the entire point: a live
        * region has to exist before its contents change to be announced
        * reliably. `loading` flips inside it, and every skeleton below inherits
        * that flag and the `shimmer` default without being told twice.
        *
        * Every placeholder here is a `Skeleton.Text`, even the one-line ones —
        * that is what reserves a full line BOX rather than just the ink, so the
        * card is the same height in both states. Watch the button below it: it
        * does not move when the article lands. */}
      {/* The SURFACE is a Card and the LIVE REGION is the group inside it —
        * two components, one card, composed the way an app would write it.
        * The group keeps only its gap; the border, fill and padding are the
        * card's own. */}
      <Card.Root>
        <Skeleton.Group
          loading={loading}
          label="Loading article"
          doneLabel="Article loaded"
          animation="shimmer"
          className="gap-4"
        >
          <div className="flex items-center gap-3">
            {loading ? (
              <Skeleton.Root variant="circle" className="size-10" />
            ) : (
              <Avatar.Root size="md" tone="primary">
                <Avatar.Fallback label={ARTICLE.author}>{ARTICLE.initials}</Avatar.Fallback>
              </Avatar.Root>
            )}
            <div className="grid flex-1 gap-1">
              {loading ? (
                <>
                  {/* A skeleton's widths are a PREDICTION, and getting their
                    * relative lengths right is most of what makes a card read as
                    * the content rather than as a pile of bars. The byline is
                    * LONGER than the name here, so these are `w-32` / `w-40` —
                    * 128px and 160px against 125px and 159px of real text. The
                    * obvious "second line is shorter" guess inverts the shape,
                    * and the eye catches it the moment the text lands. */}
                  <Skeleton.Text lines={1} className="w-32 text-2" />
                  <Skeleton.Text lines={1} className="w-40 text-1" />
                </>
              ) : (
                <>
                  <span className="text-2 leading-normal font-medium">{ARTICLE.author}</span>
                  <span className="text-1 leading-normal text-foreground-muted">{ARTICLE.meta}</span>
                </>
              )}
            </div>
          </div>

          {loading ? (
            <Skeleton.Root className="h-28 w-full" />
          ) : (
            <div className="grid h-28 w-full place-items-center rounded-control bg-primary-soft text-2 text-primary-text">
              {ARTICLE.title}
            </div>
          )}

          {loading ? (
            <Skeleton.Text lines={3} className="text-2" />
          ) : (
            // `m-0` because the docs site does not import Preflight: a bare `<p>`
            // keeps the UA's block margins, and the card would grow by 2em the
            // moment the copy arrived — the one thing a skeleton exists to stop.
            <p className="m-0 text-2 leading-normal whitespace-pre-line text-foreground-muted">
              {ARTICLE.body}
            </p>
          )}
        </Skeleton.Group>
      </Card.Root>
    </div>
  );
}
