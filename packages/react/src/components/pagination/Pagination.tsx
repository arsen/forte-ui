"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import styles from "./Pagination.module.css";

export type PaginationSize = "sm" | "md" | "lg";
export type PaginationVariant = "ghost" | "outline" | "joined";
export type PaginationTone = "primary" | "secondary" | "neutral";

/* -------------------------------------------------------------------------
 * Icons
 *
 * Decorative, and drawn for LTR: the chevrons point the way the reading
 * direction runs, and the stylesheet mirrors them under RTL through
 * `--forte-direction` — `scale` is physical and has no logical form. They
 * are sized from `--forte-pagination-icon-size` like any svg a consumer
 * drops into a control, so a hand-rolled First button lines up with the
 * shipped one.
 * ---------------------------------------------------------------------- */

function chevronIcon(path: string) {
  return function ChevronIcon(props: React.ComponentProps<"svg">) {
    return (
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        {...props}
      >
        <path d={path} />
      </svg>
    );
  };
}

const ChevronLeftIcon = chevronIcon("m10 3.5-4.5 4.5 4.5 4.5");
const ChevronRightIcon = chevronIcon("m6 3.5 4.5 4.5L6 12.5");
const ChevronsLeftIcon = chevronIcon("m8 3.5-4.5 4.5 4.5 4.5M12.5 3.5 8 8l4.5 4.5");
const ChevronsRightIcon = chevronIcon("m8 3.5 4.5 4.5-4.5 4.5M3.5 3.5 8 8l-4.5 4.5");

function EllipsisIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <circle cx="3" cy="8" r="1.4" />
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="13" cy="8" r="1.4" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface PaginationRootProps
  extends Omit<React.ComponentPropsWithoutRef<"nav">, "className"> {
  /**
   * Control height, text size and padding for the whole strip. The actual
   * dimensions also follow the ambient `data-forte-density` setting.
   * @default "md"
   */
  size?: PaginationSize;
  /**
   * How much chrome the pages carry. `"ghost"` is bare numbers that tint on
   * hover, with only the current page filled. `"outline"` boxes every page.
   * `"joined"` fuses the boxes into one strip with shared borders — the look
   * of a segmented control, for a toolbar or a table footer.
   * @default "ghost"
   */
  variant?: PaginationVariant;
  /**
   * Which colour marks the current page. `"primary"` and `"secondary"` are
   * a solid brand fill; `"neutral"` is a quiet grey fill with a stronger
   * border, for a strip that must not compete with the page's real primary
   * action.
   * @default "primary"
   */
  tone?: PaginationTone;
  /**
   * Replaces the rendered `<nav>` with another element or component — pass
   * `render={<div />}` when the strip already sits inside a `<nav>` landmark
   * you own, so the page does not grow a second one.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The strip's container. Renders a `<nav aria-label="Pagination">`.
 *
 * ```tsx
 * <Pagination.Root>
 *   <Pagination.List>
 *     <Pagination.Item>
 *       <Pagination.Previous href="?page=1" />
 *     </Pagination.Item>
 *     <Pagination.Item>
 *       <Pagination.Link href="?page=1">1</Pagination.Link>
 *     </Pagination.Item>
 *     <Pagination.Item>
 *       <Pagination.Link href="?page=2" current>2</Pagination.Link>
 *     </Pagination.Item>
 *     <Pagination.Item>
 *       <Pagination.Next href="?page=3" />
 *     </Pagination.Item>
 *   </Pagination.List>
 * </Pagination.Root>
 * ```
 *
 * The label is what tells this landmark apart from the page's other
 * navigation landmarks in a screen reader's landmark list, so it is set by
 * default rather than left to be forgotten. Override it when a page carries
 * more than one strip — "Search results pages", "Comment pages".
 */
export const PaginationRoot = React.forwardRef<HTMLElement, PaginationRootProps>(
  function PaginationRoot(
    { size = "md", variant = "ghost", tone = "primary", render, className, ...props },
    ref,
  ) {
    return useRender({
      render,
      ref,
      defaultTagName: "nav",
      props: {
        className: clsx(styles.root, className),
        "data-forte": "pagination",
        "data-size": size,
        "data-variant": variant,
        "data-tone": tone,
        // Before the spread, so a page with two strips can name them apart.
        "aria-label": "Pagination",
        ...props,
      },
    });
  },
);

/* -------------------------------------------------------------------------
 * List
 * ---------------------------------------------------------------------- */

export interface PaginationListProps
  extends Omit<React.ComponentPropsWithoutRef<"ul">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/* -------------------------------------------------------------------------
 * The shift
 *
 * A centred window re-labels every slot when the current page moves by one:
 * the cell the reader just pressed reads "27" a frame later and the fill
 * appears one cell to its left. Nothing visibly moves, so the eye reads a
 * glitch rather than "the window scrolled". The list animates what actually
 * happened instead — the numbers slide one cell over, the page that left
 * fades out at the edge and the one that arrived fades in — after a short
 * hold, so the fill is seen landing on the pressed page before anything
 * moves.
 *
 * It is a FLIP over the list's DIRECT children, identified by their React
 * keys: `React.Children.toArray` hands back the keys a `.map()` wrote, in
 * the order the `<li>`s render, so `key={item}` from `usePaginationRange`
 * is all a consumer has to write. A static strip has positional keys and
 * positions that never change, so it never animates. A child that renders
 * more than one element — a Fragment — puts keys and elements out of step;
 * the effect notices the count mismatch and sits that render out.
 *
 * Geometry is measured at runtime, so it cannot live in the stylesheet, and
 * it runs on the Web Animations API rather than an inline `translate` for
 * one reason: an in-flight animation is readable from computed style, which
 * is what lets a second click land mid-slide and continue from where the
 * row visually is instead of snapping back to its layout position first.
 * Every duration and easing is still read from the component's knobs, and
 * `--forte-motion-ok` gates the whole thing — under reduced motion the swap
 * stays instant, exactly as it was.
 * ---------------------------------------------------------------------- */

const SHIFT_ANIMATION_ID = "forte-pagination-shift";

// Guarded the way Alert and Tabs guard theirs: on the server React warns
// about `useLayoutEffect`, and the effect has nothing to measure there.
const useLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

type SlotLayout = {
  /** The slot's own DOM node, kept so a slot that leaves can be cloned. */
  element: HTMLElement;
  /** Layout position relative to the list, with any in-flight shift removed. */
  left: number;
  top: number;
};

function readTime(value: string): number {
  const trimmed = value.trim();
  const number = Number.parseFloat(trimmed);
  if (!Number.isFinite(number)) return 0;
  return trimmed.endsWith("ms") ? number : number * 1000;
}

function readTranslate(value: string): [number, number] {
  if (!value || value === "none") return [0, 0];
  const [x = 0, y = 0] = value.split(" ").map((part) => Number.parseFloat(part) || 0);
  return [x, y];
}

function cancelShift(element: Element) {
  for (const animation of element.getAnimations()) {
    if (animation.id === SHIFT_ANIMATION_ID) animation.cancel();
  }
}

/**
 * The `<ul>` holding the controls. A list, so a screen reader announces how
 * many controls there are before the reader walks them — and so each page
 * is one item, not one word in a run of numbers.
 *
 * It also animates the window's shift when the current page changes: keyed
 * slots slide to their new cell, a slot that left fades out where it was
 * and a slot that arrived fades in — see the note above the implementation.
 * Give each `Pagination.Item` a stable `key` (the page number, or the
 * ellipsis names from `usePaginationRange`) and it happens by itself.
 */
export const PaginationList = React.forwardRef<HTMLUListElement, PaginationListProps>(
  function PaginationList({ className, children, ...props }, ref) {
    const listRef = React.useRef<HTMLUListElement | null>(null);
    const previous = React.useRef<Map<string, SlotLayout> | null>(null);

    // Keys in render order. `toArray` flattens a `.map()`'s array and prefixes
    // the keys it finds, so the strings are stable across renders and unique
    // within the list — a keyless child gets its index, which is fine: it
    // cannot move.
    const keys = React.Children.toArray(children).map((child, index) =>
      React.isValidElement(child) && child.key != null ? String(child.key) : `.${index}`,
    );

    useLayoutEffect(() => {
      const list = listRef.current;
      if (!list) return;

      const slots = Array.from(list.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && !child.hasAttribute("data-forte-ghost"),
      );
      const before = previous.current;

      if (slots.length !== keys.length) {
        // A child rendered more or fewer elements than one: the keys cannot
        // be matched to the boxes, so no animation this render and nothing
        // remembered for the next.
        previous.current = null;
        return;
      }

      const listRect = list.getBoundingClientRect();
      const measured = slots.map((element, index) => {
        const rect = element.getBoundingClientRect();
        // `getBoundingClientRect` includes a running shift; `translate` in
        // computed style is that shift, so subtracting it gives the layout
        // box — and keeping it gives where the slot visually is right now.
        const [tx, ty] = readTranslate(getComputedStyle(element).translate);
        return {
          key: keys[index] as string,
          layout: {
            element,
            left: rect.left - listRect.left - tx,
            top: rect.top - listRect.top - ty,
          },
          tx,
          ty,
        };
      });

      const after = new Map(measured.map((m) => [m.key, m.layout]));
      previous.current = after;
      if (!before) return;

      const style = getComputedStyle(list);
      if (Number.parseFloat(style.getPropertyValue("--forte-motion-ok")) === 0) return;

      const moves: { element: HTMLElement; dx: number; dy: number }[] = [];
      const enters: HTMLElement[] = [];
      for (const { key, layout, tx, ty } of measured) {
        const was = before.get(key);
        if (!was) {
          enters.push(layout.element);
          continue;
        }
        // Where it was drawn a frame ago (its old layout box plus whatever
        // shift was still playing) minus where it now sits: the inverse
        // transform that holds it in place until the slide begins.
        const dx = was.left - layout.left + tx;
        const dy = was.top - layout.top + ty;
        if (dx !== 0 || dy !== 0) moves.push({ element: layout.element, dx, dy });
      }
      const exits = [...before].filter(([key]) => !after.has(key)).map(([, was]) => was);

      if (moves.length === 0 && enters.length === 0 && exits.length === 0) return;

      const options: KeyframeAnimationOptions = {
        id: SHIFT_ANIMATION_ID,
        delay: readTime(style.getPropertyValue("--forte-pagination-shift-delay")),
        duration: readTime(style.getPropertyValue("--forte-pagination-shift-duration")),
        easing: style.getPropertyValue("--forte-pagination-shift-ease").trim() || "ease",
        // The first keyframe applies during the delay: that is the hold.
        fill: "backwards",
      };

      // Everything travels by the same vector — the window scrolled — so a
      // slot that has no old position (it just arrived) or no new one (it
      // just left) borrows the vector from a slot that has both. When no
      // slot moved, arrivals and departures simply cross-fade in place.
      const shift = moves[0] ?? { dx: 0, dy: 0 };

      for (const { element, dx, dy } of moves) {
        cancelShift(element);
        element.animate(
          [{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }],
          options,
        );
      }

      for (const element of enters) {
        cancelShift(element);
        element.animate(
          [
            { translate: `${shift.dx}px ${shift.dy}px`, opacity: 0 },
            { translate: "0px 0px", opacity: 1 },
          ],
          options,
        );
      }

      for (const was of exits) {
        // React has already removed the node, so a clone stands in for it:
        // pinned where the slot used to be, inert and hidden from assistive
        // tech, gone the moment its fade ends — whichever way it ends.
        const ghost = was.element.cloneNode(true) as HTMLElement;
        ghost.setAttribute("data-forte-ghost", "");
        ghost.setAttribute("aria-hidden", "true");
        ghost.inert = true;
        ghost.style.position = "absolute";
        ghost.style.left = `${was.left}px`;
        ghost.style.top = `${was.top}px`;
        ghost.style.margin = "0";
        ghost.style.pointerEvents = "none";
        list.appendChild(ghost);
        const animation = ghost.animate(
          [
            { translate: "0px 0px", opacity: 1 },
            { translate: `${-shift.dx}px ${-shift.dy}px`, opacity: 0 },
          ],
          options,
        );
        const remove = () => ghost.remove();
        animation.finished.then(remove, remove);
      }
    });

    // Ghosts outlive the render that made them, not the list itself.
    React.useEffect(() => {
      const list = listRef.current;
      return () => {
        list?.querySelectorAll("[data-forte-ghost]").forEach((ghost) => ghost.remove());
      };
    }, []);

    return useRender({
      ref: [ref, listRef],
      defaultTagName: "ul",
      props: {
        className: clsx(styles.list, className),
        "data-forte": "pagination-list",
        ...props,
        children,
      },
    });
  },
);

/* -------------------------------------------------------------------------
 * Item
 * ---------------------------------------------------------------------- */

export interface PaginationItemProps
  extends Omit<React.ComponentPropsWithoutRef<"li">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One slot's `<li>`. Structural — the `Link`, `Previous`, `Next` or
 * `Ellipsis` inside it is what the reader sees.
 */
export const PaginationItem = React.forwardRef<HTMLLIElement, PaginationItemProps>(
  function PaginationItem({ className, ...props }, ref) {
    return (
      <li
        ref={ref}
        className={clsx(styles.item, className)}
        data-forte="pagination-item"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Link
 * ---------------------------------------------------------------------- */

export interface PaginationLinkProps
  extends Omit<React.ComponentPropsWithoutRef<"a">, "className"> {
  /**
   * Marks this as the page the reader is on. Sets `aria-current="page"` and
   * draws the tone's fill — the only slot in the strip that carries colour.
   * @default false
   */
  current?: boolean;
  /**
   * Blocks the control. A `<button>` gets the native attribute; an `<a>`
   * keeps its `href` — a router link needs it — and gets `aria-disabled`,
   * leaves the tab order, and swallows its click instead.
   * @default false
   */
  disabled?: boolean;
  /**
   * Replaces the rendered element with another element or component —
   * `render={<Link href="?page=3" />}` is how a framework's router link goes
   * in without losing the control's styling and states. Counts as a link
   * for the element choice below.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One page. Which element it renders follows from what it was given: with
 * an `href` (or a `render`) it is an `<a>`, so a page is a real address that
 * opens in a new tab and is found by every keyboard the platform ships;
 * without one it is a `<button type="button">`, for a strip that pages
 * state in place. Nothing else changes between the two — the same
 * `current`, `disabled` and `onClick` work on both.
 *
 * Children lay out on a flex row and a direct-child `svg` is sized to the
 * strip's icon size, so an icon needs no wrapper.
 */
export const PaginationLink = React.forwardRef<HTMLElement, PaginationLinkProps>(
  function PaginationLink(
    { current = false, disabled = false, href, render, className, onClick, ...props },
    ref,
  ) {
    const isLink = href != null || render != null;

    return useRender({
      render,
      ref,
      defaultTagName: isLink ? "a" : "button",
      props: {
        className: clsx(styles.control, "forte-focus-ring", className),
        "data-forte": "pagination-link",
        "data-current": current || undefined,
        "data-disabled": disabled || undefined,
        "aria-current": current ? ("page" as const) : undefined,
        href,
        ...(isLink
          ? {
              // The href stays — a router `render` carries its own and
              // stripping ours would only work for plain anchors — so the
              // link is taken out of the tab order and its click swallowed
              // below. `aria-disabled` is what a screen reader reads.
              "aria-disabled": disabled || undefined,
              tabIndex: disabled ? -1 : undefined,
            }
          : {
              // `submit` is the default type and a strip inside a filter
              // form would post it on every page change.
              type: "button",
              disabled: disabled || undefined,
            }),
        onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          onClick?.(event);
        },
        ...props,
      },
    });
  },
);

/* -------------------------------------------------------------------------
 * Previous · Next · First · Last
 * ---------------------------------------------------------------------- */

export interface PaginationNavProps extends Omit<PaginationLinkProps, "current"> {
  /**
   * The accessible name when `iconOnly` hides the text, and the visible
   * label otherwise. Override it for another language.
   * @default "Previous" / "Next" / "First" / "Last"
   */
  label?: string;
  /**
   * Show the chevron alone. The label stays in the markup, visually hidden,
   * so the control keeps its name — a bare chevron is announced as "link"
   * and nothing else.
   * @default false
   */
  iconOnly?: boolean;
}

type NavShape = {
  part: "previous" | "next" | "first" | "last";
  label: string;
  Icon: (props: React.ComponentProps<"svg">) => React.ReactElement;
  /** The icon sits after the label on the controls that move forward. */
  iconAfter: boolean;
  /** Set on the anchor form only — `rel` means nothing on a button. */
  rel?: "prev" | "next";
};

function createNavControl(shape: NavShape, displayName: string) {
  const NavControl = React.forwardRef<HTMLElement, PaginationNavProps>(
    function NavControl(
      { label = shape.label, iconOnly = false, className, children, ...props },
      ref,
    ) {
      const isLink = props.href != null || props.render != null;
      const icon = <shape.Icon className={styles.icon} />;
      const text = children ?? label;

      return (
        <PaginationLink
          ref={ref}
          className={clsx(styles.nav, className)}
          data-forte={`pagination-${shape.part}`}
          data-icon-only={iconOnly || undefined}
          rel={isLink ? shape.rel : undefined}
          {...props}
        >
          {shape.iconAfter ? null : icon}
          {iconOnly ? <span className="forte-visually-hidden">{text}</span> : text}
          {shape.iconAfter ? icon : null}
        </PaginationLink>
      );
    },
  );
  NavControl.displayName = displayName;
  return NavControl;
}

/**
 * The step-back control: a chevron and "Previous". Same element rules and
 * props as `Pagination.Link`, plus `rel="prev"` when it renders an anchor,
 * which is the hint search engines read a paginated series from.
 *
 * On the first page, pass `disabled` rather than leaving it out: a control
 * that disappears moves everything after it, and the reader's pointer is
 * resting on the button they just pressed.
 */
export const PaginationPrevious = createNavControl(
  { part: "previous", label: "Previous", Icon: ChevronLeftIcon, iconAfter: false, rel: "prev" },
  "PaginationPrevious",
);

/**
 * The step-forward control: "Next" and a chevron, with `rel="next"` on the
 * anchor form. Disable it on the last page rather than dropping it.
 */
export const PaginationNext = createNavControl(
  { part: "next", label: "Next", Icon: ChevronRightIcon, iconAfter: true, rel: "next" },
  "PaginationNext",
);

/**
 * Jumps to the first page: a double chevron and "First". Usually rendered
 * `iconOnly`, at the outer end of a compact strip.
 */
export const PaginationFirst = createNavControl(
  { part: "first", label: "First", Icon: ChevronsLeftIcon, iconAfter: false },
  "PaginationFirst",
);

/**
 * Jumps to the last page: "Last" and a double chevron.
 */
export const PaginationLast = createNavControl(
  { part: "last", label: "Last", Icon: ChevronsRightIcon, iconAfter: true },
  "PaginationLast",
);

/* -------------------------------------------------------------------------
 * Ellipsis
 * ---------------------------------------------------------------------- */

export interface PaginationEllipsisProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  /**
   * The accessible name, in a visually hidden span. Three dots have no text
   * of their own, so without this the slot is silent — and a reader walking
   * "1, 2, 3, 42" cannot tell that anything was skipped.
   * @default "More pages"
   */
  label?: string;
  /**
   * Replaces the rendered `<span>` with another element or component — a
   * `Menu.Trigger` or a `Popover.Trigger` makes the folded pages reachable
   * without walking to them.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Stands in for the pages folded out of a long strip. Renders an inert
 * `<span>` sized like a page, so the strip keeps its rhythm across the gap.
 *
 * The stylesheet keys its cursor off the rendered element, so the span stays
 * `default` and a `<button>` handed in through `render` becomes `pointer`
 * without a prop to pass.
 */
export const PaginationEllipsis = React.forwardRef<HTMLSpanElement, PaginationEllipsisProps>(
  function PaginationEllipsis(
    { label = "More pages", render, className, children, ...props },
    ref,
  ) {
    return useRender({
      render,
      ref,
      defaultTagName: "span",
      props: {
        className: clsx(styles.ellipsis, "forte-focus-ring", className),
        "data-forte": "pagination-ellipsis",
        ...props,
        children: (
          <>
            {children ?? <EllipsisIcon />}
            <span className="forte-visually-hidden">{label}</span>
          </>
        ),
      },
    });
  },
);

/* ---------------------------------------------------------------------- */

/**
 * Page controls for a long set: previous and next, the page numbers, and an
 * ellipsis where the strip folds.
 *
 * ```tsx
 * <Pagination.Root>
 *   <Pagination.List>
 *     <Pagination.Item>
 *       <Pagination.Previous href="?page=1" />
 *     </Pagination.Item>
 *     <Pagination.Item>
 *       <Pagination.Link href="?page=1">1</Pagination.Link>
 *     </Pagination.Item>
 *     <Pagination.Item>
 *       <Pagination.Link href="?page=2" current>2</Pagination.Link>
 *     </Pagination.Item>
 *     <Pagination.Item>
 *       <Pagination.Ellipsis />
 *     </Pagination.Item>
 *     <Pagination.Item>
 *       <Pagination.Link href="?page=9">9</Pagination.Link>
 *     </Pagination.Item>
 *     <Pagination.Item>
 *       <Pagination.Next href="?page=3" />
 *     </Pagination.Item>
 *   </Pagination.List>
 * </Pagination.Root>
 * ```
 *
 * The parts are markup, not state: `Pagination` never decides which pages
 * to show. `usePaginationRange` does — it turns a page and a count into the
 * list of slots above, with a constant width so the strip never jumps under
 * the pointer.
 *
 * Styling is driven entirely by `data-*` attributes and `--forte-pagination-*`
 * custom properties, so it can be re-skinned from plain CSS or targeted
 * with Tailwind arbitrary variants (`data-[variant=joined]:...`) without
 * wrapping.
 *
 * @summary Page controls for a long set — previous, next, numbered pages
 *   and an ellipsis; for moving through steps of one task use Tabs, and for
 *   a position within a document use Breadcrumb.
 * @category Navigation
 */
export const Pagination = {
  Root: PaginationRoot,
  List: PaginationList,
  Item: PaginationItem,
  Link: PaginationLink,
  Previous: PaginationPrevious,
  Next: PaginationNext,
  First: PaginationFirst,
  Last: PaginationLast,
  Ellipsis: PaginationEllipsis,
};
