"use client";

import * as React from "react";
import { Carousel } from "@forte-ui/react";

const COUNT = 12;

const slide =
  "flex h-[10rem] select-none flex-col items-center justify-center gap-1 rounded-surface bg-primary-soft text-primary-text";

/* Renders only while its slide is mounted, so the counter is a live count of
 * mounted slides — and each one remembers when it first rendered. */
function Content({
  n,
  onMount,
}: {
  n: number;
  onMount: (delta: 1 | -1) => void;
}) {
  // Set after mount, not during render: the first slide is server-rendered,
  // and a clock read there would not match the one read on the client.
  const [at, setAt] = React.useState<string | null>(null);
  React.useEffect(() => {
    setAt(new Date().toLocaleTimeString());
    onMount(1);
    return () => onMount(-1);
  }, [onMount]);
  return (
    <div className={slide}>
      <span className="text-5 font-semibold">{n}</span>
      <span className="text-1 text-foreground-muted">{at ? `mounted at ${at}` : "mounting…"}</span>
    </div>
  );
}

export default function CarouselLazy() {
  const [mounted, setMounted] = React.useState(0);
  const onMount = React.useCallback((delta: 1 | -1) => setMounted((m) => m + delta), []);

  return (
    <Carousel.Root aria-label="Lazy slides" lazy className="w-full max-w-lg">
      <Carousel.Viewport>
        <Carousel.Track>
          {Array.from({ length: COUNT }, (_, i) => (
            <Carousel.Slide key={i}>
              <Content n={i + 1} onMount={onMount} />
            </Carousel.Slide>
          ))}
        </Carousel.Track>
        <Carousel.Prev />
        <Carousel.Next />
      </Carousel.Viewport>
      <p className="m-0 text-center text-2 text-foreground-muted">
        {mounted} of {COUNT} slides mounted
      </p>
    </Carousel.Root>
  );
}
