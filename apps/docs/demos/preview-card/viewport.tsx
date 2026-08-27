"use client";

import { PreviewCard } from "@dofortech/pretty-ui";

type Repo = {
  id: string;
  name: string;
  summary: string;
  topics: string[];
};

const REPOS: Repo[] = [
  {
    id: "ramp",
    name: "ramp.mjs",
    summary: "The colour curve. Every ramp in the library is generated here.",
    topics: ["oklch", "generated"],
  },
  {
    id: "motion",
    name: "motion.mjs",
    summary:
      "Durations, easings and the damped-harmonic springs, sampled into linear() curves. Also the source of the reduced-motion equalities that CSS cannot state.",
    topics: ["springs", "reduced motion", "generated"],
  },
  {
    id: "contrast",
    name: "check-contrast.mjs",
    summary: "The gate. Sweeps ~119k in-gamut seeds and fails the build.",
    topics: ["wcag"],
  },
];

export default function PreviewCardViewport() {
  return (
    <PreviewCard.Root<Repo>>
      {({ payload }) => (
        <>
          <p className="max-w-md text-2 leading-normal">
            The generators are{" "}
            <PreviewCard.Trigger href="#" payload={REPOS[0]}>
              {REPOS[0].name}
            </PreviewCard.Trigger>
            ,{" "}
            <PreviewCard.Trigger href="#" payload={REPOS[1]}>
              {REPOS[1].name}
            </PreviewCard.Trigger>{" "}
            and{" "}
            <PreviewCard.Trigger href="#" payload={REPOS[2]}>
              {REPOS[2].name}
            </PreviewCard.Trigger>
            . Move between them without leaving the card.
          </p>

          <PreviewCard.Popup size="sm">
            {/* The Arrow stays OUTSIDE the viewport. The viewport clips, so
              * that it can slide one panel out while the other slides in —
              * and the arrow lives past the card's edge, where the clip would
              * eat it. */}
            <PreviewCard.Arrow />
            {/* Without this wrapper the content would still swap correctly; it
              * would just cut. The viewport keeps a clone of the outgoing
              * panel mounted for the length of the transition, slides the two
              * past each other in the direction the new link lies, and resizes
              * the card to follow — which is why the three panels here are
              * deliberately different heights. */}
            <PreviewCard.Viewport>
              {payload ? (
                <>
                  <span className="text-3 font-semibold">{payload.name}</span>
                  <p className="text-2 text-foreground-muted">
                    {payload.summary}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {payload.topics.map((topic) => (
                      <span
                        key={topic}
                        className="rounded-pill border border-border px-2 text-1 text-foreground-muted"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </>
              ) : null}
            </PreviewCard.Viewport>
          </PreviewCard.Popup>
        </>
      )}
    </PreviewCard.Root>
  );
}
