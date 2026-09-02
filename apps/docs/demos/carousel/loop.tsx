"use client";

import { Carousel } from "@forte-ui/react";

const SLIDES = ["One", "Two", "Three", "Four"];

const slide =
  "flex h-[12rem] select-none items-center justify-center rounded-surface bg-secondary-soft text-5 font-semibold text-secondary-text";

export default function CarouselLoop() {
  return (
    <Carousel.Root aria-label="Looping slides" loop className="w-full max-w-lg">
      <Carousel.Viewport>
        <Carousel.Track>
          {SLIDES.map((title) => (
            <Carousel.Slide key={title}>
              <div className={slide}>{title}</div>
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
