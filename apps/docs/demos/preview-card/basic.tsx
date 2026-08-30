"use client";

import { Avatar, PreviewCard } from "@forte-ui/react";

export default function PreviewCardBasic() {
  return (
    <p className="max-w-md text-2 leading-normal">
      The first algorithm intended for a machine was published in 1843 by{" "}
      <PreviewCard.Root>
        {/* An `href` is not decoration. Without one the element is not
          * focusable, so the card can only ever be reached by a pointer — and
          * a pointer user is the one person who did not need the link
          * flagged. */}
        <PreviewCard.Trigger href="https://en.wikipedia.org/wiki/Ada_Lovelace">
          Ada Lovelace
        </PreviewCard.Trigger>
        <PreviewCard.Popup>
          <PreviewCard.Arrow />
          <div className="flex items-center gap-3">
            <Avatar.Root size="lg">
              {/* Empty alt: the name is written right beside it, and
                * repeating it would have a screen reader say it twice. */}
              <Avatar.Image src="/avatars/ada.svg" alt="" />
              <Avatar.Fallback>AL</Avatar.Fallback>
            </Avatar.Root>
            <div className="grid">
              <span className="text-3 font-semibold">Ada Lovelace</span>
              <span className="text-1 text-foreground-muted">@ada</span>
            </div>
          </div>
          <p className="text-2 text-foreground-muted">
            Wrote Note G, the algorithm for computing Bernoulli numbers on
            Babbage&rsquo;s Analytical Engine.
          </p>
          <div className="flex gap-4 text-1 text-foreground-muted">
            <span>
              <span className="font-medium text-foreground">1815</span> born
            </span>
            <span>
              <span className="font-medium text-foreground">1843</span>{" "}
              published
            </span>
          </div>
        </PreviewCard.Popup>
      </PreviewCard.Root>
      , working from Menabrea&rsquo;s notes.
    </p>
  );
}
