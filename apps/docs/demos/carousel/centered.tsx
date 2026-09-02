"use client";

import { Carousel } from "@forte-ui/react";

const SLIDES = ["Dawn", "Harbour", "Ridge", "Meadow", "Dusk"];

const slide =
  "flex h-[12rem] select-none items-center justify-center rounded-surface bg-primary-soft text-4 font-semibold text-primary-text transition-opacity duration-fast";

export default function CarouselCentered() {
  return (
    <Carousel.Root
      aria-label="Gallery"
      slidesPerView={1.6}
      align="center"
      loop
      className="w-full max-w-lg"
    >
      <Carousel.Viewport>
        <Carousel.Track>
          {SLIDES.map((title) => (
            <Carousel.Slide key={title} className="group">
              <div className={`${slide} opacity-50 group-data-[active]:opacity-100`}>{title}</div>
            </Carousel.Slide>
          ))}
        </Carousel.Track>
        <Carousel.Prev />
        <Carousel.Next />
      </Carousel.Viewport>
      <Carousel.Dots />
    </Carousel.Root>
  );
}
