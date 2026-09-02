"use client";

import { Carousel } from "@forte-ui/react";

const SLIDES = ["Strategy", "Timeline", "Budget", "Team", "Risks"];

const slide =
  "flex h-[14rem] select-none items-center justify-center rounded-surface bg-primary-soft text-5 font-semibold text-primary-text";

export default function CarouselBasic() {
  return (
    <Carousel.Root aria-label="Project overview" className="w-full max-w-lg">
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
