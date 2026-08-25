"use client";

import * as React from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import { clsx } from "clsx";
import styles from "./Accordion.module.css";

export type AccordionVariant = "divided" | "contained";

type BaseRootProps<Value> = BaseAccordion.Root.Props<Value>;
type BaseItemProps = React.ComponentPropsWithoutRef<typeof BaseAccordion.Item>;
type BaseHeaderProps = React.ComponentPropsWithoutRef<typeof BaseAccordion.Header>;
type BaseTriggerProps = React.ComponentPropsWithoutRef<typeof BaseAccordion.Trigger>;
type BasePanelProps = React.ComponentPropsWithoutRef<typeof BaseAccordion.Panel>;

/**
 * The variant is chosen on `Accordion.Root` but every part below it paints
 * some of it — the item owns the card, the trigger owns the hover fill, the
 * panel owns the padding. Context carries it down so the consumer sets one
 * prop instead of four that have to agree, and so each part can publish its
 * own `data-variant` for Tailwind arbitrary variants to target.
 *
 * Passing it through context rather than a descendant selector also survives
 * a consumer wrapping their items in a `<div>`: `.root[data-variant] .item`
 * would still match there, but only by reaching across markup we do not own.
 */
const AccordionVariantContext = React.createContext<AccordionVariant>("divided");

/* -------------------------------------------------------------------------
 * Icon
 *
 * Decorative: the open state is already carried by `aria-expanded` on the
 * trigger and by the panel itself.
 *
 * A chevron pointing DOWN that rotates 180°, rather than one pointing at the
 * inline-end edge that rotates 90°. Rotation has no logical form, so an
 * inline-facing chevron would have to multiply its angle by `--pui-direction`
 * to survive RTL; a symmetric down/up flip is the same gesture in both
 * directions and needs nothing.
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

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface AccordionRootProps<Value = any>
  extends Omit<BaseRootProps<Value>, "className" | "orientation" | "loopFocus"> {
  /**
   * How much visual weight the set carries. `"divided"` is a flat list with a
   * hairline between rows; `"contained"` turns every item into a separated
   * card. Both are the same parts with different knobs — nothing moves.
   * @default "divided"
   */
  variant?: AccordionVariant;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Groups the items and owns which of them are open.
 *
 * `value` and `defaultValue` are **arrays**, even with `multiple` left off —
 * a single-open accordion is the array-of-one case, and `[]` is the legal
 * "everything closed" value. Items with no `value` of their own are given a
 * generated one, so pass `value` on the items you intend to address.
 *
 * Base UI's deprecated `orientation` and `loopFocus` props are not forwarded.
 * The APG dropped roving focus for accordions, so neither one affects
 * anything any more, and this component styles the vertical stack only.
 *
 * The `Value` generic is what an item's `value` is, defaulting to `any` as it
 * does in Base UI — items accept anything hashable, and most sets mix nothing.
 * Name it (`<Accordion.Root<string> …>`) to have `value`, `defaultValue` and
 * `onValueChange` checked against one type.
 */
function AccordionRoot<Value = any>({
  variant = "divided",
  className,
  dir,
  children,
  ...props
}: AccordionRootProps<Value>): React.JSX.Element {
  return (
    <AccordionVariantContext.Provider value={variant}>
      <BaseAccordion.Root
        className={clsx(styles.root, className)}
        // Base UI writes `dir` on this element unconditionally, from its own
        // DirectionContext — which is `ltr` unless the app mounts Base UI's
        // `DirectionProvider`. That would make the accordion the nearest
        // `dir` ancestor for everything inside it, so an accordion dropped
        // into an RTL page would become an LTR island: text back to the
        // left, chevron back to the right, and `--pui-direction` flipped to
        // 1 for any pretty-ui component rendered in a panel. This library
        // reads the `dir` ATTRIBUTE rather than a React context precisely so
        // it works in either kind of app, so the attribute has to come from
        // the consumer or not at all. Passing `dir` through explicitly
        // overrides Base UI's copy — including with `undefined`, which drops
        // the attribute and lets the nearest real one win again.
        dir={dir}
        data-variant={variant}
        {...props}
      >
        {children}
      </BaseAccordion.Root>
    </AccordionVariantContext.Provider>
  );
}

/* -------------------------------------------------------------------------
 * Item
 * ---------------------------------------------------------------------- */

export interface AccordionItemProps extends Omit<BaseItemProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One header/panel pair. Give it a `value` to address it from `Root`'s
 * `value` / `defaultValue`; without one Base UI generates an opaque id that
 * nothing else can name.
 */
const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  function AccordionItem({ className, children, ...props }, ref) {
    const variant = React.useContext(AccordionVariantContext);

    return (
      <BaseAccordion.Item
        ref={ref}
        className={clsx(styles.item, className)}
        data-variant={variant}
        {...props}
      >
        {children}
      </BaseAccordion.Item>
    );
  },
);

/* -------------------------------------------------------------------------
 * Header
 * ---------------------------------------------------------------------- */

export interface AccordionHeaderProps extends Omit<BaseHeaderProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The heading that labels the panel. Renders an `<h3>`, which is the right
 * level surprisingly rarely — pass `render={<h2 />}` (or whichever level sits
 * one below the surrounding section's heading) so the page outline stays
 * ordered. It exists to carry `role="heading"` and its level; the trigger
 * inside it is what the user presses.
 */
const AccordionHeader = React.forwardRef<HTMLHeadingElement, AccordionHeaderProps>(
  function AccordionHeader({ className, children, ...props }, ref) {
    const variant = React.useContext(AccordionVariantContext);

    return (
      <BaseAccordion.Header
        ref={ref}
        className={clsx(styles.header, className)}
        data-variant={variant}
        {...props}
      >
        {children}
      </BaseAccordion.Header>
    );
  },
);

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

export interface AccordionTriggerProps extends Omit<BaseTriggerProps, "className"> {
  /**
   * The affordance at the inline-end of the row. Defaults to a chevron that
   * rotates when the panel opens. Pass your own node to replace it — it is
   * wrapped in the same rotating, `aria-hidden` box, so a plus or a caret
   * needs no extra wiring — or `null` to drop it entirely.
   * @default a chevron
   */
  icon?: React.ReactNode;
  /**
   * Additional class name(s) for the label box that wraps `children`.
   * Applied after the internal styles.
   */
  labelClassName?: string;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The button that opens and closes the panel. Renders a `<button>` and must
 * sit inside an `Accordion.Header`.
 *
 * `children` is wrapped in a label box rather than laid out directly: the row
 * is `justify-content: space-between`, so two loose children would push apart
 * to opposite ends instead of an icon-plus-text reading as one label. The box
 * is itself a flex row with `--pui-control-gap`, so an icon passed alongside
 * the text lines up without a wrapper.
 */
const AccordionTrigger = React.forwardRef<HTMLButtonElement, AccordionTriggerProps>(
  function AccordionTrigger(
    { icon = <ChevronDownIcon />, labelClassName, className, children, ...props },
    ref,
  ) {
    const variant = React.useContext(AccordionVariantContext);

    return (
      <BaseAccordion.Trigger
        ref={ref}
        className={clsx(styles.trigger, "pui-focus-ring", className)}
        // The item clips to its own corners so the hover fill and the panel
        // stay inside them, which makes it a clipping container — an outset
        // ring would be cropped along the row's edges. Inset it. In the
        // `divided` variant it also keeps the ring off the neighbouring
        // row's hairline.
        data-focus-inset=""
        data-variant={variant}
        {...props}
      >
        <span className={clsx(styles.label, labelClassName)}>{children}</span>
        {icon === null ? null : (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
      </BaseAccordion.Trigger>
    );
  },
);

/* -------------------------------------------------------------------------
 * Panel
 * ---------------------------------------------------------------------- */

export interface AccordionPanelProps extends Omit<BasePanelProps, "className"> {
  /**
   * Additional class name(s) for the inner element that holds the padding and
   * the content. Applied after the internal styles.
   */
  contentClassName?: string;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The collapsible region. Base UI measures it and publishes the result as
 * `--accordion-panel-height`, which the stylesheet transitions.
 *
 * `children` goes inside an inner box, and that box is where all the padding
 * lives. Padding on the collapsing element itself would still paint at
 * `height: 0` — the padding box survives a zero content box — so a closed
 * panel would leave a band of empty space under every row. The inner box also
 * gives the content something to fade and slide on while the outer one is
 * busy animating its height.
 */
const AccordionPanel = React.forwardRef<HTMLDivElement, AccordionPanelProps>(
  function AccordionPanel({ contentClassName, className, children, ...props }, ref) {
    const variant = React.useContext(AccordionVariantContext);

    return (
      <BaseAccordion.Panel
        ref={ref}
        className={clsx(styles.panel, className)}
        data-variant={variant}
        {...props}
      >
        <div className={clsx(styles.content, contentClassName)}>{children}</div>
      </BaseAccordion.Panel>
    );
  },
);

/**
 * An accordion built on Base UI's unstyled `Accordion` primitive.
 *
 * ```tsx
 * <Accordion.Root defaultValue={["shipping"]}>
 *   <Accordion.Item value="shipping">
 *     <Accordion.Header>
 *       <Accordion.Trigger>When will it ship?</Accordion.Trigger>
 *     </Accordion.Header>
 *     <Accordion.Panel>Within two business days.</Accordion.Panel>
 *   </Accordion.Item>
 * </Accordion.Root>
 * ```
 *
 * One panel opens at a time unless `multiple` is set. Every trigger is an
 * ordinary tab stop — the APG dropped roving focus for accordions, so there
 * are no arrow-key semantics to learn or to get wrong.
 *
 * Styling is driven entirely by `data-*` attributes and `--pui-accordion-*`
 * custom properties, so it can be re-skinned from plain CSS or targeted with
 * Tailwind arbitrary variants (`data-[variant=contained]:...`) without
 * wrapping.
 */
export const Accordion = {
  Root: AccordionRoot,
  Item: AccordionItem,
  Header: AccordionHeader,
  Trigger: AccordionTrigger,
  Panel: AccordionPanel,
};
