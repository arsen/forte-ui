"use client";

import * as React from "react";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import { clsx } from "clsx";
import styles from "./ScrollArea.module.css";

export type ScrollAreaScrollbarVisibility = "auto" | "always";
export type ScrollAreaOrientation = "both" | "vertical" | "horizontal";

type BaseRootProps = React.ComponentPropsWithoutRef<typeof BaseScrollArea.Root>;
type BaseViewportProps = React.ComponentPropsWithoutRef<typeof BaseScrollArea.Viewport>;
type BaseContentProps = React.ComponentPropsWithoutRef<typeof BaseScrollArea.Content>;
type BaseScrollbarProps = React.ComponentPropsWithoutRef<typeof BaseScrollArea.Scrollbar>;
type BaseThumbProps = React.ComponentPropsWithoutRef<typeof BaseScrollArea.Thumb>;
type BaseCornerProps = React.ComponentPropsWithoutRef<typeof BaseScrollArea.Corner>;

/**
 * `fade` and `orientation` are chosen on `ScrollArea.Root` but applied on
 * `ScrollArea.Viewport`, and `scrollbarVisibility` is chosen on the root but
 * applied on each `ScrollArea.Scrollbar` — of which there are usually two.
 * Context keeps the consumer-facing API to one prop in the place a reader
 * looks for it, instead of several that have to be kept in agreement, and
 * makes a scroll area whose two scrollbars disagree about when to appear
 * unexpressible.
 */
const ScrollAreaContext = React.createContext<{
  fade: boolean;
  scrollbarVisibility: ScrollAreaScrollbarVisibility;
  orientation: ScrollAreaOrientation;
}>({ fade: true, scrollbarVisibility: "auto", orientation: "both" });

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface ScrollAreaRootProps extends Omit<BaseRootProps, "className"> {
  /**
   * Whether the content fades out towards any edge it can still be scrolled
   * past. The fade is a mask, so it works on any background, and its size
   * tracks the remaining scroll distance — it opens as you scroll away from an
   * edge and is absent while you are resting against one. Dropped
   * automatically under `forced-colors`, `prefers-contrast: more` and
   * `prefers-reduced-transparency`, where the scrollbars carry the cue
   * instead.
   * @default true
   */
  fade?: boolean;
  /**
   * When the scrollbars are shown. `"auto"` overlays them and reveals them
   * while the pointer is anywhere over the scroll area, while it is being
   * scrolled, or while something inside it has keyboard focus; `"always"`
   * leaves them painted. Either way a scrollbar for an axis that does not
   * overflow is not rendered at all.
   * @default "auto"
   */
  scrollbarVisibility?: ScrollAreaScrollbarVisibility;
  /**
   * The axis — or axes — this area scrolls on. Declare it whenever only one
   * axis can ever overflow: under `"both"` the viewport is a scroll container
   * on both axes regardless, so a wheel or trackpad gesture along the axis
   * with nothing to scroll is still claimed by the viewport — the content
   * does not move, the page behind does not scroll either, and macOS paints
   * its rubber-band bounce on a box that has nowhere to go. Naming the axis
   * turns the other one off entirely, so that gesture falls through to the
   * page — which is what a vertical scroll over a horizontal tab strip is
   * almost always asking for.
   * @default "both"
   */
  orientation?: ScrollAreaOrientation;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Groups the viewport, the scrollbars and the corner.
 *
 * Give it the size the scroll area should occupy — a `height`, a `max-height`,
 * or a track in whatever layout it sits in. It is a grid with a single
 * `minmax(0, 1fr)` cell, so the viewport stays content-sized until the root is
 * constrained and fills it exactly once it is; a scroll area with no height
 * anywhere on it simply grows and never scrolls.
 */
const ScrollAreaRoot = React.forwardRef<HTMLDivElement, ScrollAreaRootProps>(
  function ScrollAreaRoot(
    {
      fade = true,
      scrollbarVisibility = "auto",
      orientation = "both",
      className,
      children,
      ...props
    },
    ref,
  ) {
    const context = React.useMemo(
      () => ({ fade, scrollbarVisibility, orientation }),
      [fade, scrollbarVisibility, orientation],
    );

    return (
      <ScrollAreaContext.Provider value={context}>
        <BaseScrollArea.Root
          ref={ref}
          className={clsx(styles.root, className)}
          data-forte="scroll-area"
          data-orientation={orientation}
          {...props}
        >
          {children}
        </BaseScrollArea.Root>
      </ScrollAreaContext.Provider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Viewport
 * ---------------------------------------------------------------------- */

export interface ScrollAreaViewportProps extends Omit<BaseViewportProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The scrolling box. Base UI gives it `tabIndex={0}` whenever it can actually
 * scroll, so a keyboard user can reach the content and page through it with
 * the arrow keys — and drops it back to `-1` when the content fits, so a
 * non-scrollable region does not become a dead tab stop.
 *
 * Name it. A scrollable region is announced as a group with no name of its
 * own, so pass `aria-label` (or `aria-labelledby` pointing at the heading it
 * belongs to) whenever the surrounding content does not already make it
 * obvious what is being scrolled.
 */
const ScrollAreaViewport = React.forwardRef<HTMLDivElement, ScrollAreaViewportProps>(
  function ScrollAreaViewport({ className, style, children, ...props }, ref) {
    const { fade, orientation } = React.useContext(ScrollAreaContext);

    // Base UI hardcodes `overflow: scroll` as an inline style on the viewport,
    // so no stylesheet rule can switch an axis off — inline beats every layer,
    // and `!important` is banned here. Its prop merging is rightmost-wins on
    // `style`, which makes this the one sanctioned way through: the longhand
    // lands after the primitive's shorthand, and the consumer's own `style`
    // after both.
    const axisStyle =
      orientation === "horizontal"
        ? ({ overflowY: "hidden" } as const)
        : orientation === "vertical"
          ? ({ overflowX: "hidden" } as const)
          : undefined;

    return (
      <BaseScrollArea.Viewport
        ref={ref}
        className={clsx(styles.viewport, className)}
        data-forte="scroll-area-viewport"
        // Presence, not a value: the stylesheet asks `[data-fade]`, and an
        // absent attribute is what turns the mask off. `data-fade="false"`
        // would still match.
        data-fade={fade ? "" : undefined}
        data-orientation={orientation}
        style={axisStyle ? { ...axisStyle, ...style } : style}
        {...props}
      >
        {children}
      </BaseScrollArea.Viewport>
    );
  },
);

/* -------------------------------------------------------------------------
 * Content
 * ---------------------------------------------------------------------- */

export interface ScrollAreaContentProps extends Omit<BaseContentProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Wraps everything inside the viewport, and is what makes horizontal scrolling
 * work: it is sized to its content rather than stretched to the viewport, so a
 * row that cannot shrink — tabs, cards, a wide table — overflows and scrolls
 * instead of being clipped, while content that can shrink still wraps normally
 * and scrolls only vertically.
 *
 * Optional for a purely vertical scroll area, and harmless there.
 */
const ScrollAreaContent = React.forwardRef<HTMLDivElement, ScrollAreaContentProps>(
  function ScrollAreaContent({ className, children, ...props }, ref) {
    return (
      <BaseScrollArea.Content ref={ref} className={clsx(styles.content, className)} data-forte="scroll-area-content" {...props}>
        {children}
      </BaseScrollArea.Content>
    );
  },
);

/* -------------------------------------------------------------------------
 * Scrollbar
 * ---------------------------------------------------------------------- */

export interface ScrollAreaScrollbarProps extends Omit<BaseScrollbarProps, "className"> {
  /**
   * Which axis this scrollbar controls. Render one for each axis that can
   * overflow; render both, plus `ScrollArea.Corner`, when either might.
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal";
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One scrollbar track, containing a `ScrollArea.Thumb`.
 *
 * It overlays the content rather than insetting it, so showing or hiding it
 * never reflows what is being scrolled. Base UI removes it from the DOM
 * entirely while its axis does not overflow — pass `keepMounted` if you need
 * to style or measure it in that state.
 */
const ScrollAreaScrollbar = React.forwardRef<HTMLDivElement, ScrollAreaScrollbarProps>(
  function ScrollAreaScrollbar({ orientation = "vertical", className, children, ...props }, ref) {
    const { scrollbarVisibility } = React.useContext(ScrollAreaContext);

    return (
      <BaseScrollArea.Scrollbar
        ref={ref}
        className={clsx(styles.scrollbar, className)}
        data-forte="scroll-area-scrollbar"
        orientation={orientation}
        data-visibility={scrollbarVisibility}
        {...props}
      >
        {children}
      </BaseScrollArea.Scrollbar>
    );
  },
);

/* -------------------------------------------------------------------------
 * Thumb
 * ---------------------------------------------------------------------- */

export interface ScrollAreaThumbProps extends Omit<BaseThumbProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The draggable part of a scrollbar. Renders inside `ScrollArea.Scrollbar`,
 * which is also what sizes it: Base UI measures the track — its padding
 * included — and publishes the result as an inline `height` or `width`.
 */
const ScrollAreaThumb = React.forwardRef<HTMLDivElement, ScrollAreaThumbProps>(
  function ScrollAreaThumb({ className, ...props }, ref) {
    return <BaseScrollArea.Thumb ref={ref} className={clsx(styles.thumb, className)} data-forte="scroll-area-thumb" {...props} />;
  },
);

/* -------------------------------------------------------------------------
 * Corner
 * ---------------------------------------------------------------------- */

export interface ScrollAreaCornerProps extends Omit<BaseCornerProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The square where the two scrollbars would otherwise cross. Render it
 * whenever both scrollbars are rendered — Base UI sizes each track to stop
 * short of it, and mounts the corner only while both are visible, so it costs
 * nothing on a scroll area that turns out to need only one axis.
 */
const ScrollAreaCorner = React.forwardRef<HTMLDivElement, ScrollAreaCornerProps>(
  function ScrollAreaCorner({ className, ...props }, ref) {
    return <BaseScrollArea.Corner ref={ref} className={clsx(styles.corner, className)} data-forte="scroll-area-corner" {...props} />;
  },
);

/**
 * A scroll container with overlay scrollbars and a gradient edge fade, built
 * on Base UI's unstyled `ScrollArea` primitive.
 *
 * ```tsx
 * <ScrollArea.Root style={{ maxHeight: "16rem" }}>
 *   <ScrollArea.Viewport aria-label="Release notes">
 *     <ScrollArea.Content>…</ScrollArea.Content>
 *   </ScrollArea.Viewport>
 *   <ScrollArea.Scrollbar orientation="vertical">
 *     <ScrollArea.Thumb />
 *   </ScrollArea.Scrollbar>
 *   <ScrollArea.Scrollbar orientation="horizontal">
 *     <ScrollArea.Thumb />
 *   </ScrollArea.Scrollbar>
 *   <ScrollArea.Corner />
 * </ScrollArea.Root>
 * ```
 *
 * The native scrollbars are hidden and replaced, so they look the same on
 * every platform; the viewport still scrolls with the wheel, touch, and the
 * keyboard, because it is still a real scroll container.
 *
 * The fade is pure CSS: Base UI publishes the distance from each edge on the
 * viewport as a custom property, and the stylesheet turns those into a mask.
 * Nothing runs per frame and no animation library is involved.
 */
export const ScrollArea = {
  Root: ScrollAreaRoot,
  Viewport: ScrollAreaViewport,
  Content: ScrollAreaContent,
  Scrollbar: ScrollAreaScrollbar,
  Thumb: ScrollAreaThumb,
  Corner: ScrollAreaCorner,
};
