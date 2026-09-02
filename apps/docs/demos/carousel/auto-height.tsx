"use client";

import { Carousel } from "@forte-ui/react";

const NOTES = [
  "A short note.",
  "A longer note that runs to a second line, and then a third, so this slide is noticeably taller than the one before it — and the viewport grows to fit it instead of leaving the short one floating in a gap.",
  "Two lines this time: enough to be taller than the first slide, shorter than the second.",
];

const slide = "rounded-surface bg-panel-hover p-surface text-2 leading-normal text-foreground";

export default function CarouselAutoHeight() {
  return (
    <Carousel.Root aria-label="Release notes" autoHeight className="w-full max-w-lg">
      <Carousel.Viewport>
        <Carousel.Track>
          {NOTES.map((note, i) => (
            <Carousel.Slide key={i}>
              <div className={slide}>{note}</div>
            </Carousel.Slide>
          ))}
        </Carousel.Track>
      </Carousel.Viewport>
      <div className="flex items-center justify-between">
        <Carousel.Prev />
        <Carousel.Dots />
        <Carousel.Next />
      </div>
    </Carousel.Root>
  );
}
