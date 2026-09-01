"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import styles from "./AppBar.module.css";

export type AppBarVariant = "plain" | "panel" | "outline" | "frosted";
export type AppBarTone = "neutral" | "primary" | "secondary";
export type AppBarSize = "sm" | "md" | "lg";
export type AppBarPosition = "static" | "sticky" | "fixed";
export type AppBarTitleAlign = "start" | "center";

/* -------------------------------------------------------------------------
 * Scroll tracking
 *
 * Two facts about the page reach the bar's styles as data attributes, and
 * both are measured rather than computed from a scroll offset:
 *
 *   data-scrolled  the page has moved past the bar's resting position — the
 *                  bar is now over content instead of above it
 *   data-hidden    the last meaningful scroll went down, and the bar is
 *                  further down the page than its own height
 *
 * `data-scrolled` comes from an IntersectionObserver on a 1px sentinel the
 * root renders just before itself. A scroll listener comparing `scrollTop`
 * against the bar's offset would get the same answer, but it has to run on
 * every frame of every scroll to do it and it has to know the bar's `top`
 * offset, which is a CSS knob; the observer fires only when the answer
 * changes and is handed the offset once, as `rootMargin`.
 *
 * The scroller is the nearest ancestor that scrolls, not the window. A bar
 * at the top of a `ScrollArea`, a dialog body or a docs demo scrolls with
 * that box, and a listener on the window would never hear it.
 * ---------------------------------------------------------------------- */

/* Scroll direction has to be sustained for this many pixels before the bar
 * reacts. A trackpad delivers sub-pixel jitter in both directions while a
 * finger rests on it, and a threshold of zero turns that into a bar
 * flickering at the top of the page. */
const HIDE_THRESHOLD = 4;

function getScrollParent(node: HTMLElement): HTMLElement | null {
  let el: HTMLElement | null = node.parentElement;
  while (el && el !== document.body && el !== document.documentElement) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") return el;
    el = el.parentElement;
  }
  return null;
}

function useScrollState(
  headerRef: React.RefObject<HTMLElement | null>,
  sentinelRef: React.RefObject<HTMLDivElement | null>,
  enabled: boolean,
  hideOnScroll: boolean,
) {
  const [scrolled, setScrolled] = React.useState(false);
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    const header = headerRef.current;
    const sentinel = sentinelRef.current;
    if (!enabled || !header || !sentinel) {
      setScrolled(false);
      setHidden(false);
      return;
    }

    const scroller = getScrollParent(header);
    // The sticky offset, read once. A bar pinned below another bar sits
    // `top` pixels down, so the sentinel has to leave through a viewport
    // shrunk by that much or `data-scrolled` would arrive late.
    const top = parseFloat(getComputedStyle(header).top) || 0;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setScrolled(!entry.isIntersecting);
      },
      { root: scroller, rootMargin: `-${top}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(sentinel);

    if (!hideOnScroll) {
      setHidden(false);
      return () => observer.disconnect();
    }

    const target: HTMLElement | Window = scroller ?? window;
    const read = () => (scroller ? scroller.scrollTop : window.scrollY);
    let last = read();

    const onScroll = () => {
      const y = read();
      const dy = y - last;
      last = y;
      // Never hidden while the bar is within its own height of the top: it
      // has nothing to make room for there, and a bar that slides away on
      // the first pixel of a scroll reads as broken. `<= 0` also covers the
      // negative offsets of iOS rubber-banding.
      if (y <= header.offsetHeight) setHidden(false);
      else if (dy > HIDE_THRESHOLD) setHidden(true);
      else if (dy < -HIDE_THRESHOLD) setHidden(false);
    };
    target.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      target.removeEventListener("scroll", onScroll);
    };
  }, [headerRef, sentinelRef, enabled, hideOnScroll]);

  return { scrolled, hidden };
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface AppBarRootProps
  extends Omit<React.ComponentPropsWithoutRef<"header">, "className"> {
  /**
   * How much chrome the bar carries. `plain` is a bare row with no surface;
   * `panel` fills with the panel colour; `outline` sits on the page
   * background with a hairline underneath; `frosted` is `outline` made
   * translucent, with the content behind it blurred.
   *
   * `frosted` is an enhancement in two directions: where `backdrop-filter`
   * is unsupported the bar is simply translucent, and for a reader who has
   * asked the OS to reduce transparency it is opaque.
   * @default "panel"
   */
  variant?: AppBarVariant;
  /**
   * Which colour set the bar draws from. `neutral` is the grey scale;
   * `primary` and `secondary` fill the bar with the accent and re-point the
   * foreground tokens inside it, so the ghost buttons, links and separators
   * you compose into it recolour themselves for contrast.
   * @default "neutral"
   */
  tone?: AppBarTone;
  /**
   * Height of the bar, and the size of its title. Each step is the matching
   * control height plus the bar's padding, so a `size="sm"` bar fits
   * `size="sm"` buttons exactly. The controls inside keep their own `size`
   * prop — this sets the bar, not its contents.
   * @default "md"
   */
  size?: AppBarSize;
  /**
   * How the bar is attached to the page. `static` scrolls away with the
   * content; `sticky` pins to the top of its scroll container once reached
   * and needs no layout compensation; `fixed` leaves the flow entirely, so
   * the content under it must add its own top padding.
   *
   * Every scroll-aware feature — `elevateOnScroll`, `hideOnScroll`, a
   * collapsible section, a title that reveals on scroll — needs the bar to
   * still be on screen when the page moves, so all of them are ignored while
   * `static`.
   * @default "static"
   */
  position?: AppBarPosition;
  /**
   * Start with no surface at all and gain the variant's fill, hairline and a
   * shadow once the page has scrolled under the bar. The Material "on
   * scroll" behaviour: the bar reads as part of the page at the top and as
   * a surface over it everywhere else.
   *
   * `plain` has no surface to reveal, so pair this with another variant.
   * @default false
   */
  elevateOnScroll?: boolean;
  /**
   * Slide the bar out of view while the page scrolls down and back in as
   * soon as it scrolls up. The bar never hides within its own height of the
   * top, and a control inside it that holds focus keeps it on screen.
   * @default false
   */
  hideOnScroll?: boolean;
  /**
   * Replaces the rendered `<header>` with another element or component —
   * `render={<div />}` for a bar that is not the page's banner, such as one
   * heading a panel or a dialog body.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The bar across the top of a screen — a title, what leads it and what
 * follows it, and optionally a second row underneath. Renders a `<header>`.
 *
 * ```tsx
 * <AppBar.Root position="sticky" elevateOnScroll>
 *   <AppBar.Leading>
 *     <Button variant="ghost" iconOnly aria-label="Menu">…</Button>
 *   </AppBar.Leading>
 *   <AppBar.Title>Inbox</AppBar.Title>
 *   <AppBar.Trailing>
 *     <ThemeToggle />
 *     <Avatar.Root>…</Avatar.Root>
 *   </AppBar.Trailing>
 * </AppBar.Root>
 * ```
 *
 * There is no Base UI primitive underneath and no keyboard contract of its
 * own: a header is a landmark, not a widget, and Tab walks its controls one
 * by one the way it walks the rest of the page. For a strip of related
 * controls that should be one tab stop, put a `Toolbar` inside it.
 *
 * What the component owns is the scroll relationship. `position` decides
 * whether the bar stays, and once it stays the bar measures the page rather
 * than the other way round: `data-scrolled` while content is under it,
 * `data-hidden` while a downward scroll has tucked it away. The styles read
 * those two attributes — for the elevation, the hide, a collapsing section
 * and a revealing title — and so can yours.
 *
 * Styling is driven by `data-*` attributes and `--forte-app-bar-*` custom
 * properties, so it can be re-skinned from plain CSS or targeted with
 * Tailwind arbitrary variants (`data-[scrolled]:...`) without wrapping.
 */
export const AppBarRoot = React.forwardRef<HTMLElement, AppBarRootProps>(function AppBarRoot(
  {
    variant = "panel",
    tone = "neutral",
    size = "md",
    position = "static",
    elevateOnScroll = false,
    hideOnScroll = false,
    render,
    className,
    ...props
  },
  ref,
) {
  const headerRef = React.useRef<HTMLElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const tracking = position !== "static";
  const { scrolled, hidden } = useScrollState(headerRef, sentinelRef, tracking, hideOnScroll);

  const element = useRender({
    render,
    ref: [ref, headerRef],
    defaultTagName: "header",
    props: {
      className: clsx(styles.root, className),
      "data-forte": "app-bar",
      "data-variant": variant,
      "data-tone": tone,
      "data-size": size,
      "data-position": position,
      // Spread-when-true rather than `x || undefined`: JSX keeps an
      // `undefined` key out of the DOM either way, but the object form
      // keeps the attribute list readable as the list of states the bar can
      // be in.
      ...(elevateOnScroll && { "data-elevate-on-scroll": true }),
      ...(hideOnScroll && { "data-hide-on-scroll": true }),
      ...(scrolled && { "data-scrolled": true }),
      ...(hidden && { "data-hidden": true }),
      ...props,
    },
  });

  if (!tracking) return element;

  return (
    <>
      {/* The observer's target. A sibling, not a child: inside a sticky bar
        * it would travel with the bar and never leave the viewport. 1px tall
        * with a matching negative margin, so it costs the layout nothing;
        * a zero-height box has no area for the observer to measure. */}
      <div ref={sentinelRef} className={styles.sentinel} data-forte="app-bar-sentinel" aria-hidden="true" />
      {element}
    </>
  );
});

/* -------------------------------------------------------------------------
 * Leading / Trailing
 * ---------------------------------------------------------------------- */

export interface AppBarLeadingProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The start of the bar, before the title: a menu button, a back arrow, the
 * product mark. A flex row with a tight gap, so two icon buttons read as a
 * pair rather than two things that happen to be adjacent.
 *
 * A slot, not a control: whatever goes in it is a real component with its
 * own props. Compose rather than configure.
 */
export const AppBarLeading = React.forwardRef<HTMLDivElement, AppBarLeadingProps>(
  function AppBarLeading({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.leading, className)}
        data-forte="app-bar-leading"
        {...props}
      />
    );
  },
);

export interface AppBarTrailingProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The end of the bar, after the title: the actions, a search field, the
 * theme toggle, the account avatar. Pinned to the inline-end edge whatever
 * the title does, so it sits in the same place on every screen.
 */
export const AppBarTrailing = React.forwardRef<HTMLDivElement, AppBarTrailingProps>(
  function AppBarTrailing({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.trailing, className)}
        data-forte="app-bar-trailing"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Title
 * ---------------------------------------------------------------------- */

export interface AppBarTitleProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Where the title sits in the space between the leading and trailing
   * slots. `center` is the phone convention — the title between a back
   * button and an action — and it is centred in *that* space, so a bar
   * with controls on only one side puts it off the bar's true middle.
   * @default "start"
   */
  align?: AppBarTitleAlign;
  /**
   * Keep the title invisible until the page has scrolled under the bar.
   * This is the small half of the large-title pattern: put the large
   * heading in a collapsible `AppBar.Section`, and this one takes over in
   * the bar as that one folds away.
   *
   * Ignored while `position="static"`, where the bar never learns it has
   * scrolled.
   * @default false
   */
  revealOnScroll?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The bar's name for the screen, one type step above the body. Takes the
 * free space between the leading and trailing slots and truncates rather
 * than wraps, because a bar that grows a second line moves everything
 * under it.
 *
 * It renders a `<div>` because the right heading level is the page's
 * decision — the same bar heads an `h1` screen and an `h2` panel. Nest the
 * heading when the bar genuinely names the document:
 * `<AppBar.Title><h1>Inbox</h1></AppBar.Title>`. A heading placed there
 * takes the bar's typography rather than the UA's.
 */
export const AppBarTitle = React.forwardRef<HTMLDivElement, AppBarTitleProps>(
  function AppBarTitle({ align = "start", revealOnScroll = false, className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.title, className)}
        data-forte="app-bar-title"
        data-align={align}
        {...(revealOnScroll && { "data-reveal-on-scroll": true })}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Section
 * ---------------------------------------------------------------------- */

export interface AppBarSectionProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Fold the section away once the page has scrolled under the bar, and
   * unfold it when the page comes back to the top. The large-title pattern
   * is this prop with a heading inside; a search field or a tab strip that
   * only matters at the top of a screen is the same prop with that inside.
   *
   * Ignored while `position="static"`.
   * @default false
   */
  collapsible?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A second row under the main one, running the full width of the bar: a
 * tab strip, a search field, a breadcrumb, or the large title that
 * collapses into `AppBar.Title` on scroll. Several sections stack in DOM
 * order.
 */
export const AppBarSection = React.forwardRef<HTMLDivElement, AppBarSectionProps>(
  function AppBarSection({ collapsible = false, className, children, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.section, className)}
        data-forte="app-bar-section"
        {...(collapsible && { "data-collapsible": true })}
        {...props}
      >
        {/* The collapse animates `grid-template-rows` to `0fr`, and a grid
          * row can only shrink below its content when the item in it is
          * allowed to — which needs an element to put `min-block-size: 0`
          * on. This is that element. */}
        <div className={styles.sectionInner} data-forte="app-bar-section-inner">
          {children}
        </div>
      </div>
    );
  },
);

/* -------------------------------------------------------------------------
 * Namespace
 * ---------------------------------------------------------------------- */

/**
 * The bar across the top of a screen: what leads it, its title, what
 * follows it, and an optional second row. `Root` renders a `<header>`; the
 * four parts are plain `<div>`s that place themselves in its grid, so any
 * subset of them, in any order, still lays out.
 *
 * There is no state and no keyboard contract of its own. What the component
 * owns is the scroll relationship — `position` decides whether the bar
 * stays, and once it stays the bar reports `data-scrolled` and
 * `data-hidden` for its own styles and yours to read.
 *
 * @summary The bar across the top of a screen — leading controls, a title
 *   and trailing actions, pinned, elevating, hiding or collapsing on scroll;
 *   for a one-tab-stop strip of controls inside it, use Toolbar.
 * @category Navigation
 */
export const AppBar = {
  Root: AppBarRoot,
  Leading: AppBarLeading,
  Title: AppBarTitle,
  Trailing: AppBarTrailing,
  Section: AppBarSection,
};
