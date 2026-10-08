"use client";

import * as React from "react";
import { clsx } from "clsx";
import { pinToDocumentClock } from "../../internal/document-clock";
import styles from "./Shimmer.module.css";

/**
 * `useLayoutEffect`, except on the server, where React warns that it does
 * nothing. The loop has to be pinned before the browser paints the sweep, or
 * one frame shows it at its restart.
 */
const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

export interface ShimmerProps extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  /**
   * Whether the highlight is sweeping. `false` renders the children as
   * ordinary text — same element, same layout, nothing else changes — so a
   * label can go from "Generating…" to its finished state by flipping one
   * flag rather than swapping components.
   * @default true
   */
  active?: boolean;
  /**
   * Sweep once and stop, instead of looping. For a line that has just
   * arrived — a new message, a freshly saved title — where a single pass says
   * "look here" and a loop would say "still waiting".
   * @default false
   */
  once?: boolean;
  /**
   * Sweep against the reading direction. The default follows `dir`: left to
   * right in LTR, right to left in RTL, without being told.
   * @default false
   */
  reverse?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A band of light sweeping through a run of text.
 *
 * It is the wait indicator for text that is itself the message — "Generating
 * response…", "Thinking", a title still being written — where a `Spinner`
 * beside the words would say the same thing twice. The text stays real text:
 * selectable, read by a screen reader as written, the color it inherited.
 * Only the paint changes, and only while `active`.
 *
 * ```tsx
 * <Shimmer>Generating response…</Shimmer>
 * <Shimmer once className="text-4 font-semibold">Saved</Shimmer>
 * <Shimmer active={pending}>{pending ? "Thinking…" : "Done"}</Shimmer>
 * ```
 *
 * Under reduced motion the band does not travel and is not drawn; the text is
 * simply its own color. That is a deliberate departure from `Skeleton`, whose
 * shimmer degrades into a pulse: here the text is the content, and dimming it
 * on a loop would trade the reader's contrast for a cue the words already
 * carry. Styling is driven by `data-*` attributes and `--forte-shimmer-*`
 * custom properties, so it can be re-skinned from plain CSS or Tailwind
 * arbitrary variants (`data-[active]:...`) without wrapping.
 *
 * @summary An animated highlight sweeping through text that is itself the
 *   status message; for a placeholder standing in for content, use Skeleton.
 * @category Feedback
 */
export const Shimmer = React.forwardRef<HTMLSpanElement, ShimmerProps>(function Shimmer(
  { active = true, once = false, reverse = false, className, children, ...props },
  ref,
) {
  const rootRef = React.useRef<HTMLSpanElement | null>(null);
  const setRefs = React.useCallback(
    (node: HTMLSpanElement | null) => {
      rootRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  // A looping sweep runs on the page's clock, so a "Thinking…" line replaced
  // by an identical one carries on instead of jumping back to the edge. See
  // `document-clock.ts`. `once` is left alone, and must be: a single pass
  // pinned to the document's time zero would be over before it was painted.
  // Either dependency can hand the effect a loop it has not seen: `active`
  // adds the animation, and `once` going false turns a finished pass back
  // into a loop.
  useIsoLayoutEffect(() => {
    if (rootRef.current && active && !once) pinToDocumentClock(rootRef.current);
  }, [active, once]);

  return (
    <span
      ref={setRefs}
      className={clsx(styles.root, className)}
      data-forte="shimmer"
      data-active={active || undefined}
      data-once={once || undefined}
      data-reverse={reverse || undefined}
      {...props}
    >
      {children}
    </span>
  );
});
