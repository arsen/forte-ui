"use client";

import * as React from "react";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";
import { clsx } from "clsx";
import styles from "./Menubar.module.css";

export type MenubarVariant = "plain" | "contained";
export type MenubarOrientation = "horizontal" | "vertical";

type BaseMenubarProps = React.ComponentPropsWithoutRef<typeof BaseMenubar>;

export interface MenubarProps extends Omit<BaseMenubarProps, "className"> {
  /**
   * The `<Menu.Root>`s that make up the bar, and any
   * `<Menu.Separator orientation="vertical">` between them.
   */
  children?: React.ReactNode;
  /**
   * How loud the bar itself is. `plain` draws nothing — the strip is the
   * menus, which is what an application menu bar sitting under a title bar
   * should look like. `contained` puts it on a panel with a hairline, for a
   * bar that has to read as its own toolbar inside a busier page.
   * @default "plain"
   */
  variant?: MenubarVariant;
  /**
   * Which way the bar runs. `vertical` is a sidebar of menus, and each one
   * still opens below its trigger — pass `side="inline-end"` to the popups if
   * they should open alongside instead.
   *
   * It is also what Base UI reports as `aria-orientation`, and it decides
   * which arrow keys move between triggers.
   * @default "horizontal"
   */
  orientation?: MenubarOrientation;
  /**
   * Whether an open menu locks page scroll and blocks pointer interaction
   * with the rest of the document. On by default, which is what a desktop
   * menu bar does — and what makes clicking anywhere else close the menu
   * rather than act.
   * @default true
   */
  modal?: BaseMenubarProps["modal"];
  /**
   * Whether every menu in the bar ignores user interaction. Base UI hands
   * this down to each `<Menu.Trigger>`, so they all report `data-disabled`
   * without being given the prop individually.
   * @default false
   */
  disabled?: BaseMenubarProps["disabled"];
  /**
   * Whether the arrow keys wrap from the last trigger back to the first.
   * @default true
   */
  loopFocus?: BaseMenubarProps["loopFocus"];
  /**
   * Replaces the rendered `<div>` with another element or component — a
   * `<header>` for an application chrome bar, say. Base UI still applies
   * `role="menubar"` and the keyboard behaviour to whatever comes back.
   */
  render?: BaseMenubarProps["render"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A row of menus that behave as one strip, built on Base UI's `Menubar`
 * primitive.
 *
 * It has no parts of its own: the menus inside it are ordinary
 * [`Menu`](/components/menu) components, which is Base UI's own anatomy and
 * is what makes every Menu feature — submenus, checkable rows, shortcuts,
 * `render` on the trigger — available here without a second set of
 * components to learn.
 *
 * ```tsx
 * <Menubar>
 *   <Menu.Root>
 *     <Menu.Trigger>File</Menu.Trigger>
 *     <Menu.Popup>
 *       <Menu.Item>New document</Menu.Item>
 *       <Menu.Item>Open…</Menu.Item>
 *     </Menu.Popup>
 *   </Menu.Root>
 *   <Menu.Root>
 *     <Menu.Trigger>Edit</Menu.Trigger>
 *     <Menu.Popup>
 *       <Menu.Item>Undo</Menu.Item>
 *     </Menu.Popup>
 *   </Menu.Root>
 * </Menubar>
 * ```
 *
 * Being in the bar is what changes the menus' behaviour, and Base UI does all
 * of it: `Tab` reaches the bar once and the arrow keys move between triggers
 * from there, and once one menu is open the others take over on hover, so the
 * whole row reads as a single control rather than a line of buttons. The
 * library's contribution is the look — a `<Menu.Trigger>` inside a `Menubar`
 * drops its standalone button chrome for the flat strip item the bar wants.
 * A trigger given `render` keeps whatever it was rendered as.
 *
 * Every visual decision is a `--forte-menubar-*` custom property declared on
 * this element, including the ones the triggers read, so a bar can be
 * re-skinned from plain CSS or targeted with Tailwind arbitrary variants
 * (`data-[variant=contained]:...`) without wrapping.
 *
 * @summary A row of Menus that behave as one strip — the application menu bar.
 * @category Overlays
 */
export const Menubar = React.forwardRef<HTMLDivElement, MenubarProps>(
  function Menubar(
    { variant = "plain", orientation = "horizontal", disabled, className, ...props },
    ref,
  ) {
    return (
      <BaseMenubar
        ref={ref}
        orientation={orientation}
        disabled={disabled}
        className={clsx(styles.root, className)}
        data-forte="menubar"
        data-variant={variant}
        /* Base UI's own state attributes are `data-orientation`, `data-modal`
         * and `data-has-submenu-open` — there is no `data-disabled` among
         * them, because the prop is handed to the triggers rather than
         * marking the bar. Adding it keeps the house rule true (state lives on
         * `data-*`) and is the only way a consumer can grey the strip itself. */
        data-disabled={disabled ? "" : undefined}
        {...props}
      />
    );
  },
);
