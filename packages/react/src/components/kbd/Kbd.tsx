"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import styles from "./Kbd.module.css";

export interface KbdProps
  extends Omit<React.ComponentPropsWithoutRef<"kbd">, "className"> {
  /**
   * The key, written the way it is printed — `⌘`, `Ctrl`, `Esc`, `F2` — or a
   * whole chord as one cap, `⌘K`. For a chord drawn as separate caps, put
   * several `Kbd`s in a `KbdGroup` instead.
   */
  children?: React.ReactNode;
  /**
   * Replaces the rendered `<kbd>` with another element or component. The
   * default tag is already the semantically right one, so reach for this only
   * when a host component needs the cap to be one of its own parts.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A key cap — the way the interface prints a key it wants pressed.
 *
 * Renders a real `<kbd>`, which is the element HTML has for exactly this, and
 * draws its fill and edge out of `currentColor`, so the same cap works in
 * running text, on `Tooltip`'s inverted popup, inside a solid `Button` and on
 * a highlighted menu row without a colour prop. `Menu.Shortcut` and
 * `Tooltip.Shortcut` are built on it; use it directly anywhere else keys
 * appear.
 *
 * ```tsx
 * Press <Kbd>⌘K</Kbd> to search.
 * <KbdGroup><Kbd>Ctrl</Kbd><Kbd>Alt</Kbd><Kbd>Del</Kbd></KbdGroup>
 * ```
 *
 * It is deliberately NOT `aria-hidden`: a cap printing a word — `Ctrl`,
 * `Esc`, `Enter` — reads out fine. The modifier glyphs do not (⌘B is
 * announced as "place of interest sign B"), so when you print glyphs, put
 * `aria-keyshortcuts` on the control the shortcut triggers, spelled in words,
 * and hide the caps — which is exactly what `Menu.Shortcut` does for you.
 *
 * @summary A keyboard key cap for shortcut hints — works in prose, tooltips,
 *   menu items and buttons.
 * @category Content & layout
 */
export const Kbd = React.forwardRef<HTMLElement, KbdProps>(function Kbd(
  { render, className, ...props },
  ref,
) {
  return useRender({
    render,
    ref,
    defaultTagName: "kbd",
    props: {
      className: clsx(styles.root, className),
      "data-forte": "kbd",
      ...props,
    },
  });
});

export interface KbdGroupProps
  extends Omit<React.ComponentPropsWithoutRef<"kbd">, "className"> {
  /**
   * The caps of the sequence — `Kbd` children, with any separator text
   * (`then`, `+`) written between them as plain text.
   */
  children?: React.ReactNode;
  /**
   * Replaces the rendered `<kbd>` wrapper with another element or component.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A chord or sequence drawn as separate caps.
 *
 * ```tsx
 * <KbdGroup><Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>P</Kbd></KbdGroup>
 * ```
 *
 * The wrapper is a `<kbd>` too — nesting caps inside one is the HTML idiom
 * for "these keys form one input". It draws nothing itself; what it owns is
 * the spacing, and the left-to-right pin that keeps `⌘ K` from laying out as
 * `K ⌘` in an RTL page while each cap stays individually correct.
 *
 * @summary A sequence of Kbds read as one shortcut (⌘ K).
 * @category Content & layout
 * @partOf Kbd
 */
export const KbdGroup = React.forwardRef<HTMLElement, KbdGroupProps>(
  function KbdGroup({ render, className, ...props }, ref) {
    return useRender({
      render,
      ref,
      defaultTagName: "kbd",
      props: {
        className: clsx(styles.group, className),
        "data-forte": "kbd-group",
        ...props,
      },
    });
  },
);
