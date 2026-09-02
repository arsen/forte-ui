"use client";

import { Carousel } from "@forte-ui/react";

const PRODUCTS = ["Desk", "Chair", "Lamp", "Shelf", "Rug", "Plant", "Clock"];

const slide =
  "flex h-[9rem] select-none items-center justify-center rounded-surface border border-border bg-panel text-3 font-medium text-foreground";

export default function CarouselPerView() {
  return (
    <Carousel.Root aria-label="Products" slidesPerView={2.5} gap={2} className="w-full max-w-lg">
      <Carousel.Viewport>
        <Carousel.Track>
          {PRODUCTS.map((name) => (
            <Carousel.Slide key={name}>
              <div className={slide}>{name}</div>
            </Carousel.Slide>
          ))}
        </Carousel.Track>
      </Carousel.Viewport>
      <div className="flex justify-end gap-2">
        <Carousel.Prev />
        <Carousel.Next />
      </div>
    </Carousel.Root>
  );
}
