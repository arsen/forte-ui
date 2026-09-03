"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import styles from "./Steps.module.css";

export type StepsOrientation = "horizontal" | "vertical";
export type StepsLabelPlacement = "inline" | "below";
export type StepsSize = "sm" | "md" | "lg";
export type StepsVariant = "solid" | "outline" | "dot";
export type StepsTone = "primary" | "secondary" | "success" | "neutral";
export type StepsStatus = "incomplete" | "active" | "complete" | "error";

/**
 * The words a screen reader hears after a step's number, for the two states
 * the visuals carry with an icon alone.
 */
export interface StepsLabels {
  /**
   * Read for a completed step, where the visual cue is the check mark.
   * @default "Completed"
   */
  complete?: string;
  /**
   * Read for a step in an error state, where the visual cue is the mark and
   * the danger color.
   * @default "Has an error"
   */
  error?: string;
}

/* -------------------------------------------------------------------------
 * Contexts
 *
 * Three, because three different things need to be known at three different
 * depths. `Root` publishes `current` and the status words; the index of each
 * item is stamped by `Root` onto the item's slot, so a step never has to be
 * told its own number; and `Item` resolves the two into a status that its
 * `Indicator` and `Trigger` both read — the indicator to pick an icon, the
 * trigger to set `aria-current`.
 * ---------------------------------------------------------------------- */

const StepsContext = React.createContext<{
  current: number | undefined;
  labels: Required<StepsLabels>;
}>({ current: undefined, labels: { complete: "Completed", error: "Has an error" } });

const StepIndexContext = React.createContext(0);

const StepItemContext = React.createContext<{
  index: number;
  status: StepsStatus;
  disabled: boolean;
}>({ index: 0, status: "incomplete", disabled: false });

/* -------------------------------------------------------------------------
 * Icons
 *
 * Both are drawn on with `pathLength="1"`, so the stylesheet can run
 * `stroke-dashoffset` from 1 to 0 over a DURATION token — the check draws
 * itself in rather than fading. A duration, not a travel or scale token, on
 * purpose: those collapse under reduced motion, and the mark is information
 * (it is what separates "done" from "here" once the fill colors match).
 * ---------------------------------------------------------------------- */

function CheckIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="m3.5 8.5 3 3 6-7" pathLength="1" />
    </svg>
  );
}

function ErrorIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M8 3.5v5.5" pathLength="1" />
      <path d="M8 12.5h.01" pathLength="1" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface StepsRootProps
  extends Omit<React.ComponentPropsWithoutRef<"ol">, "className"> {
  /**
   * Which way the steps run. `"vertical"` stacks them with the connector
   * running down the side, which is the layout for a step that carries
   * content of its own — a form section, a set of actions — under its title.
   * @default "horizontal"
   */
  orientation?: StepsOrientation;
  /**
   * Where a horizontal step's title sits. `"inline"` puts it beside the
   * indicator, with the connector filling the space to the next step.
   * `"below"` centers it under the indicator and gives every step an equal
   * share of the row — the layout for a short wizard whose titles are one or
   * two words. Ignored when `orientation="vertical"`.
   * @default "inline"
   */
  labelPlacement?: StepsLabelPlacement;
  /**
   * Indicator diameter and text size for the whole list.
   * @default "md"
   */
  size?: StepsSize;
  /**
   * How the indicator is drawn. `"solid"` fills every indicator. `"outline"`
   * rings a step until it is done, so the filled circles are exactly the
   * completed ones. `"dot"` shrinks the indicator to a plain dot with no
   * number in it — a timeline rather than a numbered list.
   * @default "solid"
   */
  variant?: StepsVariant;
  /**
   * Which semantic color the active and completed steps draw from. The
   * error state is always `danger`, and the steps not yet reached stay
   * neutral in every tone, so the color only ever says "this far".
   * @default "primary"
   */
  tone?: StepsTone;
  /**
   * The zero-based index of the step the user is on. Every step before it
   * becomes `complete`, it becomes `active`, and every step after it stays
   * `incomplete` — a wizard sets this one number and nothing else. Leave it
   * unset to drive each step's `status` by hand, for a list that is not a
   * straight line.
   */
  current?: number;
  /**
   * The words read after a step's number for the states the visuals carry
   * with an icon alone. Override to localise them.
   */
  labels?: StepsLabels;
  /**
   * Replaces the rendered `<ol>` with another element or component.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The list of steps. Renders an `<ol>`.
 *
 * ```tsx
 * <Steps.Root current={1}>
 *   <Steps.Item>
 *     <Steps.Indicator />
 *     <Steps.Title>Account</Steps.Title>
 *   </Steps.Item>
 *   <Steps.Item>
 *     <Steps.Indicator />
 *     <Steps.Title>Address</Steps.Title>
 *   </Steps.Item>
 * </Steps.Root>
 * ```
 *
 * Numbering is positional: the root stamps an index onto each direct child,
 * which is what `Indicator` prints and what `current` is compared against.
 * `React.Children.toArray` drops `null` children before the count is taken,
 * so a conditionally rendered step does not leave a gap in the numbers — but
 * a fragment counts as one child, so steps go in as direct children or as an
 * array, not wrapped in `<>…</>`.
 */
export const StepsRoot = React.forwardRef<HTMLOListElement, StepsRootProps>(
  function StepsRoot(
    {
      orientation = "horizontal",
      labelPlacement = "inline",
      size = "md",
      variant = "solid",
      tone = "primary",
      current,
      labels,
      render,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const complete = labels?.complete ?? "Completed";
    const error = labels?.error ?? "Has an error";
    const context = React.useMemo(
      () => ({ current, labels: { complete, error } }),
      [current, complete, error],
    );

    const items = React.Children.toArray(children).map((child, index) => (
      <StepIndexContext.Provider
        key={React.isValidElement(child) && child.key !== null ? child.key : index}
        value={index}
      >
        {child}
      </StepIndexContext.Provider>
    ));

    const element = useRender({
      render,
      ref,
      defaultTagName: "ol",
      props: {
        className: clsx(styles.root, className),
        "data-forte": "steps",
        "data-orientation": orientation,
        "data-label-placement": labelPlacement,
        "data-size": size,
        "data-variant": variant,
        "data-tone": tone,
        ...props,
        children: items,
      },
    });

    return <StepsContext.Provider value={context}>{element}</StepsContext.Provider>;
  },
);

/* -------------------------------------------------------------------------
 * Item
 * ---------------------------------------------------------------------- */

export interface StepsItemProps
  extends Omit<React.ComponentPropsWithoutRef<"li">, "className"> {
  /**
   * This step's state, when it is not the one `current` on the root would
   * give it. `"error"` is the usual reason — a step the user went past that
   * failed validation — but any of the four can be set, and a root with no
   * `current` is driven entirely by these.
   */
  status?: StepsStatus;
  /**
   * Disables the step's `Trigger`, if it has one, and marks the step
   * `data-disabled` for styling. A step without a trigger has nothing to
   * disable, so this only dims it.
   * @default false
   */
  disabled?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One step's `<li>`. It resolves the step's status — the `status` prop if
 * given, otherwise its position against the root's `current` — and carries
 * it as `data-status` for everything below to style against.
 *
 * The item also draws the connector to the next step, as a sibling of the
 * step's content rather than a sibling of the item, so the connector's
 * color follows THIS step's status: the line after a completed step fills,
 * which is the only rule that reads the same whether the steps run across
 * or down.
 *
 * Put a `Steps.Trigger` inside to make the step clickable. The item notices
 * and leaves the trigger to carry `aria-current`, so the current step is
 * announced when the button takes focus rather than only when the list is
 * walked.
 */
export const StepsItem = React.forwardRef<HTMLLIElement, StepsItemProps>(
  function StepsItem({ status: statusProp, disabled = false, className, children, ...props }, ref) {
    const { current } = React.useContext(StepsContext);
    const index = React.useContext(StepIndexContext);

    const derived: StepsStatus =
      current === undefined
        ? "incomplete"
        : index < current
          ? "complete"
          : index === current
            ? "active"
            : "incomplete";
    const status = statusProp ?? derived;

    const nodes = React.Children.toArray(children);
    const interactive = nodes.some(
      (child) => React.isValidElement(child) && child.type === StepsTrigger,
    );

    const item = React.useMemo(
      () => ({ index, status, disabled }),
      [index, status, disabled],
    );

    return (
      <StepItemContext.Provider value={item}>
        <li
          ref={ref}
          className={clsx(styles.item, className)}
          data-forte="steps-item"
          data-status={status}
          data-disabled={disabled || undefined}
          data-interactive={interactive || undefined}
          // On the trigger instead when there is one — see the doc comment.
          aria-current={!interactive && status === "active" ? "step" : undefined}
          {...props}
        >
          {interactive ? (
            nodes
          ) : (
            <div className={styles.body} data-forte="steps-body">
              {nodes}
            </div>
          )}
          {/* Decorative: the order of the list is the information, and the
            * line only repeats it. Rendered on every item and hidden on the
            * last by the stylesheet, so a step added at the end needs no
            * re-render of its neighbour. */}
          <span className={styles.connector} data-forte="steps-connector" aria-hidden="true" />
        </li>
      </StepItemContext.Provider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

export interface StepsTriggerProps
  extends Omit<React.ComponentPropsWithoutRef<"button">, "className"> {
  /**
   * Replaces the rendered `<button>` with another element or component —
   * `render={<Link href="/checkout/address" />}` when each step is a route.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Makes a step clickable. Wrap the `Indicator` and `Title` in it, and the
 * whole of the step's face becomes one `<button>` — so a reader can jump
 * back to a completed step, or ahead in a wizard that allows it.
 *
 * ```tsx
 * <Steps.Item>
 *   <Steps.Trigger onClick={() => go(0)}>
 *     <Steps.Indicator />
 *     <Steps.Title>Account</Steps.Title>
 *   </Steps.Trigger>
 * </Steps.Item>
 * ```
 *
 * It takes `disabled` from its item, and `aria-current="step"` when the step
 * is the active one. `type="button"` is set so a stepper inside a form does
 * not submit it.
 */
export const StepsTrigger = React.forwardRef<HTMLButtonElement, StepsTriggerProps>(
  function StepsTrigger({ render, className, children, ...props }, ref) {
    const { status, disabled } = React.useContext(StepItemContext);

    return useRender({
      render,
      ref,
      defaultTagName: "button",
      props: {
        type: "button",
        className: clsx(styles.trigger, "forte-focus-ring", className),
        "data-forte": "steps-trigger",
        "data-status": status,
        "data-disabled": disabled || undefined,
        disabled: disabled || undefined,
        "aria-current": status === "active" ? ("step" as const) : undefined,
        ...props,
        // The same grid the non-interactive item lays its face out on, so the
        // two look identical and the connector maths below holds for both.
        children: (
          <span className={styles.body} data-forte="steps-body">
            {children}
          </span>
        ),
      },
    });
  },
);

/* -------------------------------------------------------------------------
 * Indicator
 * ---------------------------------------------------------------------- */

export interface StepsIndicatorProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The circle. Empty, it prints the step's number and swaps it for a check
 * when the step completes or a mark when it errors — the number stays in
 * the DOM underneath, so the swap is a fade and the check can draw itself
 * on. Give it children — an icon — and they are shown in every state; the
 * fill color still carries the status.
 *
 * The two icon states also get a visually hidden word (`labels` on the
 * root), because a check mark has no text of its own and a screen reader
 * would otherwise hear "1 Account" for a done step and an undone one alike.
 */
export const StepsIndicator = React.forwardRef<HTMLSpanElement, StepsIndicatorProps>(
  function StepsIndicator({ className, children, ...props }, ref) {
    const { index, status } = React.useContext(StepItemContext);
    const { labels } = React.useContext(StepsContext);

    const word =
      status === "complete" ? labels.complete : status === "error" ? labels.error : null;

    return (
      <span
        ref={ref}
        className={clsx(styles.indicator, className)}
        data-forte="steps-indicator"
        data-status={status}
        {...props}
      >
        {children ?? (
          <>
            <span className={styles.number}>{index + 1}</span>
            <CheckIcon className={styles.check} />
            <ErrorIcon className={styles.error} />
          </>
        )}
        {word && <span className="forte-visually-hidden">{word}</span>}
      </span>
    );
  },
);

/* -------------------------------------------------------------------------
 * Title
 * ---------------------------------------------------------------------- */

export interface StepsTitleProps
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
 * The step's name. A `<span>` rather than a heading, because a step title
 * inside a `Trigger` sits inside a `<button>`, where only phrasing content
 * is allowed — and because the list already gives it structure.
 */
export const StepsTitle = React.forwardRef<HTMLSpanElement, StepsTitleProps>(
  function StepsTitle({ render, className, ...props }, ref) {
    return useRender({
      render,
      ref,
      defaultTagName: "span",
      props: {
        className: clsx(styles.title, className),
        "data-forte": "steps-title",
        ...props,
      },
    });
  },
);

/* -------------------------------------------------------------------------
 * Description
 * ---------------------------------------------------------------------- */

export interface StepsDescriptionProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Replaces the rendered `<div>` with another element or component. Pass
   * `render={<span />}` inside a `Trigger`, where a `<div>` is not valid
   * content for the button.
   */
  render?: useRender.RenderProp;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Whatever sits under the title: a one-line caption, or — in a vertical
 * list — the step's own content, a form section with its buttons. A
 * `<div>`, so block content is legal in it. In the vertical orientation
 * the connector runs alongside it for its full height.
 */
export const StepsDescription = React.forwardRef<HTMLDivElement, StepsDescriptionProps>(
  function StepsDescription({ render, className, ...props }, ref) {
    return useRender({
      render,
      ref,
      defaultTagName: "div",
      props: {
        className: clsx(styles.description, className),
        "data-forte": "steps-description",
        ...props,
      },
    });
  },
);

/**
 * A sequence of steps and where the user is in it — the header of a wizard,
 * or the progress of an order.
 *
 * ```tsx
 * <Steps.Root current={1}>
 *   <Steps.Item>
 *     <Steps.Indicator />
 *     <Steps.Title>Account</Steps.Title>
 *   </Steps.Item>
 *   <Steps.Item>
 *     <Steps.Indicator />
 *     <Steps.Title>Address</Steps.Title>
 *     <Steps.Description>Where to send it</Steps.Description>
 *   </Steps.Item>
 *   <Steps.Item>
 *     <Steps.Indicator />
 *     <Steps.Title>Review</Steps.Title>
 *   </Steps.Item>
 * </Steps.Root>
 * ```
 *
 * `current` is one number: every step before it is complete, that step is
 * active, and the rest are still to come. A step that needs a state of its
 * own — an error — sets `status` on its `Item`. Wrap a step's parts in a
 * `Trigger` to make it a button.
 *
 * Styling is driven entirely by `data-*` attributes and `--forte-steps-*`
 * custom properties, so it can be re-skinned from plain CSS or targeted with
 * Tailwind arbitrary variants (`data-[status=complete]:...`) without
 * wrapping.
 *
 * @summary A numbered sequence of steps and the user's position in it — a
 *   wizard header or an order's progress; for a single fraction done, use
 *   Progress instead.
 * @category Navigation
 */
export const Steps = {
  Root: StepsRoot,
  Item: StepsItem,
  Trigger: StepsTrigger,
  Indicator: StepsIndicator,
  Title: StepsTitle,
  Description: StepsDescription,
};
