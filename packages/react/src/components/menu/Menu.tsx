"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import { Kbd } from "../kbd";
import styles from "./Menu.module.css";

export type MenuItemTone = "neutral" | "danger";

/* -------------------------------------------------------------------------
 * Placement context
 *
 * Not a re-implementation of anything Base UI owns — it exists so that
 * `<Menu.Popup>` can pick placement defaults appropriate to what opened it.
 * A top-level menu drops below its trigger; a submenu opens sideways off the
 * row that spawned it; a context menu is not anchored to an element at all but
 * to the point the pointer was at. Each wants a different set of defaults, and
 * the popup is the part that has to supply them — a consumer writing
 * `<Menu.Popup>` inside a `<Menu.SubmenuRoot>` should not have to restate the
 * four positioning props that make it a submenu.
 *
 * Base UI does publish a `useMenuSubmenuRootContext`, but only from a deep
 * module path that is not in the package's `exports` map — reaching for it
 * would break on the first release that reshuffles the file tree. This is one
 * enum across a boundary we already own, since `Menu.SubmenuRoot` and
 * `ContextMenu.Root` both wrap Base UI's own.
 * ---------------------------------------------------------------------- */

/**
 * What opened the popup, which is what decides its placement defaults.
 *
 * Internal: the three providers are `Menu.Root`, `Menu.SubmenuRoot` and
 * `ContextMenu.Root`, and nothing else may set it.
 */
export type MenuPlacementKind = "menu" | "submenu" | "context-menu";

/** @internal — see `MenuPlacementKind`. Not exported from the package. */
export const MenuPlacementContext =
  React.createContext<MenuPlacementKind>("menu");

/**
 * The positioning props `<Menu.Popup>` supplies when the consumer passes none.
 *
 * `context-menu` leaves all three UNDEFINED, and that is the whole point of the
 * row. Base UI's positioner has its own context-menu branch: it swaps the
 * anchor for the point the pointer was at, and then — only if no `side` was
 * given — applies `sideOffset: -5` and `alignOffset: 2`, which are what put the
 * popup's corner ON the cursor rather than a gap away from it. Passing
 * `side="bottom"` here would silently opt every context menu out of those two
 * offsets and drop the popup below the click instead of at it.
 *
 * A `Menu.Root` inside a `<Menubar>` takes the `menu` row, since a menubar
 * menu does drop below its trigger. That is right for the horizontal bar and
 * carried over unchanged from the boolean this table replaced — but note it is
 * a decision now: Base UI would pick `inline-end` for a VERTICAL bar if `side`
 * were left unset, and `"bottom"` overrides it. Give the bar its own row here
 * rather than reaching for `side` at each call site if that ever needs fixing.
 */
const PLACEMENT_DEFAULTS: Record<
  MenuPlacementKind,
  {
    side: PositionerProps["side"];
    sideOffset: PositionerProps["sideOffset"];
    alignOffset: PositionerProps["alignOffset"];
  }
> = {
  menu: { side: "bottom", sideOffset: 4, alignOffset: 0 },
  submenu: { side: "inline-end", sideOffset: -4, alignOffset: -4 },
  "context-menu": {
    side: undefined,
    sideOffset: undefined,
    alignOffset: undefined,
  },
};

/* -------------------------------------------------------------------------
 * Icons
 *
 * Decorative throughout: every state they depict is already carried by
 * `data-checked`, `data-popup-open` or `data-highlighted` on an ancestor that
 * assistive technology reads. Hence `aria-hidden` on all three.
 * ---------------------------------------------------------------------- */

function CheckIcon(props: React.ComponentProps<"svg">) {
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
      <path d="m2.5 8.5 4 4 7-9" />
    </svg>
  );
}

function DotIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
      style={{ display: "block", ...props.style }}
    >
      <circle cx="8" cy="8" r="3.25" />
    </svg>
  );
}

function ChevronIcon(props: React.ComponentProps<"svg">) {
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
      <path d="m6 3.5 5 4.5-5 4.5" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

/**
 * Props for {@link MenuRoot}. A re-export of Base UI's own root props, kept
 * generic so `<Menu.Root<Payload>>` still types the render-function form of
 * `children` and the `payload` a trigger hands over.
 */
export type MenuRootProps<Payload = unknown> = BaseMenu.Root.Props<Payload>;

/**
 * Groups every part of the menu and owns its open state. Renders no DOM
 * element of its own, so it accepts neither `className` nor `ref`.
 *
 * Forwards Base UI's root props unchanged — `open`, `defaultOpen`,
 * `onOpenChange`, `modal`, `orientation`, `loopFocus`, `highlightItemOnHover`,
 * `disabled` and the `handle` / `triggerId` pair that lets a detached trigger
 * drive it.
 */
export function MenuRoot<Payload = unknown>(
  props: MenuRootProps<Payload>,
): React.JSX.Element {
  return (
    /* Restated rather than left to the context's own default, because this
     * menu may be nested inside something that already set it — a `Menu.Root`
     * rendered inside a `ContextMenu.Trigger`'s region is the real case, and
     * without this reset its popup would inherit the context menu's
     * anchored-to-the-pointer placement and open at the last right-click. */
    <MenuPlacementContext.Provider value="menu">
      <BaseMenu.Root<Payload> {...props} />
    </MenuPlacementContext.Provider>
  );
}

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

export interface MenuTriggerProps<Payload = unknown>
  extends Omit<BaseMenu.Trigger.Props<Payload>, "className"> {
  /**
   * Also open the menu when the trigger is hovered. Off by default, and worth
   * leaving off for a standalone menu: a menu that opens on hover is a menu
   * that opens by accident on the way to somewhere else.
   *
   * Inside a `<Menubar>` it turns itself on, but only once a sibling menu in
   * the same bar is already open — which is what makes the row behave as one
   * strip after the first click without any of its triggers firing at a
   * passing pointer. Pass it explicitly to override that either way.
   * @default false, or true inside a `Menubar` with a menu already open
   */
  openOnHover?: BaseMenu.Trigger.Props<Payload>["openOnHover"];
  /**
   * How long the pointer must rest on the trigger before the menu opens, in
   * milliseconds. Requires `openOnHover`.
   * @default 100
   */
  delay?: BaseMenu.Trigger.Props<Payload>["delay"];
  /**
   * How long the menu lingers after the pointer leaves, in milliseconds.
   * Requires `openOnHover`.
   * @default 0
   */
  closeDelay?: BaseMenu.Trigger.Props<Payload>["closeDelay"];
  /**
   * Whether the rendered element is a real `<button>`. Set it to `false` when
   * `render` replaces the button with something else (a `<div>`, a table
   * row), so Base UI supplies the keyboard and role behaviour the element
   * does not have natively.
   * @default true
   */
  nativeButton?: BaseMenu.Trigger.Props<Payload>["nativeButton"];
  /**
   * Associates a detached trigger with the `Menu.Root` carrying the same
   * handle, created once outside render with `Menu.createHandle()`.
   */
  handle?: BaseMenu.Trigger.Props<Payload>["handle"];
  /**
   * Data handed to the menu when this trigger opens it, so one popup can
   * render different items per trigger. Read it from the render-function form
   * of `Menu.Root`'s children.
   */
  payload?: BaseMenu.Trigger.Props<Payload>["payload"];
  /**
   * Replaces the rendered `<button>` with another element or component —
   * `render={<Button variant="outline" />}` is the common case. The trigger's
   * own neutral styling steps aside when this is present, so the two never
   * fight over the cascade.
   */
  render?: BaseMenu.Trigger.Props<Payload>["render"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Generic-preserving component type. `React.forwardRef` erases the type
 * parameter, so the cast below restores it — otherwise `payload` would widen
 * to `unknown` at every call site.
 */
interface MenuTriggerComponent {
  <Payload>(
    props: MenuTriggerProps<Payload> & React.RefAttributes<HTMLButtonElement>,
  ): React.JSX.Element;
}

/**
 * The button that opens the menu. Renders a `<button>`.
 *
 * Base UI wires it to the popup with `aria-haspopup="menu"`, `aria-expanded`
 * and `aria-controls`, so it needs no `aria-label` describing the menu itself.
 * An icon-only trigger still needs a name of its own, as any icon-only button
 * does.
 */
export const MenuTrigger = React.forwardRef(function MenuTrigger<Payload>(
  { className, render, ...props }: MenuTriggerProps<Payload>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  return (
    <BaseMenu.Trigger<Payload>
      ref={ref}
      render={render}
      className={clsx(
        render === undefined && styles.trigger,
        "forte-focus-ring",
        className,
      )}
      data-forte="menu-trigger"
      {...props}
    />
  );
}) as MenuTriggerComponent;

/* -------------------------------------------------------------------------
 * Popup
 * ---------------------------------------------------------------------- */

type PositionerProps = BaseMenu.Positioner.Props;
type BasePopupProps = BaseMenu.Popup.Props;
type BasePortalProps = BaseMenu.Portal.Props;

export interface MenuPopupProps extends Omit<BasePopupProps, "className"> {
  /**
   * The items, groups and separators to render.
   */
  children?: React.ReactNode;
  /**
   * Which side of the trigger the popup opens on. Flips automatically to
   * avoid collisions.
   *
   * `"inline-start"` / `"inline-end"` follow writing direction, but Base UI
   * takes that direction from its own `DirectionProvider` context and not from
   * the `dir` attribute — with no provider mounted it is `"ltr"`, so the two
   * resolve to left and right whatever `dir` says. An RTL app has to mount
   * `<DirectionProvider direction="rtl">` for them to mirror. The library's own
   * CSS reads the attribute, so everything else here flips without it.
   * @default "bottom"; "inline-end" inside a `Menu.SubmenuRoot`; the popup is
   * anchored to the pointer instead inside a `ContextMenu.Root`
   */
  side?: PositionerProps["side"];
  /**
   * How the popup aligns along the chosen side. Menus align to the trigger's
   * start edge rather than its centre, which is Base UI's own default — a
   * centred menu drifts left of a wide trigger and right of a narrow one, and
   * the reading edge is what a list of commands should line up on.
   * @default "start"
   */
  align?: PositionerProps["align"];
  /**
   * Gap in pixels between the trigger and the popup.
   * @default 4; -4 inside a `Menu.SubmenuRoot`; -5 inside a `ContextMenu.Root`
   */
  sideOffset?: PositionerProps["sideOffset"];
  /**
   * Extra offset in pixels along the alignment axis.
   * @default 0; -4 inside a `Menu.SubmenuRoot`; 2 inside a `ContextMenu.Root`
   */
  alignOffset?: PositionerProps["alignOffset"];
  /**
   * Space to keep between the popup and the edge of its collision boundary.
   * @default 5
   */
  collisionPadding?: PositionerProps["collisionPadding"];
  /**
   * An element to position the popup against instead of the trigger.
   */
  anchor?: PositionerProps["anchor"];
  /**
   * Render the popup into a different container instead of `<body>`.
   */
  container?: BasePortalProps["container"];
  /**
   * Render a dimming layer behind the popup. Off by default — a menu is a
   * short-lived list, not a mode — but useful on small screens where the
   * popup covers most of the page.
   * @default false
   */
  backdrop?: boolean;
  /**
   * Where focus goes when the menu closes. There is no `initialFocus`
   * counterpart: Base UI moves focus into the popup on open, to the first
   * item for a keyboard open and to the popup itself for a pointer one.
   * @default the trigger
   */
  finalFocus?: BasePopupProps["finalFocus"];
  /**
   * Additional class name(s) for the popup surface. Applied after the
   * internal styles so consumer utilities win without needing `!important`.
   */
  className?: string;
  /**
   * Additional class name(s) for the positioner — the absolutely positioned
   * wrapper around the popup. This is the only way to reach
   * `--forte-menu-z-index`, the one property declared there.
   */
  positionerClassName?: string;
}

/**
 * The floating surface holding the items. Renders a `<div>` with
 * `role="menu"`.
 *
 * This one part renders the whole floating half of Base UI's anatomy —
 * `Portal` → (`Backdrop`) → `Positioner` → `Popup` — because those elements
 * are meaningless apart and each has a job the styles depend on: the
 * positioner owns `--available-height` and `--transform-origin`, and the popup
 * owns the surface and the scrolling.
 *
 * Inside a `<Menu.SubmenuRoot>` the placement defaults change: the popup opens
 * off the inline end of the row rather than below it, and two negative offsets
 * tuck it against the parent so the first submenu item lines up with the
 * trigger row. Inside a `<ContextMenu.Root>` they change again — the popup is
 * anchored to the point the pointer was at rather than to any element, and
 * Base UI supplies the offsets that land its corner on the cursor. Pass any of
 * `side`, `align`, `sideOffset` or `alignOffset` explicitly to override that.
 */
export const MenuPopup = React.forwardRef<HTMLDivElement, MenuPopupProps>(
  function MenuPopup(
    {
      children,
      side,
      align = "start",
      sideOffset,
      alignOffset,
      collisionPadding,
      anchor,
      container,
      backdrop = false,
      className,
      positionerClassName,
      ...props
    },
    ref,
  ) {
    const placement = PLACEMENT_DEFAULTS[React.useContext(MenuPlacementContext)];

    return (
      <BaseMenu.Portal container={container}>
        {backdrop ? (
          <BaseMenu.Backdrop
            className={clsx(styles.backdrop, "forte-scrim")}
            data-forte="menu-backdrop"
          />
        ) : null}
        <BaseMenu.Positioner
          className={clsx(styles.positioner, positionerClassName)}
          data-forte="menu-positioner"
          side={side ?? placement.side}
          align={align}
          sideOffset={sideOffset ?? placement.sideOffset}
          alignOffset={alignOffset ?? placement.alignOffset}
          collisionPadding={collisionPadding}
          anchor={anchor}
        >
          {/* `forte-hc-surface` carries a transparent border that becomes a
            * system-coloured boundary in forced-colors mode, where the
            * box-shadow is stripped and the popup would otherwise dissolve
            * into the page behind it. */}
          <BaseMenu.Popup
            ref={ref}
            className={clsx(styles.popup, "forte-hc-surface", className)}
            data-forte="menu-popup"
            {...props}
          >
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    );
  },
);

/* -------------------------------------------------------------------------
 * Item
 * ---------------------------------------------------------------------- */

export interface MenuItemProps extends Omit<BaseMenu.Item.Props, "className"> {
  /**
   * The item's label, plus anything else the row shows — a leading icon, a
   * trailing `<Menu.Shortcut>`.
   */
  children?: React.ReactNode;
  /**
   * Which semantic colour set the row draws from. `danger` is for an action
   * that destroys something, and is the only alternative offered: the
   * highlight already paints `--forte-color-primary-soft`, so a primary-toned
   * row would be indistinguishable from the row the user is currently on.
   * @default "neutral"
   */
  tone?: MenuItemTone;
  /**
   * Whether the item ignores user interaction. A disabled item stays in the
   * list, stays announced, and is still reached by the arrow keys and by
   * typeahead — so the command remains discoverable; it just cannot be run.
   * @default false
   */
  disabled?: BaseMenu.Item.Props["disabled"];
  /**
   * Plain-text label used for typeahead when `children` is not a string.
   */
  label?: BaseMenu.Item.Props["label"];
  /**
   * Whether choosing the item closes the menu. Leave it on for a command;
   * turn it off for a row that only changes something on screen.
   * @default true
   */
  closeOnClick?: BaseMenu.Item.Props["closeOnClick"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One command in the menu. Renders a `<div>` with `role="menuitem"`.
 *
 * `data-highlighted` is the focus analogue here: Base UI moves real DOM focus
 * between rows with a roving tabindex, and (with `highlightItemOnHover`, on by
 * default) pointer hover sets the same attribute. Because the popup scrolls,
 * and a scroll container clips, the focus ring is applied inset via
 * `data-focus-inset` so `overflow` cannot crop it.
 */
export const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
  function MenuItem({ children, tone = "neutral", className, ...props }, ref) {
    return (
      <BaseMenu.Item
        ref={ref}
        className={clsx(styles.item, "forte-focus-ring", className)}
        data-forte="menu-item"
        data-tone={tone}
        data-focus-inset=""
        {...props}
      >
        {children}
      </BaseMenu.Item>
    );
  },
);

/* -------------------------------------------------------------------------
 * LinkItem
 * ---------------------------------------------------------------------- */

export interface MenuLinkItemProps
  extends Omit<BaseMenu.LinkItem.Props, "className"> {
  /**
   * The link's label, plus anything else the row shows.
   */
  children?: React.ReactNode;
  /**
   * Where the link goes.
   */
  href?: string;
  /**
   * Plain-text label used for typeahead when `children` is not a string.
   */
  label?: BaseMenu.LinkItem.Props["label"];
  /**
   * Whether following the link closes the menu. Base UI leaves this off
   * because a link that opens in a new tab leaves the menu's own page
   * standing — turn it on for a same-tab navigation.
   * @default false
   */
  closeOnClick?: BaseMenu.LinkItem.Props["closeOnClick"];
  /**
   * Replaces the rendered `<a>` with another element or component —
   * `render={<Link href="/settings" />}` is how a framework's router link goes
   * in without losing the menu's keyboard behaviour.
   */
  render?: BaseMenu.LinkItem.Props["render"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A row that navigates rather than acting. Renders an `<a>` with
 * `role="menuitem"`, so it keeps the menu's arrow-key navigation and typeahead
 * while still being a real link — middle-click, ⌘-click and "copy link
 * address" all work, which they do not on an item with an `onClick` that calls
 * `router.push`.
 */
export const MenuLinkItem = React.forwardRef<
  HTMLAnchorElement,
  MenuLinkItemProps
>(function MenuLinkItem({ children, className, ...props }, ref) {
  return (
    <BaseMenu.LinkItem
      ref={ref}
      className={clsx(styles.item, styles.linkItem, "forte-focus-ring", className)}
      data-forte="menu-link-item"
      data-focus-inset=""
      {...props}
    >
      {children}
    </BaseMenu.LinkItem>
  );
});

/* -------------------------------------------------------------------------
 * CheckboxItem
 * ---------------------------------------------------------------------- */

export interface MenuCheckboxItemProps
  extends Omit<BaseMenu.CheckboxItem.Props, "className"> {
  /**
   * The item's label.
   */
  children?: React.ReactNode;
  /**
   * Whether the item is ticked. Pass it to control the item; use
   * `defaultChecked` for the uncontrolled form.
   */
  checked?: BaseMenu.CheckboxItem.Props["checked"];
  /**
   * Whether the item starts out ticked.
   * @default false
   */
  defaultChecked?: BaseMenu.CheckboxItem.Props["defaultChecked"];
  /**
   * Called when the item is ticked or unticked.
   */
  onCheckedChange?: BaseMenu.CheckboxItem.Props["onCheckedChange"];
  /**
   * Whether choosing the item closes the menu. Off by default, which is what
   * lets a run of toggles be set in one visit.
   * @default false
   */
  closeOnClick?: BaseMenu.CheckboxItem.Props["closeOnClick"];
  /**
   * What marks the item as ticked. Rendered inside the indicator, which only
   * mounts while the item is checked.
   * @default <CheckIcon />
   */
  indicator?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A row that toggles a setting. Renders a `<div>` with
 * `role="menuitemcheckbox"` and `aria-checked`.
 *
 * Rendering one of these anywhere in a popup indents every other row in that
 * popup to match, so labels stay in one column instead of stepping in and out
 * around the tick marks — see `.popup:has(...)` in the stylesheet.
 */
export const MenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  MenuCheckboxItemProps
>(function MenuCheckboxItem({ children, indicator, className, ...props }, ref) {
  return (
    <BaseMenu.CheckboxItem
      ref={ref}
      className={clsx(
        styles.item,
        styles.checkboxItem,
        "forte-focus-ring",
        className,
      )}
      data-forte="menu-checkbox-item"
      data-focus-inset=""
      {...props}
    >
      {/* `keepMounted` so the indicator's box is in the row whether or not it
        * is ticked. Without it the label would shift sideways the moment the
        * item was toggled — the one frame the user is looking straight at. */}
      <BaseMenu.CheckboxItemIndicator
        className={styles.itemIndicator}
        data-forte="menu-item-indicator"
        keepMounted
      >
        {indicator ?? <CheckIcon />}
      </BaseMenu.CheckboxItemIndicator>
      {children}
    </BaseMenu.CheckboxItem>
  );
});

/* -------------------------------------------------------------------------
 * RadioGroup / RadioItem
 * ---------------------------------------------------------------------- */

export interface MenuRadioGroupProps
  extends Omit<BaseMenu.RadioGroup.Props, "className"> {
  /**
   * The radio items, and any group label above them.
   */
  children?: React.ReactNode;
  /**
   * The selected value. Pass it to control the group; use `defaultValue` for
   * the uncontrolled form.
   */
  value?: BaseMenu.RadioGroup.Props["value"];
  /**
   * The value selected on first render.
   */
  defaultValue?: BaseMenu.RadioGroup.Props["defaultValue"];
  /**
   * Called when the selection changes.
   */
  onValueChange?: BaseMenu.RadioGroup.Props["onValueChange"];
  /**
   * Whether the whole group ignores user interaction.
   * @default false
   */
  disabled?: BaseMenu.RadioGroup.Props["disabled"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A set of rows where exactly one is chosen. Renders a `<div>` with
 * `role="group"`; it owns the value, so the items inside it carry only their
 * own `value`.
 *
 * Put a `<Menu.GroupLabel>` inside it to name the set — Base UI associates the
 * two the same way it does for `<Menu.Group>`.
 */
export const MenuRadioGroup = React.forwardRef<
  HTMLDivElement,
  MenuRadioGroupProps
>(function MenuRadioGroup({ className, ...props }, ref) {
  return (
    <BaseMenu.RadioGroup
      ref={ref}
      className={clsx(styles.group, className)}
      data-forte="menu-radio-group"
      {...props}
    />
  );
});

export interface MenuRadioItemProps
  extends Omit<BaseMenu.RadioItem.Props, "className"> {
  /**
   * The item's label.
   */
  children?: React.ReactNode;
  /**
   * The value this row selects in its `<Menu.RadioGroup>`.
   */
  value: BaseMenu.RadioItem.Props["value"];
  /**
   * Whether choosing the item closes the menu. Off by default, matching
   * `Menu.CheckboxItem`.
   * @default false
   */
  closeOnClick?: BaseMenu.RadioItem.Props["closeOnClick"];
  /**
   * What marks the row as selected. Rendered inside the indicator, which only
   * mounts while the item is the chosen one.
   * @default <DotIcon />
   */
  indicator?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One choice in a `<Menu.RadioGroup>`. Renders a `<div>` with
 * `role="menuitemradio"` and `aria-checked`.
 *
 * The default marker is a dot rather than a tick — the same distinction the
 * platform menus draw, and the only cue separating "one of these" from "any of
 * these" once both kinds of row share a popup.
 */
export const MenuRadioItem = React.forwardRef<
  HTMLDivElement,
  MenuRadioItemProps
>(function MenuRadioItem({ children, indicator, className, ...props }, ref) {
  return (
    <BaseMenu.RadioItem
      ref={ref}
      className={clsx(
        styles.item,
        styles.radioItem,
        "forte-focus-ring",
        className,
      )}
      data-forte="menu-radio-item"
      data-focus-inset=""
      {...props}
    >
      {/* Kept mounted for the same reason as the checkbox indicator: the
        * column has to exist whether or not this is the chosen row. */}
      <BaseMenu.RadioItemIndicator
        className={styles.itemIndicator}
        data-forte="menu-item-indicator"
        keepMounted
      >
        {indicator ?? <DotIcon />}
      </BaseMenu.RadioItemIndicator>
      {children}
    </BaseMenu.RadioItem>
  );
});

/* -------------------------------------------------------------------------
 * Group / GroupLabel / Separator
 * ---------------------------------------------------------------------- */

export interface MenuGroupProps
  extends Omit<BaseMenu.Group.Props, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Groups related items under a heading. Renders a `<div>` with
 * `role="group"`; Base UI associates it with the `<Menu.GroupLabel>` inside it
 * automatically, so the heading is announced with its members.
 */
export const MenuGroup = React.forwardRef<HTMLDivElement, MenuGroupProps>(
  function MenuGroup({ className, ...props }, ref) {
    return (
      <BaseMenu.Group
        ref={ref}
        className={clsx(styles.group, className)}
        data-forte="menu-group"
        {...props}
      />
    );
  },
);

export interface MenuGroupLabelProps
  extends Omit<BaseMenu.GroupLabel.Props, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The heading for a `<Menu.Group>` or a `<Menu.RadioGroup>`. Renders a
 * `<div>`, indented to the same column as the item labels below it.
 *
 * It must be inside one of those two — the association is what makes it a
 * heading rather than a line of text, and Base UI throws rather than render an
 * unassociated one. For a caption that names the whole menu, use a separator
 * and an ordinary `<Menu.Group>` around the rows it introduces.
 */
export const MenuGroupLabel = React.forwardRef<
  HTMLDivElement,
  MenuGroupLabelProps
>(function MenuGroupLabel({ className, ...props }, ref) {
  return (
    <BaseMenu.GroupLabel
      ref={ref}
      className={clsx(styles.groupLabel, className)}
      data-forte="menu-group-label"
      {...props}
    />
  );
});

type BaseSeparatorProps = React.ComponentPropsWithoutRef<
  typeof BaseMenu.Separator
>;

export interface MenuSeparatorProps
  extends Omit<BaseSeparatorProps, "className"> {
  /**
   * Orientation of the rule. A menu is a vertical list, so the divider
   * between two runs of items is horizontal.
   * @default "horizontal"
   */
  orientation?: BaseSeparatorProps["orientation"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A divider between runs of items. Renders a `<div>` with `role="separator"`,
 * so the grouping it draws is exposed to assistive technology rather than
 * being a purely visual line.
 */
export const MenuSeparator = React.forwardRef<
  HTMLDivElement,
  MenuSeparatorProps
>(function MenuSeparator({ className, ...props }, ref) {
  return (
    <BaseMenu.Separator
      ref={ref}
      className={clsx(styles.separator, className)}
      data-forte="menu-separator"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Submenu
 * ---------------------------------------------------------------------- */

export interface MenuSubmenuRootProps extends BaseMenu.SubmenuRoot.Props {
  /**
   * The submenu's `<Menu.SubmenuTrigger>` and its `<Menu.Popup>`.
   */
  children?: React.ReactNode;
}

/**
 * Groups a submenu's trigger and popup. Renders no DOM element of its own, so
 * it accepts neither `className` nor `ref`.
 *
 * It goes *inside* the parent `<Menu.Popup>`, where its trigger takes the
 * place of an item. Everything below it opens sideways rather than downward —
 * `<Menu.Popup>` reads that from here, so a submenu needs no positioning props
 * of its own.
 */
export function MenuSubmenuRoot({
  children,
  ...props
}: MenuSubmenuRootProps): React.JSX.Element {
  return (
    <MenuPlacementContext.Provider value="submenu">
      <BaseMenu.SubmenuRoot {...props}>{children}</BaseMenu.SubmenuRoot>
    </MenuPlacementContext.Provider>
  );
}

export interface MenuSubmenuTriggerProps
  extends Omit<BaseMenu.SubmenuTrigger.Props, "className"> {
  /**
   * The row's label.
   */
  children?: React.ReactNode;
  /**
   * The affordance at the end of the row. Defaults to a chevron, which is
   * mirrored in RTL so it keeps pointing at the side the submenu opens on.
   * @default <ChevronIcon />
   */
  icon?: React.ReactNode;
  /**
   * Whether the row ignores user interaction.
   * @default false
   */
  disabled?: BaseMenu.SubmenuTrigger.Props["disabled"];
  /**
   * Plain-text label used for typeahead when `children` is not a string.
   */
  label?: BaseMenu.SubmenuTrigger.Props["label"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The row that opens a submenu. Renders a `<div>` with `role="menuitem"` and
 * `aria-haspopup="menu"`.
 *
 * It behaves as an item in every other way — it is highlighted, it answers
 * typeahead, and it opens on hover as well as on press, with Base UI's safe
 * triangle keeping the submenu up while the pointer travels diagonally toward
 * it.
 */
export const MenuSubmenuTrigger = React.forwardRef<
  HTMLDivElement,
  MenuSubmenuTriggerProps
>(function MenuSubmenuTrigger({ children, icon, className, ...props }, ref) {
  return (
    <BaseMenu.SubmenuTrigger
      ref={ref}
      className={clsx(
        styles.item,
        styles.submenuTrigger,
        "forte-focus-ring",
        className,
      )}
      data-forte="menu-submenu-trigger"
      data-focus-inset=""
      {...props}
    >
      {children}
      <span className={styles.submenuIcon} data-forte="menu-submenu-icon">
        {icon ?? <ChevronIcon />}
      </span>
    </BaseMenu.SubmenuTrigger>
  );
});

/* -------------------------------------------------------------------------
 * Shortcut
 * ---------------------------------------------------------------------- */

export interface MenuShortcutProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  /**
   * The keys, written the way they are printed — `⌘K`, `Ctrl+K`, `⇧⌘P`.
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The keyboard shortcut printed at the end of a row. Renders a `<span>` that
 * owns the row position — pushed to the trailing edge, never truncated — and
 * draws the keys themselves in a composed `Kbd`, so a menu's caps and a
 * tooltip's are the same cap. It is not a Base UI part; it is here for the
 * same reason `Dialog.Footer` is: every second menu grows one, and left to
 * each consumer it is re-invented with a different colour and a different gap
 * each time.
 *
 * It is `aria-hidden`, deliberately. The glyphs menus print are read out as
 * "place of interest sign K" or "up arrowhead command P" — worse than silence.
 * Put the shortcut on the item instead, where assistive technology expects to
 * find it and where it is spelled in words:
 *
 * ```tsx
 * <Menu.Item aria-keyshortcuts="Meta+K">
 *   Search
 *   <Menu.Shortcut>⌘K</Menu.Shortcut>
 * </Menu.Item>
 * ```
 */
export const MenuShortcut = React.forwardRef<HTMLSpanElement, MenuShortcutProps>(
  function MenuShortcut({ className, children, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={clsx(styles.shortcut, className)}
        data-forte="menu-shortcut"
        aria-hidden="true"
        {...props}
      >
        <Kbd>{children}</Kbd>
      </span>
    );
  },
);

/* -------------------------------------------------------------------------
 * Compound export
 * ---------------------------------------------------------------------- */

/**
 * A dropdown menu built on Base UI's unstyled `Menu` primitives.
 *
 * ```tsx
 * <Menu.Root>
 *   <Menu.Trigger>Actions</Menu.Trigger>
 *   <Menu.Popup>
 *     <Menu.Item onClick={duplicate}>Duplicate</Menu.Item>
 *     <Menu.Separator />
 *     <Menu.Item tone="danger" onClick={remove}>Delete</Menu.Item>
 *   </Menu.Popup>
 * </Menu.Root>
 * ```
 *
 * Styling is driven entirely by `data-*` attributes and `--forte-menu-*` custom
 * properties, so it can be re-skinned from plain CSS or targeted with Tailwind
 * arbitrary variants (`data-[highlighted]:...`) without wrapping. Each part
 * declares its own knobs, so an ancestor's value is only inherited and loses —
 * set them on the part itself via `className`. The popup is portalled to
 * `<body>` as well, so an ancestor of the trigger could not reach it in any
 * case; `positionerClassName` reaches `--forte-menu-z-index`, the only property
 * declared on the positioner. The global `--forte-color-*` / `--forte-control-*` /
 * `--forte-radius-*` / `--forte-space-*` tokens these resolve to ARE inherited, so
 * re-pointing those from `:root` or a theme scope moves every menu at once.
 */
export const Menu = {
  Root: MenuRoot,
  Trigger: MenuTrigger,
  Popup: MenuPopup,
  Item: MenuItem,
  LinkItem: MenuLinkItem,
  CheckboxItem: MenuCheckboxItem,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Group: MenuGroup,
  GroupLabel: MenuGroupLabel,
  Separator: MenuSeparator,
  SubmenuRoot: MenuSubmenuRoot,
  SubmenuTrigger: MenuSubmenuTrigger,
  Shortcut: MenuShortcut,
  /**
   * Creates a handle that lets a trigger rendered outside `Menu.Root` open it
   * — a toolbar button and its menu living in different parts of the tree.
   * Call it once, outside render, and pass the result to both.
   */
  createHandle: BaseMenu.createHandle,
};
