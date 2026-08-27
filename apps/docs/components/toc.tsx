"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { EYEBROW, NAV_LINK, NAV_LINK_ACTIVE, STICKY_COLUMN } from "./styles";

/**
 * The "On this page" rail — the right-hand column of the shell.
 *
 * ---------------------------------------------------------------------------
 * Why it reads the DOM instead of the MDX export
 * ---------------------------------------------------------------------------
 * `@stefanprobst/rehype-extract-toc/mdx` already puts a `tableOfContents`
 * export on every `page.mdx`, and using it would be the obvious move — except
 * that this column is rendered by the ROOT layout, and a layout cannot see its
 * child page's module exports. The alternatives are worse: a `<Toc />` call
 * hand-added to twenty-one MDX files (which the twenty-second will forget), or
 * a second registry keyed by route (which will drift the first time a heading
 * is renamed).
 *
 * Reading the rendered headings has none of those failure modes and one real
 * advantage: it also covers pages MDX never touched — the Theme Studio's
 * hand-written JSX included — and headings a client component mounts after
 * hydration, which the build-time export cannot know about.
 *
 * The ids themselves are not invented here. `rehype-slug` puts them on the MDX
 * headings, and that is the same id the anchor link in the URL uses, so the
 * rail and a copied #fragment can never disagree.
 */

type Heading = { id: string; text: string; depth: 2 | 3 };

/* h1 is the page title — it is not a section of the page, and listing it would
 * put a row in the rail that is always "current" the moment you are at the top.
 * h4 exists on a couple of pages and is detail inside a section, not a stop. */
const HEADINGS = "h2[id], h3[id]";

/** Identity for a heading set, so a MutationObserver firing on every demo that
 *  mounts does not re-render the rail unless the headings actually changed. */
const signature = (headings: Heading[]) =>
  headings.map((h) => `${h.depth}:${h.id}`).join("|");

function collect(main: HTMLElement): Heading[] {
  return Array.from(main.querySelectorAll<HTMLElement>(HEADINGS)).map((el) => ({
    id: el.id,
    text: el.textContent ?? "",
    depth: el.tagName === "H2" ? 2 : 3,
  }));
}

/** Half of the line a heading comes to rest on after a #fragment jump. */
const scrollPad = () =>
  parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;

/**
 * The line a heading comes to rest on: the root's scroll-padding plus the
 * heading's own `scroll-margin-top`. The two ADD, and on this site both are
 * `--spacing-anchor`, so a heading parks 160px down and not the 80px either
 * value suggests on its own. Both are read rather than restated — a rail that
 * disagrees with where the browser stops highlights the section above the one
 * under the reader's eye, and the animated jump below would scroll to a line
 * the browser never uses.
 */
const anchorLine = (el: HTMLElement, pad = scrollPad()) =>
  pad + (parseFloat(getComputedStyle(el).scrollMarginTop) || 0);

/** A duration token in milliseconds. The tokens are authored in `ms`, but `s`
 *  is legal CSS and computes as written, so both are read. */
const durationMs = (name: string) => {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const value = parseFloat(raw);
  if (!Number.isFinite(value)) return 0;
  return raw.endsWith("ms") ? value : value * 1000;
};

/* Milliseconds per pixel travelled, held between the two duration tokens. At
 * this rate a hop to the next heading lands on the `fast` floor and only a
 * jump across most of the page reaches `slow`. */
const MS_PER_PX = 0.25;

/* Ease-out, the shape of `--pui-ease-standard`: leaves quickly, settles. It is
 * written out instead of read from the token because a scroll offset is not a
 * CSS property — there is nothing to hand a CSS easing to, and parsing
 * `cubic-bezier()` only to re-solve it here is more machinery than the
 * difference is worth. */
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/* Input that would normally scroll cancels the animation where it stands, the
 * way the browser's own smooth scroll yields to a wheel. A scroll you cannot
 * escape is worse than a slow one. */
const SCROLL_KEYS = new Set([
  "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", "Tab", " ",
]);

/**
 * Scroll to a heading on a duration that scales with the distance.
 *
 * `scroll-behavior: smooth` will not be hurried — its duration is the
 * browser's to choose, and Blink spends most of a near-fixed budget however
 * far it is going. That is why the SHORTEST hops, one heading to the next,
 * are the ones that feel slowest: the same half-second buys 200px. Driving
 * the scroll here buys back the one thing that matters, and nothing else.
 *
 * `behavior: "instant"` on every call below is load-bearing. `"auto"` means
 * "consult `scroll-behavior`", and the root element carries `scroll-smooth`,
 * so each frame would kick off a second smooth scroll of its own and the two
 * would fight.
 */
function scrollToHeading(el: HTMLElement) {
  const doc = document.documentElement;
  const from = window.scrollY;

  /* Clamped, because the last section usually cannot reach the line — asking
   * for more scroll than the page has would leave the animation short of its
   * own target, forever a few pixels from where it said it was going. */
  const to = Math.max(
    0,
    Math.min(
      el.getBoundingClientRect().top + from - anchorLine(el),
      doc.scrollHeight - window.innerHeight,
    ),
  );
  const distance = to - from;

  /* The library's answer for scrolling under reduced motion is not a shorter
   * animation but no animation: `a11y.css` forces `scroll-behavior: auto` on
   * html, body and `.pui-scroll`. Reading `--pui-motion-ok` rather than
   * matchMedia matches that through the in-page control too, which sets
   * `data-pui-motion` and never touches the media query. */
  const motionOk = parseFloat(getComputedStyle(doc).getPropertyValue("--pui-motion-ok"));
  if (motionOk !== 1 || Math.abs(distance) < 1) {
    window.scrollTo({ top: to, behavior: "instant" });
    return;
  }

  const duration = Math.min(
    durationMs("--pui-duration-slow"),
    Math.max(durationMs("--pui-duration-fast"), Math.abs(distance) * MS_PER_PX),
  );

  const start = performance.now();
  let frame = 0;

  const stop = () => {
    if (frame !== 0) cancelAnimationFrame(frame);
    frame = 0;
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("keydown", onKey);
  };
  const onKey = (event: KeyboardEvent) => {
    if (SCROLL_KEYS.has(event.key)) stop();
  };

  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
  window.addEventListener("keydown", onKey);

  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    window.scrollTo({ top: from + distance * easeOut(t), behavior: "instant" });
    if (t < 1) frame = requestAnimationFrame(step);
    else stop();
  };
  frame = requestAnimationFrame(step);
}

export function Toc() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState<string | null>(null);

  /* Collect on navigation, then keep watching. The watch is not belt-and-braces:
   * `DemoBlock` and the Theme Studio mount after hydration, so a one-shot read
   * on mount would miss any heading rendered by a client component. */
  useEffect(() => {
    const main = document.getElementById("main");
    if (!main) return;

    const sync = () =>
      setHeadings((prev) => {
        const next = collect(main);
        return signature(prev) === signature(next) ? prev : next;
      });

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(main, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [pathname]);

  /* Which heading is "current".
   *
   * Deliberately a scroll read rather than an IntersectionObserver: the
   * observer answers "which headings are on screen", and the honest answer is
   * regularly "none of them" — a section longer than the viewport scrolls its
   * heading away and leaves the rail with nothing to highlight. Comparing
   * positions against a single line always has an answer. */
  useEffect(() => {
    if (headings.length === 0) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      const doc = document.documentElement;

      /* Hoisted: `anchorLine` reads the root's scroll-padding itself, and
       * doing that once per heading per frame is a style read the loop below
       * does not need. */
      const pad = scrollPad();

      /* The last section usually cannot reach the line — there is not enough
       * page left below it to scroll — so at the bottom it is current by
       * definition. Without this the rail sticks on the second-to-last entry. */
      const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2;

      if (atBottom) {
        setActive(headings[headings.length - 1].id);
        return;
      }

      /* Null until the first heading has crossed the line, which is honest:
       * the standfirst above `## Import` belongs to no section, and marking
       * the first entry current there tells the reader they are somewhere
       * they have not reached yet. */
      let current: string | null = null;
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (!el) continue;
        const line = anchorLine(el, pad);
        /* The +1 absorbs sub-pixel scroll positions — a heading parked at
         * 159.5px is at the line, and without the slack the rail flickers to
         * the previous section on a fractional-DPI display. */
        if (el.getBoundingClientRect().top <= line + 1) current = heading.id;
      }
      setActive(current);
    };

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    /* Every heading below a demo moves when that demo changes height, and no
     * scroll event says so: switching a demo to its Code tab, opening a
     * Collapsible, or a font landing late all resize the page under a
     * stationary reader. Without this the highlight is simply wrong until the
     * next scroll — most visibly at the foot of the page, where the last
     * section stops being "at the bottom" the moment the content grows. */
    const resize = new ResizeObserver(schedule);
    resize.observe(document.body);

    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
    };
  }, [headings]);

  /* One entry is not a table of contents, it is a link to where you already
   * are. The grid track is a fixed width, so dropping out here leaves the
   * centre column exactly where it was on every other page. */
  if (headings.length < 2) return null;

  return (
    <nav aria-labelledby="toc-label" className={cn(STICKY_COLUMN, "max-toc:hidden")}>
      <p className={cn(EYEBROW, "mt-0 mb-2 px-2")} id="toc-label">
        On this page
      </p>
      {/* No Preflight on this site, so the UA marker and padding are still
        * there and have to be removed by hand. */}
      <ul className="m-0 list-none p-0">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              className={cn(
                NAV_LINK,
                /* Indented and a step down, so the shape of the page is
                 * legible without reading a single word of it. */
                heading.depth === 3 && "ps-5 text-1",
                heading.id === active && cn(NAV_LINK_ACTIVE, "font-medium"),
              )}
              /* `aria-current="location"` rather than `"page"`: the sidebar
                * already owns which PAGE you are on, and two elements claiming
                * `page` in one document is a contradiction a screen reader
                * reads out. */
              aria-current={heading.id === active ? "location" : undefined}
              href={`#${heading.id}`}
              onClick={(event) => {
                /* Leave the browser the clicks it does better: a new tab, a
                 * new window, a saved link. */
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                const target = document.getElementById(heading.id);
                if (!target) return;
                event.preventDefault();
                scrollToHeading(target);

                /* preventDefault dropped three things the browser did for
                 * free, and they are most of what a #fragment is for: the URL
                 * worth copying, the history entry Back returns through, and
                 * the focus position — without which a keyboard user is sent
                 * to a section and then tabs on from the rail they left.
                 * `preventScroll` stops the focus call undoing the animation
                 * it was made for. */
                history.pushState(null, "", `#${heading.id}`);
                target.tabIndex = -1;
                target.focus({ preventScroll: true });
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
