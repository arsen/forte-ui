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
   * A label set into the line — `or` between two ways to sign in, a date
   * between two runs of messages. The rule splits around it, one half either
   * side, in both orientations. Text is the usual case, but anything
   * renders: an icon, a `Badge`, a `Kbd`.
   *
   * A labeled rule is also *named* by its label. The root gets
   * `aria-labelledby` pointing at it, so a screen reader announces the label
   * as the separator's name instead of passing over it — `separator` is a
   * role whose children are presentational, so text left loose inside one is
   * not guaranteed to be exposed at all. Pass an `aria-label` or
   * `aria-labelledby` of your own to name it differently. Under `decorative`
   * there is no name to give: the role goes, and the label stays in the tree
   * as plain text.
   *
   * Not with `render={<hr />}` — `<hr>` is a void element and cannot hold
   * one.
   */
  children?: React.ReactNode;
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
 * <Separator>or</Separator>
 * ```
 *
 * A vertical separator has no length of its own — it is an empty box. Inside a
 * flex row it stretches to the tallest sibling; anywhere else it falls back to
 * one line's height, which `--forte-separator-min-length` controls. That is the
 * one thing worth knowing before reaching for it:
 *
 * ```tsx
 * <div style={{ display: "flex", alignItems: "center", gap: "var(--forte-space-3)" }}>
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
 * Every visual decision is a `--forte-separator-*` custom property, and the
 * orientation is on `data-orientation` — with `data-labeled` beside it when
 * there is a label — so it can be re-skinned from plain CSS or targeted with
 * Tailwind arbitrary variants (`data-[orientation=vertical]:...`) without
 * wrapping.
 *
 * @summary A rule between things, horizontal or vertical, optionally with a
 *   label set into the line; announced to assistive technology unless marked
 *   decorative.
 * @category Content & layout
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator(
    {
      orientation = "horizontal",
      variant = "solid",
      decorative = false,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const labelId = React.useId();

    /* `false` counts as no label, not only `null`: `{show && "or"}` is the
     * ordinary way to make one conditional, and a `false` child has to leave
     * a plain rule rather than an empty label with a gap either side of it. */
    const labeled = children != null && typeof children !== "boolean";

    /* Name the rule after its label — but only when nothing else does, and
     * never on the decorative path. `aria-labelledby` outranks `aria-label`
     * in name computation, so setting it unconditionally would silently
     * replace a caller's own label; a caller's `aria-labelledby` needs no
     * check, since the `{...props}` spread below already overrides ours. And
     * it is a GLOBAL attribute: on a `role="none"` element it triggers
     * presentational-role conflict resolution, which ignores the `none` and
     * puts the separator straight back into the tree that `decorative` just
     * took it out of. */
    const named = labeled && !decorative && props["aria-label"] == null;

    return (
      <BaseSeparator
        ref={ref}
        orientation={orientation}
        className={clsx(styles.root, className)}
        data-forte="separator"
        data-variant={variant}
        data-labeled={labeled || undefined}
        aria-labelledby={named ? labelId : undefined}
        {...(decorative ? DECORATIVE_PROPS : null)}
        {...props}
      >
        {labeled ? (
          <span className={styles.label} data-forte="separator-label" id={labelId}>
            {children}
          </span>
        ) : null}
      </BaseSeparator>
    );
  },
);
