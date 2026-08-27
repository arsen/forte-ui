"use client";

import * as React from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import { clsx } from "clsx";
import {
  MenuPlacementContext,
  MenuPopup,
  MenuItem,
  MenuLinkItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuGroup,
  MenuGroupLabel,
  MenuSeparator,
  MenuSubmenuRoot,
  MenuSubmenuTrigger,
  MenuShortcut,
} from "../menu/Menu";
import styles from "./ContextMenu.module.css";

/* -------------------------------------------------------------------------
 * Why this file is so short
 *
 * Base UI's `context-menu` entry point re-exports the Menu parts verbatim:
 * `ContextMenu.Item` and `Menu.Item` are the same function, and so are the
 * portal, the positioner, the popup and every row kind. Only `Root` and
 * `Trigger` are new — the root swaps the anchor for the pointer's position and
 * the trigger listens for a right click or a long press.
 *
 * So this component adds those two and hands the rest of the namespace back to
 * the Menu wrappers we already ship. The alternative — a second set of row
 * components with a second stylesheet — would be two definitions of one thing
 * that have to stay pixel-identical by hand, which is the drift the generators
 * in this repo exist to prevent. It also means a consumer who re-skins
 * `[data-pui="menu-item"]` re-skins both, which is what they meant.
 *
 * The one consequence to know about: rows inside a context menu carry the
 * Menu part markers (`data-pui="menu-item"`, `data-pui="menu-popup"`) and read
 * the `--pui-menu-*` knobs. Only the trigger is `--pui-context-menu-*`.
 * ---------------------------------------------------------------------- */

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface ContextMenuRootProps extends BaseContextMenu.Root.Props {
  /**
   * The `<ContextMenu.Trigger>` and its `<ContextMenu.Popup>`.
   */
  children?: React.ReactNode;
}

/**
 * Groups every part of the context menu and owns its open state. Renders no
 * DOM element of its own, so it accepts neither `className` nor `ref`.
 *
 * Forwards Base UI's own root props unchanged — `open`, `defaultOpen`,
 * `onOpenChange`, `disabled`, `orientation`, `loopFocus`,
 * `highlightItemOnHover`, `closeParentOnEsc` and `actionsRef`. Four of
 * `Menu.Root`'s props are deliberately absent, because a context menu has no
 * trigger element to hang them on: `modal` (it is always modal), `openOnHover`
 * with its `delay` / `closeDelay`, and the `handle` / `triggerId` pair.
 */
export function ContextMenuRoot({
  children,
  ...props
}: ContextMenuRootProps): React.JSX.Element {
  return (
    /* What makes `<ContextMenu.Popup>` — which is `<Menu.Popup>` — position
     * itself against the pointer instead of below a trigger. See the placement
     * table in `Menu.tsx`. */
    <MenuPlacementContext.Provider value="context-menu">
      <BaseContextMenu.Root {...props}>{children}</BaseContextMenu.Root>
    </MenuPlacementContext.Provider>
  );
}

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

export interface ContextMenuTriggerProps
  extends Omit<BaseContextMenu.Trigger.Props, "className"> {
  /**
   * The region that answers a right click or a long press — a card, a table
   * row, a canvas, a whole panel. It is ordinary content, not a control: the
   * trigger adds no styling of its own to it beyond marking it while its menu
   * is open.
   */
  children?: React.ReactNode;
  /**
   * Replaces the rendered `<div>` with another element or component —
   * `render={<tr />}` for a table row, `render={<li />}` inside a list, so the
   * trigger does not break the parent's content model.
   */
  render?: BaseContextMenu.Trigger.Props["render"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The region that opens the menu on right click or long press. Renders a
 * `<div>`.
 *
 * It takes no tab stop and carries no ARIA of its own — a region that answers a
 * right click is not a button, and saying otherwise would promise keyboard
 * behaviour it does not have. The platform's context-menu key (Shift+F10) does
 * reach it when the region happens to wrap something focusable, since the
 * `contextmenu` event that key fires bubbles; that is a bonus, not a plan.
 *
 * So: **a context menu must never be the only route to an action.** Nothing
 * announces that a region has one. Put the same commands behind a visible
 * control — a `<Menu>` button on the card is the usual answer, and the docs
 * carry a worked example.
 *
 * Left click does nothing here, so the trigger declares no cursor and lets the
 * content it wraps keep its own — text stays a caret, an image stays an arrow.
 */
export const ContextMenuTrigger = React.forwardRef<
  HTMLDivElement,
  ContextMenuTriggerProps
>(function ContextMenuTrigger({ children, className, ...props }, ref) {
  return (
    <BaseContextMenu.Trigger
      ref={ref}
      className={clsx(styles.trigger, className)}
      data-pui="context-menu-trigger"
      {...props}
    >
      {children}
    </BaseContextMenu.Trigger>
  );
});

/* -------------------------------------------------------------------------
 * Compound export
 * ---------------------------------------------------------------------- */

/**
 * A menu that opens at the pointer on right click or long press, built on Base
 * UI's unstyled `ContextMenu` primitives.
 *
 * ```tsx
 * <ContextMenu.Root>
 *   <ContextMenu.Trigger>
 *     <Card />
 *   </ContextMenu.Trigger>
 *   <ContextMenu.Popup>
 *     <ContextMenu.Item onClick={duplicate}>Duplicate</ContextMenu.Item>
 *     <ContextMenu.Separator />
 *     <ContextMenu.Item tone="danger" onClick={remove}>Delete</ContextMenu.Item>
 *   </ContextMenu.Popup>
 * </ContextMenu.Root>
 * ```
 *
 * Everything below `Trigger` is the same component `Menu` uses — Base UI's own
 * `context-menu` entry point re-exports the Menu parts, and so does this one —
 * so the popup and its rows look identical, answer the same keyboard, and are
 * themed through the same `--pui-menu-*` knobs. The trigger is the only part
 * with `--pui-context-menu-*` properties of its own.
 *
 * Treat it as an enhancement: it is undiscoverable, unreachable from the
 * keyboard, and awkward on touch, so every command in it needs a visible home
 * as well.
 */
export const ContextMenu = {
  Root: ContextMenuRoot,
  Trigger: ContextMenuTrigger,
  /* From here down these are the Menu parts, not lookalikes — see the note at
   * the top of this file. Aliasing them is what guarantees the two menus can
   * never drift apart. */
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
};
