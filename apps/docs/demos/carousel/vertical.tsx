"use client";

import { Carousel } from "@forte-ui/react";

const HEADLINES = [
  "Q3 results beat forecast",
  "New office opens in Lisbon",
  "Design system reaches 1.0",
  "Hiring: platform engineers",
];

const slide =
  "flex h-full select-none items-center justify-center rounded-surface bg-secondary-soft px-surface text-center text-3 font-medium text-secondary-text";

export default function CarouselVertical() {
  return (
    <Carousel.Root
      aria-label="Headlines"
      orientation="vertical"
      loop
      autoplay
      className="w-full max-w-lg"
    >
      <Carousel.Viewport className="h-[12rem]">
        <Carousel.Track>
          {HEADLINES.map((headline) => (
            <Carousel.Slide key={headline}>
              <div className={slide}>{headline}</div>
            </Carousel.Slide>
          ))}
        </Carousel.Track>
        <Carousel.Prev />
        <Carousel.Next />
      </Carousel.Viewport>
      <div className="flex items-center justify-center gap-3">
        <Carousel.PlayPause />
        <Carousel.Dots orientation="horizontal" />
      </div>
    </Carousel.Root>
  );
}
