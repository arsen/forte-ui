"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import styles from "./Badge.module.css";

export type BadgeVariant = "solid" | "soft" | "outline" | "ghost";
export type BadgeTone =
  | "primary"
  | "secondary"
  | "neutral"
  | "danger"
  | "success"
  | "warning"
  | "info";
export type BadgeSize = "sm" | "md" | "lg";
export type BadgeShape = "rounded" | "pill";

export interface BadgeProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  /**
   * How much visual weight the badge carries.
   *
   * `soft` is the default because a badge annotates something else on the
   * page and should not outrank it — a row of solid chips down a table column
   * reads as the content rather than as labels on it. Reach for `solid` when
   * the badge IS the message, which is usually a count or a single alarm.
   * @default "soft"
   */
  variant?: BadgeVariant;
  /**
   * Which semantic colour set the badge draws from. Combines freely with
   * `variant` — every pairing is a complete colour set, so
   * `tone="success" variant="outline"` needs nothing added to work.
   *
   * The four status tones are the reason this component has seven rather than
   * the four `Button` has: a badge is where an app says "Active", "Pending",
   * "Failed", and an app that has to reach for a hex value to say it has lost
   * theming, dark mode and forced-colors support in one line.
   * @default "primary"
   */
  tone?: BadgeTone;
  /**
   * Size of the badge. The three differ mostly in how much air surrounds the
   * label: the type scale bottoms out at `--forte-font-size-1`, so `sm` and
   * `md` share it and `lg` steps up.
   *
   * Unlike a control, a badge is not resized by `data-forte-density` — its
   * height comes from the text it sits beside, which is the thing it should
   * track.
   * @default "md"
   */
  size?: BadgeSize;
  /**
   * Corner treatment. `rounded` follows `--forte-radius-control`, so it moves
   * with a `data-forte-radius` preset like everything else; `pill` is fully
   * round, which is the conventional shape for a count.
   * @default "rounded"
   */
  shape?: BadgeShape;
  /**
   * Draw a small filled dot before the label — the status-chip convention.
   *
   * It is decorative and `aria-hidden`: the status is in the words. A dot
   * that carried meaning on its own would be colour as the sole cue, which is
   * the failure (SC 1.4.1) this component is otherwise careful to avoid.
   * @default false
   */
  dot?: boolean;
  /**
   * The number this badge is showing — an unread tally, a pending count.
   *
   * Passing it does two separate things. It renders the number (capped by
   * `max`), and it switches the badge to count geometry: figures stop changing
   * width as the tally ticks over, the inline padding tightens, and the badge
   * takes a minimum inline size equal to its own height. That last pair is
   * what makes a single digit a circle rather than a slot — with a word's
   * padding, `1` already measures wider than the badge is tall.
   *
   * `children` still win over the rendered number, and that is the hook for
   * anything `max` cannot express: `<Badge count={1240}>1.2k</Badge>` keeps
   * your formatting and the geometry both.
   */
  count?: number;
  /**
   * The largest number `count` will print. Above it the badge shows
   * `${max}+` instead, so a tally cannot widen the chip without limit.
   *
   * 99 matches what a notification badge conventionally does. Pass
   * `Infinity` to print the number whatever it reaches.
   * @default 99
   */
  max?: number;
  /**
   * Replaces the rendered `<span>` with another element or component.
   * `render={<a href="/releases" />}` or `render={<Link href="/inbox" />}` is
   * how a badge becomes navigable.
   *
   * There is no `interactive` prop to go with it: the styles read the element
   * itself, so an `<a href>` or a `<button>` picks up the pointer cursor, the
   * hover wash and a 24×24 hit target on its own, and a plain `<span>` never
   * pretends to be clickable.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A small label for status, counts and categories.
 *
 * Base UI has no badge primitive — there is no interaction to model and no
 * state machine to get right — so this is built on `useRender` alone, which is
 * what gives it the `render` prop the rest of the library has.
 *
 * ```tsx
 * <Badge>Beta</Badge>
 * <Badge tone="success" dot>Active</Badge>
 * <Badge variant="solid" tone="danger" shape="pill" count={12} />
 * <Badge variant="solid" tone="danger" shape="pill" count={480} />  // 99+
 * <Badge tone="neutral" variant="outline" render={<a href="/tags/css" />}>css</Badge>
 * ```
 *
 * Styling is driven by `data-*` attributes and `--forte-badge-*` custom
 * properties, so it can be re-skinned from plain CSS or targeted with Tailwind
 * arbitrary variants (`data-[tone=success]:...`) without wrapping.
 *
 * @summary A small label for status, counts and categories.
 * @category Content & layout
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  {
    variant = "soft",
    tone = "primary",
    size = "md",
    shape = "rounded",
    dot = false,
    count,
    max = 99,
    render,
    className,
    children,
    ...props
  },
  ref,
) {
  // Deliberately `String` and not `toLocaleString`: a locale-formatted number
  // is one of the few things that differs between the server's environment and
  // the browser's, and a hydration mismatch inside a badge is a page-level
  // error over a thousands separator. Pass `children` to format it yourself.
  const printed = count === undefined ? undefined : count > max ? `${max}+` : String(count);

  return useRender({
    render,
    ref,
    defaultTagName: "span",
    props: {
      className: clsx(styles.root, "forte-focus-ring", className),
      "data-forte": "badge",
      "data-variant": variant,
      "data-tone": tone,
      "data-size": size,
      "data-shape": shape,
      // The value, not a flag: `[data-count]` still selects it, and a
      // consumer who wants to style the overflowed state can reach the number
      // that produced it.
      "data-count": count,
      ...props,
      // After the spread, because the dot has to survive it: a caller passing
      // `children` through props rather than as JSX would otherwise drop the
      // dot without any sign that it had.
      children: (
        <>
          {dot ? (
            <span className={styles.dot} data-forte="badge-dot" aria-hidden="true" />
          ) : null}
          {children ?? printed}
        </>
      ),
    },
  });
});
