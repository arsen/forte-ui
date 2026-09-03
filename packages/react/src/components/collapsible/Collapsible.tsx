"use client";

import * as React from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { clsx } from "clsx";
import styles from "./Collapsible.module.css";

export type CollapsibleVariant = "plain" | "contained";

type BaseRootProps = React.ComponentPropsWithoutRef<typeof BaseCollapsible.Root>;
type BaseTriggerProps = React.ComponentPropsWithoutRef<typeof BaseCollapsible.Trigger>;
type BasePanelProps = React.ComponentPropsWithoutRef<typeof BaseCollapsible.Panel>;

/**
 * The variant is chosen on `Collapsible.Root` but every part below it paints
 * some of it — the root owns the card, the trigger owns the hover treatment,
 * the panel owns the padding. Context carries it down so the consumer sets one
 * prop instead of three that have to agree, and so each part can publish its
 * own `data-variant` for Tailwind arbitrary variants to target.
 *
 * Passing it through context rather than a descendant selector also survives a
 * consumer wrapping the panel in a `<div>`: `.root[data-variant] .panel` would
 * still match there, but only by reaching across markup we do not own.
 */
const CollapsibleVariantContext = React.createContext<CollapsibleVariant>("plain");

/* -------------------------------------------------------------------------
 * Icon
 *
 * Decorative: the open state is already carried by `aria-expanded` on the
 * trigger and by the panel itself.
 *
 * A chevron pointing DOWN that rotates 180°, rather than one pointing at the
 * inline-end edge that rotates 90°. Rotation has no logical form, so an
 * inline-facing chevron would have to multiply its angle by `--forte-direction`
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

export interface CollapsibleRootProps extends Omit<BaseRootProps, "className"> {
  /**
   * How much visual weight the disclosure carries. `"plain"` contributes no
   * box of its own — a bare text button over its panel, for a "Show more" that
   * lives inside a page. `"contained"` turns the pair into a card sized and
   * colored to match one item of a `contained` Accordion. Both are the same
   * three parts with different knobs — nothing moves.
   * @default "plain"
   */
  variant?: CollapsibleVariant;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Groups the trigger and the panel, and owns whether the panel is open.
 *
 * Uncontrolled with `defaultOpen`, controlled with `open` plus `onOpenChange`.
 * Unlike `Accordion.Root`, this is a boolean rather than a list — there is only
 * ever one panel to open.
 *
 * Reach for `Accordion` instead when there are several of these in a row: it
 * puts each section into the page's heading outline and can close the others
 * as one opens, neither of which a stack of collapsibles does.
 */
function CollapsibleRoot({
  variant = "plain",
  className,
  children,
  ...props
}: CollapsibleRootProps): React.JSX.Element {
  return (
    <CollapsibleVariantContext.Provider value={variant}>
      <BaseCollapsible.Root
        className={clsx(styles.root, className)}
        data-forte="collapsible"
        data-variant={variant}
        {...props}
      >
        {children}
      </BaseCollapsible.Root>
    </CollapsibleVariantContext.Provider>
  );
}

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

export interface CollapsibleTriggerProps extends Omit<BaseTriggerProps, "className"> {
  /**
   * The affordance next to the label. Defaults to a chevron that rotates when
   * the panel opens. Pass your own node to replace it — it is wrapped in the
   * same rotating, `aria-hidden` box, so a plus or a caret needs no extra
   * wiring — or `null` to drop it entirely.
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
 * The button that opens and closes the panel. Renders a `<button>` carrying
 * `aria-expanded` and an `aria-controls` pointing at the panel.
 *
 * `children` is wrapped in a label box rather than laid out directly: the row
 * is `justify-content: space-between`, so two loose children would push apart
 * to opposite ends instead of an icon-plus-text reading as one label. The box
 * is itself a flex row with `--forte-control-gap`, so an icon passed alongside
 * the text lines up without a wrapper.
 *
 * Keep the text as the accessible name. `aria-expanded` already announces open
 * and closed, so a trigger reading "Details" needs no "show/hide" wording of
 * its own, and an icon-only trigger has no name at all.
 */
const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
  function CollapsibleTrigger(
    { icon = <ChevronDownIcon />, labelClassName, className, children, ...props },
    ref,
  ) {
    const variant = React.useContext(CollapsibleVariantContext);

    return (
      <BaseCollapsible.Trigger
        ref={ref}
        className={clsx(styles.trigger, "forte-focus-ring", className)}
        data-forte="collapsible-trigger"
        // Only in `contained`. That variant clips the root to the card's
        // corners so the hover fill stays inside them, which makes it a
        // clipping container — an outset ring would be cropped along the
        // card's edges, and would in any case be drawn outside a border the
        // reader can see. `plain` has neither the clip nor the border, and its
        // trigger has no inline padding for an inset ring to sit in: inset
        // there would draw the ring straight through the label.
        data-focus-inset={variant === "contained" ? "" : undefined}
        data-variant={variant}
        {...props}
      >
        <span className={clsx(styles.label, labelClassName)} data-forte="collapsible-label">{children}</span>
        {icon === null ? null : (
          <span className={styles.icon} data-forte="collapsible-icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </BaseCollapsible.Trigger>
    );
  },
);

/* -------------------------------------------------------------------------
 * Panel
 * ---------------------------------------------------------------------- */

export interface CollapsiblePanelProps extends Omit<BasePanelProps, "className"> {
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
 * `--collapsible-panel-height`, which the stylesheet transitions.
 *
 * `children` goes inside an inner box, and that box is where all the padding
 * lives. Padding on the collapsing element itself would still paint at
 * `height: 0` — the padding box survives a zero content box — so a mounted,
 * closed panel would leave a band of empty space under the trigger. The inner
 * box also gives the content something to fade and slide on while the outer
 * one is busy animating its height.
 */
const CollapsiblePanel = React.forwardRef<HTMLDivElement, CollapsiblePanelProps>(
  function CollapsiblePanel({ contentClassName, className, children, ...props }, ref) {
    const variant = React.useContext(CollapsibleVariantContext);

    return (
      <BaseCollapsible.Panel
        ref={ref}
        className={clsx(styles.panel, className)}
        data-forte="collapsible-panel"
        data-variant={variant}
        {...props}
      >
        <div className={clsx(styles.content, contentClassName)} data-forte="collapsible-content">{children}</div>
      </BaseCollapsible.Panel>
    );
  },
);

/**
 * A disclosure built on Base UI's unstyled `Collapsible` primitive.
 *
 * ```tsx
 * <Collapsible.Root>
 *   <Collapsible.Trigger>Advanced settings</Collapsible.Trigger>
 *   <Collapsible.Panel>Nothing in here is required.</Collapsible.Panel>
 * </Collapsible.Root>
 * ```
 *
 * One trigger, one panel, and a height animation that runs without a frame of
 * JavaScript. The panel is unmounted while closed unless `keepMounted` or
 * `hiddenUntilFound` says otherwise.
 *
 * Styling is driven entirely by `data-*` attributes and `--forte-collapsible-*`
 * custom properties, so it can be re-skinned from plain CSS or targeted with
 * Tailwind arbitrary variants (`data-[variant=contained]:...`) without
 * wrapping.
 *
 * @summary A single trigger and the region it reveals; for a stack of
 *   exclusive disclosures, use Accordion.
 * @category Content & layout
 */
export const Collapsible = {
  Root: CollapsibleRoot,
  Trigger: CollapsibleTrigger,
  Panel: CollapsiblePanel,
};
