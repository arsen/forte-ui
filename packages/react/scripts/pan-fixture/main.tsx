/*
 * The page check-pan.mjs loads: ONE carousel inside ONE scroller that scrolls
 * both ways, which is the issue-167 layout reduced to its mechanism — a
 * carousel turned only by its arrows, in a row of cards that scrolls
 * sideways. One per page, so a pan the scroller took or did not take can
 * only be this carousel's doing.
 *
 * The scroller's content is three viewports by three, and it starts scrolled
 * to the middle, so a swipe either way has room to scroll it. The carousel
 * sits in the visible middle cell starting on its second slide, so a drag
 * either way has a slide to go to. Its slides are square, 240px each way,
 * so the gate's one swipe length is past half a slide on both axes: the
 * synthesized gesture holds still before it lifts, so there is no fling, and
 * a drag short of half a slide rightly settles back where it started.
 *
 * `[data-fixture-outside]` is a plain block under it: the control a swipe
 * starts on to prove the scroller scrolls at all, without which every "the
 * carousel let it through" case could pass on a scroller that never moves.
 *
 * Driven by the query string so the script can walk the cases without a
 * build per case:
 *
 *   orientation  horizontal | vertical   (default horizontal)
 *   draggable    0 → `draggable={false}`  (default true)
 *   slides       how many slides         (default 3)
 *
 * The real component from src, through Vite's CSS Modules, with the real
 * theme — a hand-written copy of the markup would test the copy.
 */
import { useLayoutEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles/theme.css";
import { Carousel, type CarouselOrientation } from "../../src/components/carousel";

const params = new URLSearchParams(location.search);
const orientation = (params.get("orientation") ?? "horizontal") as CarouselOrientation;
const draggable = params.get("draggable") !== "0";
const slides = Number(params.get("slides") ?? 3);

function Fixture() {
  const scroller = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = scroller.current!;
    el.scrollLeft = el.clientWidth;
    el.scrollTop = el.clientHeight;
  }, []);

  return (
    <div
      ref={scroller}
      data-fixture-scroller=""
      style={{ position: "fixed", inset: 0, overflow: "auto" }}
    >
      <div style={{ position: "relative", inlineSize: "300vw", blockSize: "300vh" }}>
        <div
          style={{
            position: "absolute",
            insetInlineStart: "calc(100vw + 16px)",
            insetBlockStart: "calc(100vh + 16px)",
            inlineSize: "240px",
          }}
        >
          <Carousel.Root
            aria-label="Pages"
            orientation={orientation}
            draggable={draggable}
            defaultIndex={Math.min(1, slides - 1)}
          >
            <Carousel.Viewport style={{ blockSize: "240px" }}>
              <Carousel.Track>
                {Array.from({ length: slides }, (_, i) => (
                  <Carousel.Slide key={i}>
                    <div style={{ blockSize: "240px", background: "var(--forte-color-panel-hover)" }}>
                      Page {i + 1}
                    </div>
                  </Carousel.Slide>
                ))}
              </Carousel.Track>
            </Carousel.Viewport>
          </Carousel.Root>
          <div data-fixture-outside="" style={{ blockSize: "240px", marginBlockStart: "16px" }}>
            Card text
          </div>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<Fixture />);
