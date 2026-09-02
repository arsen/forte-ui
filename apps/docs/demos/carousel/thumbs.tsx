"use client";

import { Carousel } from "@forte-ui/react";

const SHOTS = [
  { name: "Front", tone: "bg-primary-soft text-primary-text" },
  { name: "Side", tone: "bg-secondary-soft text-secondary-text" },
  { name: "Back", tone: "bg-panel-hover text-foreground" },
  { name: "Detail", tone: "bg-primary-soft text-primary-text" },
  { name: "Box", tone: "bg-secondary-soft text-secondary-text" },
];

export default function CarouselThumbs() {
  return (
    <Carousel.Root aria-label="Product photos" className="w-full max-w-lg">
      <Carousel.Viewport>
        <Carousel.Track>
          {SHOTS.map((shot) => (
            <Carousel.Slide key={shot.name}>
              <div
                className={`flex h-[14rem] select-none items-center justify-center rounded-surface text-5 font-semibold ${shot.tone}`}
              >
                {shot.name}
              </div>
            </Carousel.Slide>
          ))}
        </Carousel.Track>
      </Carousel.Viewport>
      <Carousel.Thumbs>
        {SHOTS.map((shot) => (
          <Carousel.Thumb key={shot.name} aria-label={shot.name}>
            <div
              className={`flex h-[3.5rem] w-[5rem] items-center justify-center text-1 font-medium ${shot.tone}`}
            >
              {shot.name}
            </div>
          </Carousel.Thumb>
        ))}
      </Carousel.Thumbs>
    </Carousel.Root>
  );
}
