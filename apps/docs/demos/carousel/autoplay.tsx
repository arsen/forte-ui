"use client";

import { Carousel } from "@forte-ui/react";

const QUOTES = [
  { quote: "Shipped the migration a week early.", who: "Platform" },
  { quote: "Zero regressions in the cutover.", who: "Web" },
  { quote: "The dry-run mode paid for itself twice.", who: "Data" },
];

const slide =
  "flex h-[10rem] select-none flex-col items-center justify-center gap-2 rounded-surface bg-panel-hover px-surface text-center";

export default function CarouselAutoplay() {
  return (
    <Carousel.Root aria-label="Team quotes" loop autoplay={4000} className="w-full max-w-lg">
      <Carousel.Viewport>
        <Carousel.Track>
          {QUOTES.map((item) => (
            <Carousel.Slide key={item.who}>
              <figure className={slide}>
                <blockquote className="text-3 text-foreground">“{item.quote}”</blockquote>
                <figcaption className="text-2 text-foreground-muted">— {item.who}</figcaption>
              </figure>
            </Carousel.Slide>
          ))}
        </Carousel.Track>
      </Carousel.Viewport>
      <div className="flex items-center justify-center gap-3">
        <Carousel.PlayPause />
        <Carousel.Dots />
      </div>
    </Carousel.Root>
  );
}
