"use client";

import * as React from "react";
import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";
import { clsx } from "clsx";
import styles from "./NavigationMenu.module.css";

/**
 * How loud a row is — the library's usual `variant` axis, applied to the two
 * parts that can appear in either place.
 *
 * `plain` is the bar row: a control-height strip of text with an optional
 * chevron, which is what a `Trigger` is in the top-level list and what a
 * `Link` becomes when it sits beside those triggers and navigates straight
 * out.
 *
 * `card` is the block used inside a panel: a padded target holding a
 * `LinkTitle` and a `LinkDescription`, which is what a `Link` is by default
 * and what a `Trigger` becomes when it opens a nested menu from inside one.
 */
export type NavigationMenuVariant = "plain" | "card";

/** How many columns a `Content` panel lays its children out in. */
export type NavigationMenuColumns = 1 | 2 | 3;

/* -------------------------------------------------------------------------
 * Orientation context
 *
 * Base UI takes `orientation` on its Root and keeps it to itself — it reaches
 * the keyboard handling and the activation direction, but no part publishes it
 * as a data attribute. The List is the element that has to know: horizontal is
 * a row, vertical is a column.
 *
 * Reading it off an ancestor selector would work until the day a vertical Root
 * is nested inside a horizontal one — which is the whole nested-submenu
 * pattern. The nested list is a descendant of BOTH roots, so
 * `.root[data-orientation] .list` would match twice at equal specificity and
 * source order would decide. Carrying the value across a boundary we already
 * own and letting the List stamp `data-orientation` on ITSELF makes the
 * selector exact.
 * ---------------------------------------------------------------------- */

const OrientationContext = React.createContext<"horizontal" | "vertical">(
  "horizontal",
);

/* -------------------------------------------------------------------------
 * Icons
 *
 * Decorative: `data-popup-open` on the trigger and on the `Icon` part already
 * carries the open state, and Base UI puts `aria-expanded` on the trigger
 * itself. Hence `aria-hidden` on both.
 * ---------------------------------------------------------------------- */

function ChevronDownIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
      style={{ display: "block", ...props.style }}
    >
      <path d="m3.5 6 4.5 4.5L12.5 6" />
    </svg>
  );
}

function ChevronEndIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
      style={{ display: "block", ...props.style }}
    >
      <path d="m6 3.5 4.5 4.5L6 12.5" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface NavigationMenuRootProps<Value = any>
  extends Omit<BaseNavigationMenu.Root.Props<Value>, "className"> {
  /**
   * The `List` of items, and the `Popup` their panels are shown in.
   */
  children?: React.ReactNode;
  /**
   * Which way the list runs. `vertical` is what a nested menu inside a panel
   * wants — it also swaps the arrow keys that move between triggers, and makes
   * the panel enter from above or below rather than from the side.
   * @default "horizontal"
   */
  orientation?: BaseNavigationMenu.Root.Props<Value>["orientation"];
  /**
   * The item whose panel is open, by `value`. Pass it to control the menu; use
   * `defaultValue` for the uncontrolled form. `null` closes it.
   */
  value?: BaseNavigationMenu.Root.Props<Value>["value"];
  /**
   * The item whose panel is open on first render, by `value`.
   * @default null
   */
  defaultValue?: BaseNavigationMenu.Root.Props<Value>["defaultValue"];
  /**
   * Called when the open item changes, with the new value and the reason —
   * `trigger-hover`, `trigger-press`, `link-press`, `escape-key` and the rest.
   */
  onValueChange?: BaseNavigationMenu.Root.Props<Value>["onValueChange"];
  /**
   * How long the pointer must rest on a trigger before its panel opens, in
   * milliseconds. Only the FIRST open waits: once a panel is up, moving along
   * the bar swaps it immediately.
   * @default 50
   */
  delay?: BaseNavigationMenu.Root.Props<Value>["delay"];
  /**
   * How long the panel lingers after the pointer leaves, in milliseconds. It
   * is what lets the pointer cross the gap between the bar and the panel; the
   * stylesheet also bridges that gap, so this stays short.
   * @default 50
   */
  closeDelay?: BaseNavigationMenu.Root.Props<Value>["closeDelay"];
  /**
   * A ref to imperative actions. `actionsRef.current.unmount()` removes the
   * popup immediately instead of waiting for its exit transition.
   */
  actionsRef?: BaseNavigationMenu.Root.Props<Value>["actionsRef"];
  /**
   * Called after the closing transition has finished.
   */
  onOpenChangeComplete?: BaseNavigationMenu.Root.Props<Value>["onOpenChangeComplete"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Groups every part of the navigation menu and owns which panel is open.
 * Renders a `<nav>` — or a `<div>` when it is nested inside another menu's
 * `Content`, since one `<nav>` inside another announces two navigation
 * landmarks for one region.
 *
 * Give it an `aria-label` when a page has more than one: "Main" and "Footer"
 * are what a screen-reader user picks between in a landmark list, and two
 * unnamed navigations there are indistinguishable.
 */
export function NavigationMenuRoot<Value = any>({
  children,
  orientation = "horizontal",
  className,
  ...props
}: NavigationMenuRootProps<Value>): React.JSX.Element {
  return (
    <OrientationContext.Provider value={orientation}>
      <BaseNavigationMenu.Root<Value>
        className={clsx(styles.root, className)}
        data-forte="navigation-menu"
        data-orientation={orientation}
        orientation={orientation}
        {...props}
      >
        {children}
      </BaseNavigationMenu.Root>
    </OrientationContext.Provider>
  );
}

/* -------------------------------------------------------------------------
 * List
 * ---------------------------------------------------------------------- */

export interface NavigationMenuListProps
  extends Omit<BaseNavigationMenu.List.Props, "className"> {
  /**
   * The `NavigationMenu.Item`s that make up the bar.
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The bar itself. Renders a `<ul>`.
 *
 * It stamps its own `data-orientation` from the `Root` above it rather than
 * inheriting the look through a descendant selector — see the note on
 * `OrientationContext` for why that matters the moment a vertical menu is
 * nested in a horizontal one.
 */
export const NavigationMenuList = React.forwardRef<
  HTMLUListElement,
  NavigationMenuListProps
>(function NavigationMenuList({ children, className, ...props }, ref) {
  const orientation = React.useContext(OrientationContext);

  return (
    <BaseNavigationMenu.List
      ref={ref}
      className={clsx(styles.list, className)}
      data-forte="navigation-menu-list"
      data-orientation={orientation}
      {...props}
    >
      {children}
    </BaseNavigationMenu.List>
  );
});

/* -------------------------------------------------------------------------
 * Item
 * ---------------------------------------------------------------------- */

export interface NavigationMenuItemProps
  extends Omit<BaseNavigationMenu.Item.Props, "className"> {
  /**
   * A `Trigger` and its `Content`, or a single `Link` for an item that
   * navigates straight out without opening a panel.
   */
  children?: React.ReactNode;
  /**
   * Identifies this item, and is what `Root`'s `value` / `defaultValue` name.
   * Generated automatically when omitted, so it is only needed to drive the
   * menu programmatically.
   */
  value?: BaseNavigationMenu.Item.Props["value"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One entry in the bar. Renders an `<li>`.
 */
export const NavigationMenuItem = React.forwardRef<
  HTMLLIElement,
  NavigationMenuItemProps
>(function NavigationMenuItem({ children, className, ...props }, ref) {
  return (
    <BaseNavigationMenu.Item
      ref={ref}
      className={clsx(styles.item, className)}
      data-forte="navigation-menu-item"
      {...props}
    >
      {children}
    </BaseNavigationMenu.Item>
  );
});

/* -------------------------------------------------------------------------
 * Icon
 * ---------------------------------------------------------------------- */

export interface NavigationMenuIconProps
  extends Omit<BaseNavigationMenu.Icon.Props, "className"> {
  /**
   * The glyph. `Trigger` supplies a chevron when you do not.
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The affordance saying a trigger opens a panel. Renders a `<span>` carrying
 * `data-popup-open`, which is what the stylesheet rotates.
 *
 * `Trigger` renders one for you; reach for this part directly only when the
 * glyph has to sit somewhere the trigger would not put it.
 */
export const NavigationMenuIcon = React.forwardRef<
  HTMLSpanElement,
  NavigationMenuIconProps
>(function NavigationMenuIcon({ children, className, ...props }, ref) {
  return (
    <BaseNavigationMenu.Icon
      ref={ref}
      className={clsx(styles.icon, className)}
      data-forte="navigation-menu-icon"
      {...props}
    >
      {children}
    </BaseNavigationMenu.Icon>
  );
});

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

export interface NavigationMenuTriggerProps
  extends Omit<BaseNavigationMenu.Trigger.Props, "className"> {
  /**
   * The label, plus anything else the row shows.
   */
  children?: React.ReactNode;
  /**
   * How loud the row is. `plain` is the bar row; `card` is the block shape a
   * nested menu's trigger takes inside a panel, where it has to sit level with
   * the `Link`s around it.
   * @default "plain"
   */
  variant?: NavigationMenuVariant;
  /**
   * The glyph inside the built-in `Icon`. Defaults to a chevron — pointing
   * down on a `plain` trigger, and along the inline axis on a `card` one,
   * which is the direction each variant's panel actually arrives from. Pass
   * `false` to drop it, or a node to replace it.
   */
  icon?: React.ReactNode;
  /**
   * Whether the rendered element is a real `<button>`. Set it to `false` when
   * `render` replaces the button with something else, so Base UI supplies the
   * keyboard and role behaviour the element does not have natively.
   * @default true
   */
  nativeButton?: BaseNavigationMenu.Trigger.Props["nativeButton"];
  /**
   * Replaces the rendered `<button>` with another element or component.
   */
  render?: BaseNavigationMenu.Trigger.Props["render"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Opens an item's panel. Renders a `<button>`.
 *
 * It opens on hover as well as on press, which is the behaviour that separates
 * a navigation menu from a `Menu` — the bar is a place to browse, so the panel
 * follows the pointer along it once one is open. Base UI wires
 * `aria-expanded`, `aria-controls` and the roving focus, so an unnamed trigger
 * needs no extra ARIA beyond its own label.
 */
export const NavigationMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  NavigationMenuTriggerProps
>(function NavigationMenuTrigger(
  { children, variant = "plain", icon, className, ...props },
  ref,
) {
  return (
    <BaseNavigationMenu.Trigger
      ref={ref}
      className={clsx(styles.trigger, "forte-focus-ring", className)}
      data-forte="navigation-menu-trigger"
      data-variant={variant}
      {...props}
    >
      {children}
      {icon === false ? null : (
        <NavigationMenuIcon>
          {icon ?? (variant === "card" ? <ChevronEndIcon /> : <ChevronDownIcon />)}
        </NavigationMenuIcon>
      )}
    </BaseNavigationMenu.Trigger>
  );
});

/* -------------------------------------------------------------------------
 * Content
 * ---------------------------------------------------------------------- */

export interface NavigationMenuContentProps
  extends Omit<BaseNavigationMenu.Content.Props, "className"> {
  /**
   * The panel's `Link`s — or a nested `NavigationMenu.Root`, or any markup of
   * your own.
   */
  children?: React.ReactNode;
  /**
   * How many columns the children are laid out in. The grid collapses to
   * fewer on its own when the panel is narrower than
   * `--forte-navigation-menu-column-width`, so a three-column panel becomes one
   * column on a phone without a media query.
   * @default 1
   */
  columns?: NavigationMenuColumns;
  /**
   * Keep the panel in the DOM while it is closed. Off by default; turn it on
   * so the links are in the server-rendered HTML for crawlers.
   * @default false
   */
  keepMounted?: BaseNavigationMenu.Content.Props["keepMounted"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One item's panel. Renders a `<div>`, which Base UI moves into the shared
 * popup's viewport while the item is open.
 *
 * It is a grid rather than a bare box because that is what every panel turns
 * out to be, and `columns` is the only part of it that changes. Pass a
 * `className` of your own for anything else — the layout rules here are all
 * inside `@layer forte.components` and lose to unlayered author CSS.
 */
export const NavigationMenuContent = React.forwardRef<
  HTMLDivElement,
  NavigationMenuContentProps
>(function NavigationMenuContent(
  { children, columns = 1, className, ...props },
  ref,
) {
  return (
    <BaseNavigationMenu.Content
      ref={ref}
      className={clsx(styles.content, className)}
      data-forte="navigation-menu-content"
      data-columns={columns}
      {...props}
    >
      {children}
    </BaseNavigationMenu.Content>
  );
});

/* -------------------------------------------------------------------------
 * Link
 * ---------------------------------------------------------------------- */

export interface NavigationMenuLinkProps
  extends Omit<BaseNavigationMenu.Link.Props, "className"> {
  /**
   * The label — usually a `LinkTitle` and a `LinkDescription`.
   */
  children?: React.ReactNode;
  /**
   * Where the link goes.
   */
  href?: string;
  /**
   * How loud the row is. `card` is the block inside a panel; `plain` is the
   * bar row, for a top-level item that navigates straight out instead of
   * opening a panel — it matches a `plain` `Trigger` so the two sit level in
   * the same list.
   * @default "card"
   */
  variant?: NavigationMenuVariant;
  /**
   * Whether this link is the page the user is on. Publishes `data-active` and
   * `aria-current="page"`, so the cue is not colour alone.
   * @default false
   */
  active?: BaseNavigationMenu.Link.Props["active"];
  /**
   * Whether following the link closes the menu. Base UI leaves this off,
   * because a link that opens a new tab leaves the menu's own page standing —
   * turn it on for a same-tab navigation, and for a client-side route change
   * that would otherwise leave the panel open over the new page.
   * @default false
   */
  closeOnClick?: BaseNavigationMenu.Link.Props["closeOnClick"];
  /**
   * Replaces the rendered `<a>` with another element or component —
   * `render={<Link href="/pricing" />}` is how a framework's router link goes
   * in without losing the menu's keyboard behaviour.
   */
  render?: BaseNavigationMenu.Link.Props["render"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A link in the menu. Renders an `<a>`.
 *
 * `data-focus-inset` is not optional here: the popup's viewport clips, so a
 * ring drawn outside the link's own box would be shaved off along the panel's
 * edge (SC 2.4.11).
 */
export const NavigationMenuLink = React.forwardRef<
  HTMLAnchorElement,
  NavigationMenuLinkProps
>(function NavigationMenuLink(
  { children, variant = "card", className, ...props },
  ref,
) {
  return (
    <BaseNavigationMenu.Link
      ref={ref}
      className={clsx(styles.link, "forte-focus-ring", className)}
      data-forte="navigation-menu-link"
      data-variant={variant}
      data-focus-inset=""
      {...props}
    >
      {children}
    </BaseNavigationMenu.Link>
  );
});

/* -------------------------------------------------------------------------
 * LinkTitle / LinkDescription
 *
 * The two parts Base UI does not have. They are presentation only — no state,
 * no behaviour — and they exist because the alternative is every consumer
 * inventing the same `<h3>` / `<p>` pair with the same four declarations, and
 * getting the heading level wrong: a panel is not a document section, and an
 * `<h3>` inside one lands in the heading outline of whatever page the bar
 * happens to be on.
 * ---------------------------------------------------------------------- */

export interface NavigationMenuLinkTitleProps
  extends React.ComponentPropsWithoutRef<"span"> {
  /**
   * The link's headline.
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The first line of a `card` link. Renders a `<span>` — deliberately not a
 * heading, since the panel is a list of destinations rather than a section of
 * the page, and the link's own text is already its accessible name.
 */
export const NavigationMenuLinkTitle = React.forwardRef<
  HTMLSpanElement,
  NavigationMenuLinkTitleProps
>(function NavigationMenuLinkTitle({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={clsx(styles.linkTitle, className)}
      data-forte="navigation-menu-link-title"
      {...props}
    />
  );
});

export interface NavigationMenuLinkDescriptionProps
  extends React.ComponentPropsWithoutRef<"span"> {
  /**
   * The supporting line.
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The supporting line under a `LinkTitle`. Renders a `<span>`, not a `<p>`:
 * it lives inside an `<a>`, and a paragraph is not permitted there.
 *
 * It is part of the link's accessible name, which is usually what you want —
 * "Quick start, install and assemble your first component" reads better in a
 * links list than "Quick start" alone. Add `aria-hidden` to it when the text
 * is decorative enough that repeating it costs more than it explains.
 */
export const NavigationMenuLinkDescription = React.forwardRef<
  HTMLSpanElement,
  NavigationMenuLinkDescriptionProps
>(function NavigationMenuLinkDescription({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={clsx(styles.linkDescription, className)}
      data-forte="navigation-menu-link-description"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Popup
 * ---------------------------------------------------------------------- */

type PositionerProps = BaseNavigationMenu.Positioner.Props;
type BasePopupProps = BaseNavigationMenu.Popup.Props;
type BasePortalProps = BaseNavigationMenu.Portal.Props;

export interface NavigationMenuPopupProps
  extends Omit<BasePopupProps, "className" | "children"> {
  /**
   * Which side of the bar the panel opens on. Flips automatically to avoid
   * collisions unless `collisionAvoidance` says otherwise.
   *
   * `"inline-start"` / `"inline-end"` follow writing direction, but Base UI
   * takes that direction from its own `DirectionProvider` context and not from
   * the `dir` attribute — with no provider mounted it is `"ltr"`, so the two
   * resolve to left and right whatever `dir` says. The library's own CSS reads
   * the attribute, so everything else here flips without it.
   * @default "bottom"
   */
  side?: PositionerProps["side"];
  /**
   * How the panel aligns along that side. Centred on the active trigger,
   * which is the alignment the sliding panel reads best under: it appears to
   * hang from whichever trigger is open rather than from one end of the bar.
   * @default "center"
   */
  align?: PositionerProps["align"];
  /**
   * Gap in pixels between the bar and the panel. The stylesheet bridges this
   * gap so the pointer can cross it without the panel closing — change
   * `--forte-navigation-menu-bridge` to match if you change this.
   * @default 8
   */
  sideOffset?: PositionerProps["sideOffset"];
  /**
   * Extra offset in pixels along the alignment axis.
   * @default 0
   */
  alignOffset?: PositionerProps["alignOffset"];
  /**
   * Space to keep between the panel and the edge of its collision boundary.
   * @default 8
   */
  collisionPadding?: PositionerProps["collisionPadding"];
  /**
   * Which collision responses are allowed. Pass `{ side: "none" }` to stop a
   * panel flipping above a header bar when the window is short — it will
   * shrink and scroll instead of appearing on the wrong side of the thing it
   * belongs to.
   */
  collisionAvoidance?: PositionerProps["collisionAvoidance"];
  /**
   * An element to position the panel against instead of the active trigger.
   */
  anchor?: PositionerProps["anchor"];
  /**
   * Render the panel into a different container instead of `<body>`.
   */
  container?: BasePortalProps["container"];
  /**
   * Keep the popup mounted while the menu is closed.
   * @default false
   */
  keepMounted?: BasePortalProps["keepMounted"];
  /**
   * Render a dimming layer behind the panel. Off by default — a navigation bar
   * is browsed, not modal — but useful on a phone where the panel covers most
   * of the page.
   * @default false
   */
  backdrop?: boolean;
  /**
   * Draw a wedge pointing back at the active trigger. Off by default, and
   * worth turning on when the panel is much wider than the trigger that opened
   * it: the wedge slides along with the panel and is then the only thing
   * naming which item is open.
   * @default false
   */
  arrow?: boolean;
  /**
   * Additional class name(s) for the popup surface. Applied after the internal
   * styles so consumer utilities win without needing `!important`.
   */
  className?: string;
  /**
   * Additional class name(s) for the positioner — the absolutely positioned
   * wrapper around the popup, and the element that carries the travel between
   * triggers. This is the only way to reach the four properties declared
   * there: `--forte-navigation-menu-z-index`, `--forte-navigation-menu-bridge`,
   * and the `-move-duration` / `-move-ease` pair the popup inherits for its
   * own resize.
   */
  positionerClassName?: string;
}

/**
 * The single floating surface every item's `Content` is shown in. Renders a
 * `<nav>`, and takes no children — the panels come from the `Content` parts
 * up in the list.
 *
 * This one part renders the whole floating half of Base UI's anatomy —
 * `Portal` → (`Backdrop`) → `Positioner` → `Popup` → (`Arrow`) → `Viewport` —
 * because those elements are meaningless apart and each has a job the styles
 * depend on: the positioner owns `--available-width` / `--transform-origin`
 * and the travel between triggers, the popup owns the surface and its resize,
 * and the viewport clips the two panels sliding past each other.
 *
 * There is exactly one of these per `Root`, and it is a sibling of the `List`.
 */
export const NavigationMenuPopup = React.forwardRef<
  HTMLElement,
  NavigationMenuPopupProps
>(function NavigationMenuPopup(
  {
    side = "bottom",
    align = "center",
    sideOffset = 8,
    alignOffset,
    collisionPadding = 8,
    collisionAvoidance,
    anchor,
    container,
    keepMounted,
    backdrop = false,
    arrow = false,
    className,
    positionerClassName,
    ...props
  },
  ref,
) {
  return (
    <BaseNavigationMenu.Portal container={container} keepMounted={keepMounted}>
      {backdrop ? (
        <BaseNavigationMenu.Backdrop
          className={clsx(styles.backdrop, "forte-scrim")}
          data-forte="navigation-menu-backdrop"
        />
      ) : null}
      <BaseNavigationMenu.Positioner
        className={clsx(styles.positioner, positionerClassName)}
        data-forte="navigation-menu-positioner"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        collisionPadding={collisionPadding}
        collisionAvoidance={collisionAvoidance}
        anchor={anchor}
      >
        {/* `forte-hc-surface` carries a transparent border that becomes a
          * system-coloured boundary in forced-colors mode, where the box-shadow
          * is stripped and the panel would otherwise dissolve into the page
          * behind it. */}
        <BaseNavigationMenu.Popup
          ref={ref}
          className={clsx(styles.popup, "forte-hc-surface", className)}
          data-forte="navigation-menu-popup"
          {...props}
        >
          {/* Outside the viewport, as a direct sibling: the viewport clips, and
            * the wedge lives beyond the popup's edge. */}
          {arrow ? (
            <BaseNavigationMenu.Arrow
              className={clsx(styles.arrow, "forte-popup-arrow")}
              data-forte="navigation-menu-arrow"
            >
              <ArrowSvg />
            </BaseNavigationMenu.Arrow>
          ) : null}
          <BaseNavigationMenu.Viewport
            className={styles.viewport}
            data-forte="navigation-menu-viewport"
          />
        </BaseNavigationMenu.Popup>
      </BaseNavigationMenu.Positioner>
    </BaseNavigationMenu.Portal>
  );
});

/**
 * Points up in its own coordinate space; the stylesheet rotates it per side.
 * Two paths, not one: the larger sits underneath and shows only as a hairline
 * along the slopes, which continues the popup's own border around the wedge
 * and gives forced-colors mode an outline to paint.
 *
 * An SVG rather than the traditional CSS-border triangle, because in
 * forced-colors mode every border colour is forced to `CanvasText` and a
 * border triangle degrades into a filled rectangle.
 */
function ArrowSvg() {
  return (
    <svg
      className="forte-popup-arrow-svg"
      viewBox="0 0 20 10"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path className="forte-popup-arrow-border" d="M0 10 L10 0 L20 10 Z" />
      <path className="forte-popup-arrow-fill" d="M2.12 10 L10 2.12 L17.88 10 Z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * Compound export
 * ---------------------------------------------------------------------- */

/**
 * A site navigation bar built on Base UI's unstyled `NavigationMenu`
 * primitives: a row of items, some of which open a panel of links.
 *
 * ```tsx
 * <NavigationMenu.Root aria-label="Main">
 *   <NavigationMenu.List>
 *     <NavigationMenu.Item>
 *       <NavigationMenu.Trigger>Product</NavigationMenu.Trigger>
 *       <NavigationMenu.Content columns={2}>
 *         <NavigationMenu.Link href="/overview">
 *           <NavigationMenu.LinkTitle>Overview</NavigationMenu.LinkTitle>
 *           <NavigationMenu.LinkDescription>
 *             What the product does, in one page.
 *           </NavigationMenu.LinkDescription>
 *         </NavigationMenu.Link>
 *       </NavigationMenu.Content>
 *     </NavigationMenu.Item>
 *
 *     <NavigationMenu.Item>
 *       <NavigationMenu.Link variant="plain" href="/pricing">Pricing</NavigationMenu.Link>
 *     </NavigationMenu.Item>
 *   </NavigationMenu.List>
 *
 *   <NavigationMenu.Popup />
 * </NavigationMenu.Root>
 * ```
 *
 * ## Navigation menu or menu?
 *
 * Every row here NAVIGATES. If the rows run commands — duplicate, export, sign
 * out — it is a `Menu`, which is a different set of ARIA roles and a different
 * set of keyboard expectations. A navigation menu is a list of links that
 * happens to be collapsible; a menu is an application menu that happens to
 * contain text.
 *
 * All panels share ONE popup, which slides and resizes between triggers rather
 * than each item owning a surface that opens and closes. That is the whole
 * behaviour of the component, and it is why `Content` lives up in the list
 * while `Popup` is a single sibling of the `List`.
 *
 * Styling is driven by `data-*` attributes and `--forte-navigation-menu-*`
 * custom properties, so it can be re-skinned from plain CSS or targeted with
 * Tailwind arbitrary variants (`data-[popup-open]:...`) without wrapping. Each
 * part declares its own knobs, so an ancestor's value is only inherited and
 * loses — set them on the part itself via `className`. The popup is portalled
 * to `<body>`, so an ancestor of the bar could not reach it in any case.
 *
 * @summary A horizontal site-nav bar whose items open one shared panel of
 *   links that slides and resizes between them.
 * @category Navigation
 */
export const NavigationMenu = {
  Root: NavigationMenuRoot,
  List: NavigationMenuList,
  Item: NavigationMenuItem,
  Trigger: NavigationMenuTrigger,
  Icon: NavigationMenuIcon,
  Content: NavigationMenuContent,
  Link: NavigationMenuLink,
  LinkTitle: NavigationMenuLinkTitle,
  LinkDescription: NavigationMenuLinkDescription,
  Popup: NavigationMenuPopup,
};
