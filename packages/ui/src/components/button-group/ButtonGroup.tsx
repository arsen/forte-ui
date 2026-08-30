"use client";

import * as React from "react";
import { Separator as BaseSeparator } from "@base-ui/react/separator";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import styles from "./ButtonGroup.module.css";

export type ButtonGroupOrientation = "horizontal" | "vertical";

type BaseSeparatorProps = React.ComponentPropsWithoutRef<typeof BaseSeparator>;

/* -------------------------------------------------------------------------
 * Orientation context
 *
 * The separator's line has to run PERPENDICULAR to the group — a row gets
 * vertical seams, a column horizontal ones — and asking the consumer to keep
 * a second orientation prop in agreement with the root's is asking them to
 * get it wrong once. The root publishes its orientation; the separator flips
 * it. An explicit `orientation` on the separator still wins.
 * ---------------------------------------------------------------------- */

const ButtonGroupOrientationContext =
  React.createContext<ButtonGroupOrientation>("horizontal");

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface ButtonGroupRootProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Which way the controls fuse — a row or a column. Layout only: unlike
   * [`Toolbar`](/components/toolbar), a button group adds no keyboard
   * behaviour, so there is no arrow-key axis to move.
   * @default "horizontal"
   */
  orientation?: ButtonGroupOrientation;
  /**
   * Replaces the rendered `<div>` with another element or component.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The group container. Renders a `<div role="group">`.
 *
 * ```tsx
 * <ButtonGroup.Root aria-label="Message actions">
 *   <Button variant="outline" tone="neutral">Archive</Button>
 *   <Button variant="outline" tone="neutral">Report</Button>
 *   <Button variant="outline" tone="neutral">Snooze</Button>
 * </ButtonGroup.Root>
 * ```
 *
 * Direct children are fused: inner corners squared, one hairline between
 * neighbours, outer corners kept. The children stay ordinary components with
 * their own props — the group never reaches into them beyond that edge.
 *
 * `role="group"` has no name of its own, so give the group `aria-label` (or
 * point `aria-labelledby` at a heading) when the grouping carries meaning a
 * screen reader should hear — without one it is purely visual.
 */
export const ButtonGroupRoot = React.forwardRef<HTMLDivElement, ButtonGroupRootProps>(
  function ButtonGroupRoot(
    { orientation = "horizontal", render, className, ...props },
    ref,
  ) {
    const element = useRender({
      render,
      ref,
      defaultTagName: "div",
      props: {
        className: clsx(styles.root, className),
        "data-forte": "button-group",
        "data-orientation": orientation,
        // Before the spread, so a consumer who nests groups can demote the
        // inner ones to `role="presentation"` and keep the announced tree to
        // one group.
        role: "group",
        ...props,
      },
    });

    return (
      <ButtonGroupOrientationContext.Provider value={orientation}>
        {element}
      </ButtonGroupOrientationContext.Provider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Separator
 * ---------------------------------------------------------------------- */

export interface ButtonGroupSeparatorProps
  extends Omit<BaseSeparatorProps, "className"> {
  /**
   * Which way the line runs. Defaults to the *opposite* of the group's
   * orientation — a row gets vertical seams — which is almost always what you
   * want, so leave it unset.
   */
  orientation?: ButtonGroupOrientation;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The seam between two fused controls that have no visible border of their
 * own. Renders a `<div role="separator">`.
 *
 * Reach for it between `solid` or `soft` buttons — fused bare they read as
 * one unbroken slab of colour. `outline` neighbours need none: their own
 * borders already draw the seam, and a separator there doubles the line.
 */
export const ButtonGroupSeparator = React.forwardRef<
  HTMLDivElement,
  ButtonGroupSeparatorProps
>(function ButtonGroupSeparator({ orientation, className, ...props }, ref) {
  const groupOrientation = React.useContext(ButtonGroupOrientationContext);

  return (
    <BaseSeparator
      ref={ref}
      orientation={
        orientation ?? (groupOrientation === "horizontal" ? "vertical" : "horizontal")
      }
      className={clsx(styles.separator, className)}
      data-forte="button-group-separator"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Text
 * ---------------------------------------------------------------------- */

export interface ButtonGroupTextProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Replaces the rendered `<div>` with another element or component — pass
   * `render={<label htmlFor="…" />}` when the cell names the input fused
   * beside it, so clicking it focuses the field.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A non-interactive cell fused in with the controls — a unit, a prefix, a
 * count. Renders a `<div>`.
 *
 * It has no height of its own on purpose: the group stretches it to match
 * whatever control it sits beside, so one cell serves every size.
 */
export const ButtonGroupText = React.forwardRef<HTMLDivElement, ButtonGroupTextProps>(
  function ButtonGroupText({ render, className, ...props }, ref) {
    return useRender({
      render,
      ref,
      defaultTagName: "div",
      props: {
        className: clsx(styles.text, className),
        "data-forte": "button-group-text",
        ...props,
      },
    });
  },
);

/* ---------------------------------------------------------------------- */

/**
 * A set of related controls fused into one visual object: inner corners
 * squared off, one hairline between neighbours, outer corners kept.
 *
 * ```tsx
 * <ButtonGroup.Root aria-label="Pagination">
 *   <Button variant="outline" tone="neutral">Previous</Button>
 *   <Button variant="outline" tone="neutral">Next</Button>
 * </ButtonGroup.Root>
 * ```
 *
 * Purely visual and semantic — it adds `role="group"` and the fused styling,
 * and no keyboard behaviour: every control keeps its own tab stop. When the
 * set should cost one Tab press instead, reach for
 * [`Toolbar`](/components/toolbar).
 *
 * Styling is driven by `data-*` attributes and `--forte-button-group-*` custom
 * properties, so it can be re-skinned from plain CSS or targeted with
 * Tailwind arbitrary variants (`data-[orientation=vertical]:...`) without
 * wrapping.
 */
export const ButtonGroup = {
  Root: ButtonGroupRoot,
  Separator: ButtonGroupSeparator,
  Text: ButtonGroupText,
};
