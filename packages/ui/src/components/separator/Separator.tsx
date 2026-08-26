"use client";

import * as React from "react";
import { Separator as BaseSeparator } from "@base-ui/react/separator";
import { clsx } from "clsx";
import styles from "./Separator.module.css";

export type SeparatorOrientation = "horizontal" | "vertical";
export type SeparatorVariant = "solid" | "dashed" | "dotted";

type BaseSeparatorProps = React.ComponentPropsWithoutRef<typeof BaseSeparator>;

/* A decorative rule is a *picture* of a boundary, not a boundary, so it should
 * not be announced. Base UI hardcodes `role="separator"` and
 * `aria-orientation`, but it merges its own props BEFORE the caller's, so both
 * can be overridden from here.
 *
 * Two details make this work, and both are easy to get wrong:
 *
 *   - The merge iterates own keys, so `"aria-orientation": undefined` is a
 *     key that IS present and does overwrite; React then omits an attribute
 *     whose value is undefined. Simply leaving the key out would keep Base
 *     UI's value instead.
 *   - Which is also why this is a separate object spread conditionally, rather
 *     than `role={decorative ? "none" : undefined}` inline: that spelling puts
 *     `role: undefined` in the props on the NON-decorative path and silently
 *     strips `role="separator"` from every ordinary separator.
 *
 * `aria-orientation` is not a global ARIA attribute, so leaving it in place
 * would not trigger presentational-role conflict resolution — dropping it is
 * tidiness, not a fix. `role="none"` alone is what does the work. */
const DECORATIVE_PROPS = {
  role: "none",
  "aria-orientation": undefined,
} as const;

export interface SeparatorProps extends Omit<BaseSeparatorProps, "className"> {
  /**
   * Which way the rule runs — and therefore which axis it separates. A
   * `horizontal` rule is a line across the inline axis dividing stacked
   * content; a `vertical` one is a line down the block axis dividing content
   * in a row.
   *
   * It is also what Base UI reports as `aria-orientation`, so it is a
   * semantic choice, not only a visual one.
   * @default "horizontal"
   */
  orientation?: SeparatorOrientation;
  /**
   * The line style. A rule has exactly one visual dimension, so this is the
   * whole of it: `solid` for structural divisions, `dashed` or `dotted` for
   * softer, more provisional ones (a drop zone's edge, an optional section).
   * @default "solid"
   */
  variant?: SeparatorVariant;
  /**
   * Drops `role="separator"`, leaving the line visible but absent from the
   * accessibility tree.
   *
   * Use it when the grouping is already conveyed some other way — a heading,
   * a landmark, a list — and the rule is only reinforcing it visually.
   * Announcing a boundary that the structure already communicates makes a
   * screen reader read the page's decoration out loud.
   * @default false
   */
  decorative?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A rule between things, built on Base UI's `Separator` primitive.
 *
 * ```tsx
 * <Separator />
 * <Separator orientation="vertical" />
 * ```
 *
 * A vertical separator has no length of its own — it is an empty box. Inside a
 * flex row it stretches to the tallest sibling; anywhere else it falls back to
 * one line's height, which `--pui-separator-min-length` controls. That is the
 * one thing worth knowing before reaching for it:
 *
 * ```tsx
 * <div style={{ display: "flex", alignItems: "center", gap: "var(--pui-space-3)" }}>
 *   <span>Draft</span>
 *   <Separator orientation="vertical" />
 *   <span>Edited 3m ago</span>
 * </div>
 * ```
 *
 * In prose, swap the element for the one HTML already has for this:
 *
 * ```tsx
 * <Separator render={<hr />} />
 * ```
 *
 * Every visual decision is a `--pui-separator-*` custom property, and the
 * orientation is on `data-orientation`, so it can be re-skinned from plain CSS
 * or targeted with Tailwind arbitrary variants
 * (`data-[orientation=vertical]:...`) without wrapping.
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator(
    {
      orientation = "horizontal",
      variant = "solid",
      decorative = false,
      className,
      ...props
    },
    ref,
  ) {
    return (
      <BaseSeparator
        ref={ref}
        orientation={orientation}
        className={clsx(styles.root, className)}
        data-variant={variant}
        {...(decorative ? DECORATIVE_PROPS : null)}
        {...props}
      />
    );
  },
);
