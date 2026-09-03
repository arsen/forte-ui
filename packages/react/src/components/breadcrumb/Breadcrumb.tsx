"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import { ScrollArea } from "../scroll-area";
import styles from "./Breadcrumb.module.css";

export type BreadcrumbSize = "sm" | "md" | "lg";
export type BreadcrumbVariant = "plain" | "chip";
export type BreadcrumbOverflow = "wrap" | "scroll";

/* -------------------------------------------------------------------------
 * Root context
 *
 * Two things chosen on `Root` are acted on further down. `separator` is
 * inserted by `List` and rendered by `Separator`, neither of which is the
 * other's child in props terms; `overflow` decides whether `List` wraps
 * itself in a `ScrollArea`. Putting both on the root is what keeps the trail
 * from having three props that must be kept in agreement.
 * ---------------------------------------------------------------------- */

const BreadcrumbContext = React.createContext<{
  separator: React.ReactNode;
  overflow: BreadcrumbOverflow;
}>({ separator: undefined, overflow: "wrap" });

/* -------------------------------------------------------------------------
 * Icons
 *
 * Both are decorative and sized in `em`, so they follow `data-size` (and any
 * font-size a consumer sets) without a second scale to keep in step. The
 * chevron is drawn pointing RIGHT and mirrored in RTL from the stylesheet —
 * `scale` is physical and has no logical form, so the flip has to consult
 * `--forte-direction`.
 * ---------------------------------------------------------------------- */

function ChevronIcon(props: React.ComponentProps<"svg">) {
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
      <path d="m6 3.5 4.5 4.5L6 12.5" />
    </svg>
  );
}

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

export interface BreadcrumbRootProps
  extends Omit<React.ComponentPropsWithoutRef<"nav">, "className"> {
  /**
   * Text size, crumb padding and separator size for the whole trail.
   * @default "md"
   */
  size?: BreadcrumbSize;
  /**
   * How loud the crumbs are. `"plain"` is text that underlines on hover.
   * `"chip"` gives every crumb a rounded fill — a hover tint on the links and
   * a resting one on the current page, which is what you want when the trail
   * sits on a busy toolbar rather than above a document.
   * @default "plain"
   */
  variant?: BreadcrumbVariant;
  /**
   * What to draw between crumbs. Any node — a `/`, a `·`, an icon. Set once
   * here and every gap in the trail uses it; a `Breadcrumb.Separator` written
   * by hand with its own children still wins locally.
   * @default a chevron
   */
  separator?: React.ReactNode;
  /**
   * What a trail too long for its container does. `"wrap"` lets it run onto a
   * second line. `"scroll"` keeps it on one line in a horizontal scroller
   * that starts scrolled to the current page — the end of the trail is the
   * part a reader needs, and it is the part that falls off the edge.
   * @default "wrap"
   */
  overflow?: BreadcrumbOverflow;
  /**
   * Replaces the rendered `<nav>` with another element or component — pass
   * `render={<div />}` when the trail sits inside a `<nav>` landmark you
   * already own, so the page does not grow a second one.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The trail container. Renders a `<nav aria-label="Breadcrumb">`.
 *
 * ```tsx
 * <Breadcrumb.Root>
 *   <Breadcrumb.List>
 *     <Breadcrumb.Item>
 *       <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
 *     </Breadcrumb.Item>
 *     <Breadcrumb.Item>
 *       <Breadcrumb.Page>Invoices</Breadcrumb.Page>
 *     </Breadcrumb.Item>
 *   </Breadcrumb.List>
 * </Breadcrumb.Root>
 * ```
 *
 * The label is what tells this landmark apart from the page's other
 * navigation landmarks in a screen reader's landmark list, so it is set by
 * default rather than left to be forgotten. Override it if the page carries
 * more than one trail.
 */
export const BreadcrumbRoot = React.forwardRef<HTMLElement, BreadcrumbRootProps>(
  function BreadcrumbRoot(
    {
      size = "md",
      variant = "plain",
      separator,
      overflow = "wrap",
      render,
      className,
      ...props
    },
    ref,
  ) {
    // Stable across renders unless one of the two actually changes, so a root
    // that sets neither never re-renders its subtree for this.
    const context = React.useMemo(
      () => ({ separator, overflow }),
      [separator, overflow],
    );

    const element = useRender({
      render,
      ref,
      defaultTagName: "nav",
      props: {
        className: clsx(styles.root, className),
        "data-forte": "breadcrumb",
        "data-size": size,
        "data-variant": variant,
        "data-overflow": overflow,
        // Before the spread, so a page carrying two trails can name them
        // apart. Set by default because an unnamed landmark cannot be told
        // from the page's other navigation landmarks in a landmark list, and
        // "remember the aria-label" is not a thing anyone remembers.
        "aria-label": "Breadcrumb",
        ...props,
      },
    });

    return (
      <BreadcrumbContext.Provider value={context}>{element}</BreadcrumbContext.Provider>
    );
  },
);

/* -------------------------------------------------------------------------
 * List
 * ---------------------------------------------------------------------- */

export interface BreadcrumbListProps
  extends Omit<React.ComponentPropsWithoutRef<"ol">, "className"> {
  /**
   * Insert a `Breadcrumb.Separator` between every pair of children. On by
   * default — hand-interleaving separators is the step everyone forgets, and
   * a trail is the one place where the count is always "one fewer than the
   * items". Turning it off leaves the children exactly as written.
   *
   * Writing even one `Breadcrumb.Separator` by hand also turns it off for
   * that list, so the two styles never double up.
   * @default true
   */
  separators?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The `<ol>` holding the crumbs. An ordered list on purpose: the trail's
 * meaning *is* the order, and a screen reader announcing "list, 4 items" tells
 * the reader how deep they are before they walk it.
 *
 * It interleaves the separators itself. `React.Children.toArray` flattens the
 * array a `.map()` produces, so a generated trail gets them too — and `null`
 * children are dropped before the count is taken, which is what keeps a
 * conditionally rendered crumb from leaving a separator pointing at nothing.
 *
 * Under the root's `overflow="scroll"` it also wraps itself in a
 * `ScrollArea` — see the `scroller` note below.
 */
export const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(
  function BreadcrumbList({ separators = true, className, children, ...props }, ref) {
    const { overflow } = React.useContext(BreadcrumbContext);
    const viewportRef = React.useRef<HTMLDivElement | null>(null);

    const items = React.Children.toArray(children);
    const written = items.some(
      (child) => React.isValidElement(child) && child.type === BreadcrumbSeparator,
    );

    const content =
      separators && !written
        ? items.flatMap((child, index) =>
            index === 0
              ? [child]
              : [<BreadcrumbSeparator key={`forte-separator-${index}`} />, child],
          )
        : items;

    // Under `overflow="scroll"` the end of the trail — the current page — is
    // the part that falls off the edge, and a scroller starts at its start.
    // The box that scrolls is the ScrollArea's viewport, not the <ol>, so
    // this reads the ref that is only ever attached on that branch and does
    // nothing on the `wrap` default. Keyed on the crumb count rather than on
    // every render, or a reader who scrolled back to the root crumb would be
    // yanked forward again by the next unrelated re-render.
    React.useEffect(() => {
      const element = viewportRef.current;
      if (!element || element.scrollWidth <= element.clientWidth) return;
      // Browsers put the RTL scroll origin at the inline start, so the far end
      // is a NEGATIVE offset there. Both values overshoot and are clamped.
      const rtl = getComputedStyle(element).direction === "rtl";
      element.scrollLeft = rtl ? -element.scrollWidth : element.scrollWidth;
    }, [content.length]);

    const list = (
      <ol
        ref={ref}
        className={clsx(styles.list, className)}
        data-forte="breadcrumb-list"
        {...props}
      >
        {content}
      </ol>
    );

    if (overflow !== "scroll") return list;

    /* The scroller is a real `ScrollArea`, not an `overflow-x: auto` of our
     * own, for the one thing a bare scroll container cannot do: say that it
     * scrolls. ScrollArea's edge fade is a MASK driven off Base UI's
     * scroll-distance properties, so it opens as the trail moves under it,
     * closes flush at either end, and is correct on any background — the cue
     * a cropped crumb alone does not give. It also brings
     * `overscroll-behavior: contain`, so a sideways swipe at the end does not
     * drag the page, and a viewport Base UI makes focusable only while there
     * is something to scroll.
     *
     * No `ScrollArea.Scrollbar`, deliberately. It overlays the content rather
     * than insetting it, so on a one-line trail it is painted across the
     * bottom of the crumbs — and reserving a strip to keep it off them makes
     * every scrollable trail taller than every other one. The fade is the
     * affordance here, and it is a better one at this size: it is present at
     * rest rather than on hover, and it says which END has more trail on it.
     * Base UI hides the native scrollbars on the viewport itself, so leaving
     * the part out is all it takes.
     *
     * No `data-forte` on these parts either: rule 9 — a composed forte-ui
     * component tags its own root, and consumers scope with a descendant
     * selector. */
    return (
      <ScrollArea.Root className={styles.scroller}>
        <ScrollArea.Viewport ref={viewportRef}>
          {/* Content is sized to its content rather than stretched to the
            * viewport, which is what lets the nowrap row overflow and scroll
            * instead of being clipped. */}
          <ScrollArea.Content>{list}</ScrollArea.Content>
        </ScrollArea.Viewport>
      </ScrollArea.Root>
    );
  },
);

/* -------------------------------------------------------------------------
 * Item
 * ---------------------------------------------------------------------- */

export interface BreadcrumbItemProps
  extends Omit<React.ComponentPropsWithoutRef<"li">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One crumb's `<li>`. Structural — the `Link`, `Page` or `Ellipsis` inside it
 * is what the reader sees.
 */
export const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  function BreadcrumbItem({ className, ...props }, ref) {
    return (
      <li
        ref={ref}
        className={clsx(styles.item, className)}
        data-forte="breadcrumb-item"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Link
 * ---------------------------------------------------------------------- */

export interface BreadcrumbLinkProps
  extends Omit<React.ComponentPropsWithoutRef<"a">, "className"> {
  /**
   * Replaces the rendered `<a>` with another element or component —
   * `render={<Link href="/invoices" />}` is how a framework's router link goes
   * in without losing the crumb's styling and states.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * An ancestor crumb — a real `<a>`, so it opens in a new tab, shows its target
 * in the status bar and is found by every keyboard the platform ships.
 *
 * Children lay out on a flex row, so an icon in front of the label needs no
 * wrapper and rides `currentColor` through rest and hover.
 */
export const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  function BreadcrumbLink({ render, className, ...props }, ref) {
    return useRender({
      render,
      ref,
      defaultTagName: "a",
      props: {
        // `.forte-target` grows the hit box to 24×24 (SC 2.5.8) without moving
        // anything: crumb text is a couple of pixels short of the floor, and
        // padding it out would space the trail apart in the `plain` variant,
        // which has none by design.
        className: clsx(styles.link, "forte-focus-ring", "forte-target", className),
        "data-forte": "breadcrumb-link",
        ...props,
      },
    });
  },
);

/* -------------------------------------------------------------------------
 * Page
 * ---------------------------------------------------------------------- */

export interface BreadcrumbPageProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  /**
   * Replaces the rendered `<span>` with another element or component.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The last crumb: where the reader is. Renders a `<span aria-current="page">`.
 *
 * Deliberately not a link. A link to the page you are already on is a control
 * that does nothing, and the trail's whole job at this position is to say
 * "here" — `aria-current` says it in the accessibility tree, and the weight
 * and color change say it on screen, so the cue is never color alone.
 */
export const BreadcrumbPage = React.forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  function BreadcrumbPage({ render, className, ...props }, ref) {
    return useRender({
      render,
      ref,
      defaultTagName: "span",
      props: {
        className: clsx(styles.page, className),
        "data-forte": "breadcrumb-page",
        "aria-current": "page" as const,
        ...props,
      },
    });
  },
);

/* -------------------------------------------------------------------------
 * Separator
 * ---------------------------------------------------------------------- */

export interface BreadcrumbSeparatorProps
  extends Omit<React.ComponentPropsWithoutRef<"li">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The mark between two crumbs. `Breadcrumb.List` inserts these for you — write
 * one by hand only to give a single gap its own content, which also switches
 * that list to fully manual so the two never double up.
 *
 * Renders an `<li role="presentation" aria-hidden="true">`: it is punctuation,
 * and a screen reader reading "greater than" between every crumb is noise. The
 * `role` also keeps it out of the list's item count, so "list, 4 items" stays
 * the number of crumbs.
 */
export const BreadcrumbSeparator = React.forwardRef<
  HTMLLIElement,
  BreadcrumbSeparatorProps
>(function BreadcrumbSeparator({ className, children, ...props }, ref) {
  const { separator } = React.useContext(BreadcrumbContext);

  return (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={clsx(styles.separator, className)}
      data-forte="breadcrumb-separator"
      {...props}
    >
      {children ?? separator ?? <ChevronIcon className={styles.separatorIcon} />}
    </li>
  );
});

/* -------------------------------------------------------------------------
 * Ellipsis
 * ---------------------------------------------------------------------- */

export interface BreadcrumbEllipsisProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  /**
   * The accessible name, in a visually hidden span. Three dots have no text of
   * their own, so without this the control is announced as "button" and
   * nothing else. Pass `""` in the rare case where `children` is already text
   * that names it, so the name is not said twice.
   * @default "More"
   */
  label?: string;
  /**
   * Replaces the rendered `<span>` with another element or component. Pass
   * `render={<Menu.Trigger />}` to make the collapsed crumbs reachable — see
   * the collapsed example in the docs.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Stands in for the crumbs in the middle of a deep trail. Renders a `<span>`,
 * which is inert — a trail is not the place to hide a page behind something
 * unclickable, so reach for this WITH a menu:
 *
 * ```tsx
 * <Menu.Root>
 *   <Breadcrumb.Ellipsis render={<Menu.Trigger />} label="Show 3 more" />
 *   <Menu.Popup>…</Menu.Popup>
 * </Menu.Root>
 * ```
 *
 * The stylesheet keys its cursor off the rendered element, so the span stays
 * `default` and a `<button>` becomes `pointer` without a prop to pass.
 */
export const BreadcrumbEllipsis = React.forwardRef<
  HTMLSpanElement,
  BreadcrumbEllipsisProps
>(function BreadcrumbEllipsis({ label = "More", render, className, children, ...props }, ref) {
  return useRender({
    render,
    ref,
    defaultTagName: "span",
    props: {
      className: clsx(styles.ellipsis, "forte-focus-ring", "forte-target", className),
      "data-forte": "breadcrumb-ellipsis",
      ...props,
      children: (
        <>
          {children ?? <EllipsisIcon className={styles.ellipsisIcon} />}
          <span className="forte-visually-hidden">{label}</span>
        </>
      ),
    },
  });
});

/**
 * The trail of ancestors above the current page: `Home › Settings › Billing`.
 *
 * ```tsx
 * <Breadcrumb.Root>
 *   <Breadcrumb.List>
 *     <Breadcrumb.Item>
 *       <Breadcrumb.Link href="/">Home</Breadcrumb.Link>
 *     </Breadcrumb.Item>
 *     <Breadcrumb.Item>
 *       <Breadcrumb.Link href="/settings">Settings</Breadcrumb.Link>
 *     </Breadcrumb.Item>
 *     <Breadcrumb.Item>
 *       <Breadcrumb.Page>Billing</Breadcrumb.Page>
 *     </Breadcrumb.Item>
 *   </Breadcrumb.List>
 * </Breadcrumb.Root>
 * ```
 *
 * Separators are inserted by `List`, not written by hand. The last crumb is a
 * `Page`, not a `Link` — a link to where you already are is a control that
 * does nothing.
 *
 * Styling is driven entirely by `data-*` attributes and `--forte-breadcrumb-*`
 * custom properties, so it can be re-skinned from plain CSS or targeted with
 * Tailwind arbitrary variants (`data-[variant=chip]:...`) without wrapping.
 *
 * @summary The trail of ancestors above the current page, with automatic
 *   separators and a collapsible middle for narrow screens.
 * @category Navigation
 */
export const Breadcrumb = {
  Root: BreadcrumbRoot,
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Page: BreadcrumbPage,
  Separator: BreadcrumbSeparator,
  Ellipsis: BreadcrumbEllipsis,
};
