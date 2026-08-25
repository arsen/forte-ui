"use client";

import * as React from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { clsx } from "clsx";
import styles from "./Select.module.css";

export type SelectSize = "sm" | "md" | "lg";
export type SelectVariant = "outline" | "soft" | "ghost";

// Module-scoped ambient declaration, not a global one: the package compiles
// without `@types/node`, and every bundler statically replaces the literal
// expression `process.env.NODE_ENV`, so the dev-only warning below is dropped
// from production builds. The `typeof` guard covers the bundler that doesn't.
declare const process: { env: { NODE_ENV?: string } };

const isDevelopment =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

/* -------------------------------------------------------------------------
 * Icons
 *
 * Decorative: the state they depict is already carried by `data-selected`,
 * `data-popup-open` and (for the scroll arrows) Base UI's own `aria-hidden`.
 * ---------------------------------------------------------------------- */

function CaretUpDownIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
      style={{ display: "block", ...props.style }}
    >
      {/* Two paths, not one, so the pair can spread apart while the popup is
       * open — see `.caret` in the stylesheet. `data-direction` says which is
       * which; the class is only a styling hook. */}
      <path className={styles.caret} data-direction="up" d="M11 6H5l3-3.5z" />
      <path
        className={styles.caret}
        data-direction="down"
        d="M11 10H5l3 3.5z"
      />
    </svg>
  );
}

function CheckIcon(props: React.ComponentProps<"svg">) {
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
      <path d="m2.5 8.5 4 4 7-9" />
    </svg>
  );
}

function CaretUpIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
      style={{ display: "block", ...props.style }}
    >
      <path d="M12 10H4l4-4.5z" />
    </svg>
  );
}

function CaretDownIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
      style={{ display: "block", ...props.style }}
    >
      <path d="M12 6H4l4 4.5z" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

/**
 * Props for {@link SelectRoot}. A re-export of Base UI's own root props, kept
 * generic so `<Select.Root<Theme>>` still infers the value type of
 * `onValueChange`, `defaultValue` and `<Select.Value>`'s render function.
 */
export type SelectRootProps<
  Value,
  Multiple extends boolean | undefined = false,
> = BaseSelect.Root.Props<Value, Multiple>;

/**
 * Groups every part of the select and owns its value and open state. Renders
 * no DOM element of its own, so it accepts neither `className` nor `ref`.
 *
 * Both generics are forwarded rather than widened to `any`: `Value` is the
 * type of a single item, and `Multiple` flips the value between `Value` and
 * `Value[]`. Passing `multiple` alone is enough for `Multiple` to infer.
 */
export function SelectRoot<Value, Multiple extends boolean | undefined = false>(
  props: SelectRootProps<Value, Multiple>,
): React.JSX.Element {
  return <BaseSelect.Root {...props} />;
}

/* -------------------------------------------------------------------------
 * Label
 * ---------------------------------------------------------------------- */

type BaseLabelProps = React.ComponentPropsWithoutRef<typeof BaseSelect.Label>;

export interface SelectLabelProps extends Omit<BaseLabelProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A visible label wired to the trigger. This is the preferred way to give a
 * select its accessible name — Base UI renders a `<div>` and associates it
 * with `aria-labelledby`, so clicking it focuses the trigger without opening
 * the popup. When no visible label is rendered, put `aria-label` on
 * `<Select.Trigger>` instead.
 */
export const SelectLabel = React.forwardRef<HTMLDivElement, SelectLabelProps>(
  function SelectLabel({ className, ...props }, ref) {
    return (
      <BaseSelect.Label
        ref={ref}
        className={clsx(styles.label, className)}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

type BaseTriggerProps = React.ComponentPropsWithoutRef<
  typeof BaseSelect.Trigger
>;

export interface SelectTriggerProps extends Omit<BaseTriggerProps, "className"> {
  /**
   * How much visual weight the trigger carries. `outline` reads as a form
   * control, `soft` as a filled field, `ghost` as an inline affordance.
   * @default "outline"
   */
  variant?: SelectVariant;
  /**
   * Size of the trigger. Actual dimensions also follow the ambient
   * `data-pui-density` setting.
   * @default "md"
   */
  size?: SelectSize;
  /**
   * Stretch the trigger to fill the width of its container.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The button that opens the popup. Renders a native `<button>`.
 *
 * Give it `<Select.Value>` and `<Select.Icon>` as children. It must have an
 * accessible name: either render a `<Select.Label>` inside the same
 * `<Select.Root>`, or pass `aria-label` here. In development the trigger
 * warns once if it ends up with neither.
 */
export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(function SelectTrigger(
  { variant = "outline", size = "md", fullWidth = false, className, ...props },
  ref,
) {
  const localRef = React.useRef<HTMLButtonElement | null>(null);

  const handleRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      localRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );

  // `<Select.Label>` sets aria-labelledby through context during the same
  // commit, so by the time effects run the attribute is either there or the
  // select genuinely has no name. Dev-only: this is a lint, not behaviour.
  React.useEffect(() => {
    if (!isDevelopment) {
      return;
    }
    const node = localRef.current;
    if (!node) {
      return;
    }
    if (
      !node.getAttribute("aria-label") &&
      !node.getAttribute("aria-labelledby")
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        "[pretty-ui] <Select.Trigger> has no accessible name. Render a " +
          "<Select.Label> inside the same <Select.Root>, or pass aria-label " +
          "to the trigger.",
      );
    }
  }, []);

  return (
    <BaseSelect.Trigger
      ref={handleRef}
      className={clsx(styles.trigger, "pui-focus-ring", className)}
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth || undefined}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Value
 * ---------------------------------------------------------------------- */

type BaseValueProps = React.ComponentPropsWithoutRef<typeof BaseSelect.Value>;

export interface SelectValueProps extends Omit<BaseValueProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The selected item's label inside the trigger. Renders a `<span>`.
 *
 * By default this renders the raw `value`. Pass `items` to `<Select.Root>` to
 * render the matching label instead, or pass a function as `children` to
 * format it yourself.
 *
 * A `placeholder` cannot be cleared by the user once a value is chosen. If the
 * selection has to be clearable from the popup, render an item whose value is
 * `null` instead of using `placeholder`.
 */
export const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  function SelectValue({ className, ...props }, ref) {
    return (
      <BaseSelect.Value
        ref={ref}
        className={clsx(styles.value, className)}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Icon
 * ---------------------------------------------------------------------- */

type BaseIconProps = React.ComponentPropsWithoutRef<typeof BaseSelect.Icon>;

export interface SelectIconProps extends Omit<BaseIconProps, "className"> {
  /**
   * Icon to render. Defaults to a caret pair, which stays correct whichever
   * side the popup ends up on — including `alignItemWithTrigger` mode, where
   * it opens over the trigger and has no side at all.
   * @default <CaretUpDownIcon />
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The affordance that marks the trigger as a select. Renders a `<span>`, and
 * carries `data-popup-open` so it can react to the popup's state.
 *
 * Purely decorative — the trigger's own role and `aria-expanded` are what
 * reach assistive technology.
 */
export const SelectIcon = React.forwardRef<HTMLSpanElement, SelectIconProps>(
  function SelectIcon({ className, children, ...props }, ref) {
    return (
      <BaseSelect.Icon
        ref={ref}
        className={clsx(styles.icon, className)}
        {...props}
      >
        {children ?? <CaretUpDownIcon />}
      </BaseSelect.Icon>
    );
  },
);

/* -------------------------------------------------------------------------
 * Popup
 * ---------------------------------------------------------------------- */

type BasePopupProps = React.ComponentPropsWithoutRef<typeof BaseSelect.Popup>;
type BasePositionerProps = React.ComponentPropsWithoutRef<
  typeof BaseSelect.Positioner
>;
type BasePortalProps = React.ComponentPropsWithoutRef<
  typeof BaseSelect.Portal
>;

export interface SelectPopupProps extends Omit<BasePopupProps, "className"> {
  /**
   * The items, separators and groups to render. They are placed inside
   * `<Select.List>`, which is the element that actually scrolls.
   */
  children?: React.ReactNode;
  /**
   * Whether the popup overlaps the trigger so the selected item's text lines
   * up with the trigger's value text. While this is active `data-side` is
   * `"none"` on both the positioner and the popup, `side`/`align`/`sideOffset`
   * are ignored, and the enter/exit transition is suppressed. Base UI also
   * disables it automatically for touch input and when the viewport is too
   * tight, in which case ordinary side placement takes over.
   * @default true
   */
  alignItemWithTrigger?: boolean;
  /**
   * Which side of the trigger the popup opens on. Ignored while
   * `alignItemWithTrigger` is in effect.
   * @default "bottom"
   */
  side?: BasePositionerProps["side"];
  /**
   * How the popup aligns along the chosen side. Ignored while
   * `alignItemWithTrigger` is in effect.
   * @default "center"
   */
  align?: BasePositionerProps["align"];
  /**
   * Gap in pixels between the trigger and the popup. Ignored while
   * `alignItemWithTrigger` is in effect.
   * @default 4
   */
  sideOffset?: BasePositionerProps["sideOffset"];
  /**
   * Extra offset in pixels along the alignment axis. Ignored while
   * `alignItemWithTrigger` is in effect.
   * @default 0
   */
  alignOffset?: BasePositionerProps["alignOffset"];
  /**
   * Space to keep between the popup and the edge of its collision boundary.
   * @default 5
   */
  collisionPadding?: BasePositionerProps["collisionPadding"];
  /**
   * Render the popup into a different container instead of `<body>`.
   */
  container?: BasePortalProps["container"];
  /**
   * Render a dimming layer behind the popup. Off by default — a select is a
   * menu, not a dialog — but useful on small screens where the popup covers
   * most of the page.
   * @default false
   */
  backdrop?: boolean;
  /**
   * Render the hover-to-scroll arrows at the top and bottom of the list. They
   * are a pointer convenience only: Base UI does not render them for touch
   * input, and the list scrolls by wheel, drag, keyboard and typeahead
   * regardless, so no item is ever reachable only through them.
   * @default true
   */
  scrollArrows?: boolean;
  /**
   * Where focus goes when the popup closes. There is no `initialFocus`
   * counterpart on a select popup — Base UI always moves focus to the
   * highlighted item on open.
   * @default the trigger
   */
  finalFocus?: BasePopupProps["finalFocus"];
  /**
   * Additional class name(s) for the popup surface. Applied after the
   * internal styles so consumer utilities win without needing `!important`.
   */
  className?: string;
  /**
   * Additional class name(s) for the positioner — the absolutely positioned
   * wrapper around the popup. Use this for `z-index` or a `min-height` that
   * tunes how often `alignItemWithTrigger` falls back.
   */
  positionerClassName?: string;
}

/**
 * The floating surface holding the list of items.
 *
 * This one part renders the whole floating half of Base UI's anatomy —
 * `Portal` → (`Backdrop`) → `Positioner` → `Popup` → `ScrollUpArrow` +
 * `List` + `ScrollDownArrow` — because those elements are meaningless apart
 * and each one has a job the styles depend on: the positioner owns
 * `--anchor-width` and `--available-height`, the popup owns the surface, and
 * the list owns scrolling (which is what the scroll arrows measure).
 */
export const SelectPopup = React.forwardRef<HTMLDivElement, SelectPopupProps>(
  function SelectPopup(
    {
      children,
      alignItemWithTrigger = true,
      side,
      align,
      sideOffset = 4,
      alignOffset,
      collisionPadding,
      container,
      backdrop = false,
      scrollArrows = true,
      className,
      positionerClassName,
      ...props
    },
    ref,
  ) {
    return (
      <BaseSelect.Portal container={container}>
        {backdrop ? (
          <BaseSelect.Backdrop
            className={clsx(styles.backdrop, "pui-scrim")}
          />
        ) : null}
        <BaseSelect.Positioner
          className={clsx(styles.positioner, positionerClassName)}
          alignItemWithTrigger={alignItemWithTrigger}
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
        >
          {/* `pui-hc-surface` carries a transparent border that becomes a
            * system-coloured boundary in forced-colors mode, where the
            * box-shadow below is stripped and the popup would otherwise
            * dissolve into the page. */}
          <BaseSelect.Popup
            ref={ref}
            className={clsx(styles.popup, "pui-hc-surface", className)}
            {...props}
          >
            {scrollArrows ? (
              <BaseSelect.ScrollUpArrow className={styles.scrollArrow}>
                <CaretUpIcon />
              </BaseSelect.ScrollUpArrow>
            ) : null}
            <BaseSelect.List className={styles.list}>{children}</BaseSelect.List>
            {scrollArrows ? (
              <BaseSelect.ScrollDownArrow className={styles.scrollArrow}>
                <CaretDownIcon />
              </BaseSelect.ScrollDownArrow>
            ) : null}
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    );
  },
);

/* -------------------------------------------------------------------------
 * Item
 * ---------------------------------------------------------------------- */

type BaseItemProps = React.ComponentPropsWithoutRef<typeof BaseSelect.Item>;

export interface SelectItemProps extends Omit<BaseItemProps, "className"> {
  /**
   * The item's label. Rendered inside `<Select.ItemText>`, which is what
   * `<Select.Value>` mirrors in the trigger and what typeahead matches on.
   */
  children?: React.ReactNode;
  /**
   * The value this item selects. `null` is a legitimate value and is how you
   * offer a "clear the selection" row inside the list.
   * @default null
   */
  value?: unknown;
  /**
   * Plain-text label used for typeahead when `children` is not a string.
   */
  label?: string;
  /**
   * Whether the item ignores user interaction. Disabled items stay in the
   * list and stay announced; typeahead skips them.
   * @default false
   */
  disabled?: boolean;
  /**
   * What marks the item as selected. Rendered inside
   * `<Select.ItemIndicator>`, which only mounts while the item is selected.
   * @default <CheckIcon />
   */
  indicator?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One option in the popup. Renders a `<div>` with `role="option"`.
 *
 * `data-highlighted` is the focus analogue here: Base UI moves real DOM focus
 * between items with a roving tabindex, and (with `highlightItemOnHover`,
 * which is on by default) pointer hover sets the same attribute. Because the
 * list is a clipping scroll container, the focus ring is applied inset via
 * `data-focus-inset` so `overflow` cannot crop it.
 */
export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  function SelectItem({ children, indicator, className, ...props }, ref) {
    return (
      <BaseSelect.Item
        ref={ref}
        className={clsx(styles.item, "pui-focus-ring", className)}
        data-focus-inset=""
        {...props}
      >
        <BaseSelect.ItemIndicator className={styles.itemIndicator}>
          {indicator ?? <CheckIcon />}
        </BaseSelect.ItemIndicator>
        <BaseSelect.ItemText className={styles.itemText}>
          {children}
        </BaseSelect.ItemText>
      </BaseSelect.Item>
    );
  },
);

/* -------------------------------------------------------------------------
 * Group / GroupLabel / Separator
 * ---------------------------------------------------------------------- */

type BaseGroupProps = React.ComponentPropsWithoutRef<typeof BaseSelect.Group>;

export interface SelectGroupProps extends Omit<BaseGroupProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Groups related items under a heading. Renders a `<div>` with
 * `role="group"`; Base UI associates it with the `<Select.GroupLabel>` inside
 * it automatically, so the heading is announced with its members.
 */
export const SelectGroup = React.forwardRef<HTMLDivElement, SelectGroupProps>(
  function SelectGroup({ className, ...props }, ref) {
    return (
      <BaseSelect.Group
        ref={ref}
        className={clsx(styles.group, className)}
        {...props}
      />
    );
  },
);

type BaseGroupLabelProps = React.ComponentPropsWithoutRef<
  typeof BaseSelect.GroupLabel
>;

export interface SelectGroupLabelProps
  extends Omit<BaseGroupLabelProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The heading for a `<Select.Group>`. Renders a `<div>`, indented past the
 * indicator column so its text lines up with the item text rather than with
 * the check marks.
 */
export const SelectGroupLabel = React.forwardRef<
  HTMLDivElement,
  SelectGroupLabelProps
>(function SelectGroupLabel({ className, ...props }, ref) {
  return (
    <BaseSelect.GroupLabel
      ref={ref}
      className={clsx(styles.groupLabel, className)}
      {...props}
    />
  );
});

type BaseSeparatorProps = React.ComponentPropsWithoutRef<
  typeof BaseSelect.Separator
>;

export interface SelectSeparatorProps
  extends Omit<BaseSeparatorProps, "className"> {
  /**
   * Orientation of the rule. A select list is vertical, so the separator
   * between two groups runs horizontally.
   * @default "horizontal"
   */
  orientation?: BaseSeparatorProps["orientation"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A divider between groups of items. Renders a `<div>` with
 * `role="separator"`, so it is exposed to assistive technology rather than
 * being a purely visual line.
 */
export const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  SelectSeparatorProps
>(function SelectSeparator({ className, ...props }, ref) {
  return (
    <BaseSelect.Separator
      ref={ref}
      className={clsx(styles.separator, className)}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Compound export
 * ---------------------------------------------------------------------- */

/**
 * A select built on Base UI's unstyled `Select` primitives.
 *
 * ```tsx
 * <Select.Root<Theme> items={themes} defaultValue="system">
 *   <Select.Label>Theme</Select.Label>
 *   <Select.Trigger>
 *     <Select.Value />
 *     <Select.Icon />
 *   </Select.Trigger>
 *   <Select.Popup>
 *     <Select.Item value="system">System</Select.Item>
 *     <Select.Item value="light">Light</Select.Item>
 *   </Select.Popup>
 * </Select.Root>
 * ```
 *
 * Styling is driven entirely by `data-*` attributes and `--pui-select-*`
 * custom properties, so it can be re-skinned from plain CSS or targeted with
 * Tailwind arbitrary variants (`data-[highlighted]:...`) without wrapping.
 * Each part declares its own knobs, so an ancestor's value is only inherited
 * and loses — set them on the part itself via `className`. The popup is also
 * portalled to `<body>`, so an ancestor of the trigger could not reach it in
 * any case. `positionerClassName` reaches `--pui-select-z-index` and
 * `--pui-select-positioner-min-height`, the only two declared on the
 * positioner. The global `--pui-color-*` / `--pui-control-*` / `--pui-radius-*`
 * / `--pui-space-*` tokens these resolve to ARE inherited, so re-pointing
 * those from `:root` or a theme scope moves every select at once.
 */
export const Select = {
  Root: SelectRoot,
  Label: SelectLabel,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Icon: SelectIcon,
  Popup: SelectPopup,
  Item: SelectItem,
  Group: SelectGroup,
  GroupLabel: SelectGroupLabel,
  Separator: SelectSeparator,
};
