"use client";

import * as React from "react";
import { Carousel, type CarouselChangeReason } from "@forte-ui/react";

const PAGES = ["Cover", "Contents", "Chapter one", "Chapter two", "Index"];

const slide =
  "flex h-[12rem] select-none flex-col items-center justify-center gap-2 rounded-surface text-foreground";

export default function CarouselSettle() {
  const [index, setIndex] = React.useState(0);
  // The page that gets the expensive, interactive view. It follows the
  // track's arrival, not the release, so building it never stalls the glide.
  const [live, setLive] = React.useState(0);
  const [last, setLast] = React.useState<CarouselChangeReason | null>(null);

  return (
    <Carousel.Root
      aria-label="Document pages"
      index={index}
      onIndexChange={setIndex}
      onSettle={(i, reason) => {
        setLive(i);
        setLast(reason);
      }}
      className="group w-full max-w-lg"
    >
      <Carousel.Viewport>
        <Carousel.Track>
          {PAGES.map((page, i) => (
            <Carousel.Slide key={page}>
              <div className={`${slide} ${i === live ? "bg-primary-soft" : "bg-panel-hover"}`}>
                <span className="text-4 font-semibold">{page}</span>
                <span className="text-1 uppercase tracking-wide text-foreground-muted">
                  {i === live ? "Live" : "Static preview"}
                </span>
              </div>
            </Carousel.Slide>
          ))}
        </Carousel.Track>
        <Carousel.Prev />
        <Carousel.Next />
      </Carousel.Viewport>
      <Carousel.Dots />
      <p className="m-0 text-center text-2 text-foreground-muted transition-opacity duration-fast group-data-[settling]:opacity-50">
        Index {index + 1} · settled on {live + 1}
        {last ? ` (${last})` : ""}
      </p>
    </Carousel.Root>
  );
}
