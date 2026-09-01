"use client";

import * as React from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { clsx } from "clsx";
import styles from "./Combobox.module.css";

export type ComboboxSize = "sm" | "md" | "lg";
export type ComboboxVariant = "outline" | "soft" | "ghost";

/* -------------------------------------------------------------------------
 * Icons
 *
 * Decorative: the state they depict is already carried by `data-popup-open`,
 * `data-selected` and the buttons' own accessible names.
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

function XIcon(props: React.ComponentProps<"svg">) {
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
      <path d="m4.5 4.5 7 7m-7 0 7-7" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

/**
 * Props for {@link ComboboxRoot}. A re-export of Base UI's own root props,
 * kept generic so `<Combobox.Root<Country>>` still infers the value type of
 * `onValueChange`, `defaultValue`, `items` and `itemToStringLabel`.
 */
export type ComboboxRootProps<
  Value,
  Multiple extends boolean | undefined = false,
> = BaseCombobox.Root.Props<Value, Multiple>;

/**
 * Groups every part of the combobox and owns its value, input value and open
 * state. Renders no DOM element of its own, so it accepts neither `className`
 * nor `ref`.
 *
 * Both generics are forwarded rather than widened to `any`: `Value` is the
 * type of a single item, and `Multiple` flips the value between `Value` and
 * `Value[]`. Passing `multiple` alone is enough for `Multiple` to infer.
 *
 * One behaviour is added on top of the primitive: a `multiple` combobox never
 * closes because an item was pressed. Base UI closes it only when a filter had
 * been typed and the input lives outside the popup, which makes picking from a
 * short list and picking from a searched list two different gestures — and an
 * async list, where typing is the only way to see anything, closes on every
 * single pick. Keeping it open also keeps the query, so "search once, tick
 * three results" works. A consumer who does want a pick to close can drive
 * `open` themselves and set it from `onValueChange`.
 */
export function ComboboxRoot<
  Value,
  Multiple extends boolean | undefined = false,
>({
  onOpenChange,
  ...props
}: ComboboxRootProps<Value, Multiple>): React.JSX.Element {
  const multiple = props.multiple;

  const handleOpenChange = React.useCallback(
    (open: boolean, eventDetails: BaseCombobox.Root.ChangeEventDetails) => {
      // Cancelled BEFORE the consumer's handler runs, not after: the popup
      // stays open, so there is no open-change to report and calling their
      // handler would tell them about a close that never happened.
      if (multiple && !open && eventDetails.reason === "item-press") {
        eventDetails.cancel();
        return;
      }
      onOpenChange?.(open, eventDetails);
    },
    [multiple, onOpenChange],
  );

  return <BaseCombobox.Root {...props} onOpenChange={handleOpenChange} />;
}

/* -------------------------------------------------------------------------
 * Label
 * ---------------------------------------------------------------------- */

type BaseLabelProps = React.ComponentPropsWithoutRef<typeof BaseCombobox.Label>;

export interface ComboboxLabelProps extends Omit<BaseLabelProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A visible label wired to the combobox **trigger** — Base UI renders a
 * `<div>` and associates it with `aria-labelledby`, so clicking it focuses
 * the trigger without opening the popup. Reach for it in the
 * input-inside-popup pattern, where the trigger is the form control.
 *
 * When `<Combobox.Input>` is the form control (the usual field pattern),
 * label the input instead: a native `<label htmlFor>`, a `<Field.Label>` in
 * the same `<Field.Root>`, or `aria-label` on the input.
 */
export const ComboboxLabel = React.forwardRef<
  HTMLDivElement,
  ComboboxLabelProps
>(function ComboboxLabel({ className, ...props }, ref) {
  return (
    <BaseCombobox.Label
      ref={ref}
      className={clsx(styles.label, className)}
      data-forte="combobox-label"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * InputGroup
 * ---------------------------------------------------------------------- */

type BaseInputGroupProps = React.ComponentPropsWithoutRef<
  typeof BaseCombobox.InputGroup
>;

export interface ComboboxInputGroupProps
  extends Omit<BaseInputGroupProps, "className"> {
  /**
   * How much visual weight the field carries. `outline` reads as a form
   * control, `soft` as a filled field, `ghost` as an inline affordance.
   * @default "outline"
   */
  variant?: ComboboxVariant;
  /**
   * Size of the field. Height, inline padding and font size move together,
   * and the actual numbers follow the ambient `data-forte-density` setting.
   * Matches `Input` and `Select.Trigger`, so the three line up on one row.
   * @default "md"
   */
  size?: ComboboxSize;
  /**
   * Stretch the field to fill the width of its container.
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
 * The field shell: a `<div>` that wraps `<Combobox.Input>` and its associated
 * controls — `<Combobox.Trigger>`, `<Combobox.Clear>`, `<Combobox.Chips>` —
 * and carries all of the control chrome (border, background, sizes,
 * variants), so the input inside stays bare and the buttons sit inside the
 * boundary. Focus lives on the input; the group rings for it via
 * `.forte-focus-ring-within`.
 */
export const ComboboxInputGroup = React.forwardRef<
  HTMLDivElement,
  ComboboxInputGroupProps
>(function ComboboxInputGroup(
  { variant = "outline", size = "md", fullWidth = false, className, ...props },
  ref,
) {
  return (
    <BaseCombobox.InputGroup
      ref={ref}
      className={clsx(styles.inputGroup, "forte-focus-ring-within", className)}
      data-forte="combobox-input-group"
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth || undefined}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Input
 * ---------------------------------------------------------------------- */

type BaseInputProps = React.ComponentPropsWithoutRef<typeof BaseCombobox.Input>;

export interface ComboboxInputProps extends Omit<BaseInputProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The text input that filters the list. Renders an `<input>`, deliberately
 * bare: the chrome belongs to whichever surface hosts it —
 * `<Combobox.InputGroup>` draws the field boundary in the anchor pattern, and
 * `<Combobox.Popup>` draws it as a search row when the input sits inside the
 * popup. An input rendered outside both gets no boundary at all.
 */
export const ComboboxInput = React.forwardRef<
  HTMLInputElement,
  ComboboxInputProps
>(function ComboboxInput({ className, ...props }, ref) {
  return (
    <BaseCombobox.Input
      ref={ref}
      className={clsx(styles.input, className)}
      data-forte="combobox-input"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

type BaseTriggerProps = React.ComponentPropsWithoutRef<
  typeof BaseCombobox.Trigger
>;

export interface ComboboxTriggerProps
  extends Omit<BaseTriggerProps, "className"> {
  /**
   * How much visual weight the trigger carries. Only in play when the trigger
   * stands alone (the input-inside-popup pattern); inside an
   * `<Combobox.InputGroup>` the group owns the chrome and the trigger is a
   * plain icon button.
   * @default "outline"
   */
  variant?: ComboboxVariant;
  /**
   * Size of the standalone trigger. Ignored inside an
   * `<Combobox.InputGroup>`, where the group's `size` decides.
   * @default "md"
   */
  size?: ComboboxSize;
  /**
   * Stretch the standalone trigger to fill the width of its container.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Contents of the trigger. Defaults to a caret pair, the right children for
   * the icon-button form inside an `<Combobox.InputGroup>` — an icon-only
   * trigger still needs an `aria-label`. In the input-inside-popup pattern
   * pass `<Combobox.Value>` and `<Combobox.Icon>` instead, and name the
   * control with a `<Combobox.Label>`.
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A button that opens the popup. Renders a native `<button>`, in one of two
 * shapes decided by where it sits: inside an `<Combobox.InputGroup>` it is a
 * compact icon button at the end of the field; standing alone it is a
 * select-like trigger that holds `<Combobox.Value>` and `<Combobox.Icon>`
 * while the input waits inside the popup.
 */
export const ComboboxTrigger = React.forwardRef<
  HTMLButtonElement,
  ComboboxTriggerProps
>(function ComboboxTrigger(
  {
    variant = "outline",
    size = "md",
    fullWidth = false,
    children,
    className,
    ...props
  },
  ref,
) {
  return (
    <BaseCombobox.Trigger
      ref={ref}
      // `forte-target` floors the HIT area at 24x24 without inflating the
      // visual box, which inside an `InputGroup` is the field's inner height
      // and at `sm` is smaller than that. No-op on the standalone shape,
      // whose box already clears it.
      className={clsx(styles.trigger, "forte-focus-ring", "forte-target", className)}
      data-forte="combobox-trigger"
      data-variant={variant}
      data-size={size}
      data-full-width={fullWidth || undefined}
      {...props}
    >
      {children ?? <CaretUpDownIcon />}
    </BaseCombobox.Trigger>
  );
});

/* -------------------------------------------------------------------------
 * Value
 * ---------------------------------------------------------------------- */

type BaseValueProps = React.ComponentPropsWithoutRef<typeof BaseCombobox.Value>;

export interface ComboboxValueProps extends BaseValueProps {}

/**
 * The current value, for display inside a standalone `<Combobox.Trigger>`.
 * Renders no DOM element of its own — pass a function as `children` to
 * format the value, or `placeholder` for the empty state. The trigger carries
 * `data-placeholder` while there is no value, which is what the muted
 * placeholder colour keys off.
 */
export function ComboboxValue(props: ComboboxValueProps): React.JSX.Element {
  return <BaseCombobox.Value {...props} />;
}

/* -------------------------------------------------------------------------
 * Icon
 * ---------------------------------------------------------------------- */

type BaseIconProps = React.ComponentPropsWithoutRef<typeof BaseCombobox.Icon>;

export interface ComboboxIconProps extends Omit<BaseIconProps, "className"> {
  /**
   * Icon to render. Defaults to a caret pair whose halves spread apart while
   * the popup is open.
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
 * The affordance that marks a standalone trigger as openable. Renders a
 * `<span>`. Purely decorative — the trigger's own role and `aria-expanded`
 * are what reach assistive technology.
 */
export const ComboboxIcon = React.forwardRef<HTMLSpanElement, ComboboxIconProps>(
  function ComboboxIcon({ className, children, ...props }, ref) {
    return (
      <BaseCombobox.Icon
        ref={ref}
        className={clsx(styles.icon, className)}
        data-forte="combobox-icon"
        {...props}
      >
        {children ?? <CaretUpDownIcon />}
      </BaseCombobox.Icon>
    );
  },
);

/* -------------------------------------------------------------------------
 * Clear
 * ---------------------------------------------------------------------- */

type BaseClearProps = React.ComponentPropsWithoutRef<typeof BaseCombobox.Clear>;

export interface ComboboxClearProps extends Omit<BaseClearProps, "className"> {
  /**
   * Contents of the button. Defaults to an X glyph; the button is icon-only
   * either way, so it still needs an `aria-label`.
   * @default <XIcon />
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A button that clears the value. Renders a native `<button>` that Base UI
 * only mounts while there is something to clear (`keepMounted` opts out), so
 * an empty field never shows a dead control.
 */
export const ComboboxClear = React.forwardRef<
  HTMLButtonElement,
  ComboboxClearProps
>(function ComboboxClear({ children, className, ...props }, ref) {
  return (
    <BaseCombobox.Clear
      ref={ref}
      // Same 24x24 floor as the Trigger it sits beside; see there.
      className={clsx(styles.clear, "forte-focus-ring", "forte-target", className)}
      data-forte="combobox-clear"
      {...props}
    >
      {children ?? <XIcon />}
    </BaseCombobox.Clear>
  );
});

/* -------------------------------------------------------------------------
 * Chips
 * ---------------------------------------------------------------------- */

type BaseChipsProps = React.ComponentPropsWithoutRef<typeof BaseCombobox.Chips>;

export interface ComboboxChipsProps extends Omit<BaseChipsProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The container for the selection chips of a `multiple` combobox. Renders a
 * `<div>` inside `<Combobox.InputGroup>`; render the chips through
 * `<Combobox.Value>`'s function child and finish with `<Combobox.Input>`, so
 * the input wraps onto the same line as the last chip.
 */
export const ComboboxChips = React.forwardRef<HTMLDivElement, ComboboxChipsProps>(
  function ComboboxChips({ className, ...props }, ref) {
    return (
      <BaseCombobox.Chips
        ref={ref}
        className={clsx(styles.chips, className)}
        data-forte="combobox-chips"
        {...props}
      />
    );
  },
);

type BaseChipProps = React.ComponentPropsWithoutRef<typeof BaseCombobox.Chip>;

export interface ComboboxChipProps extends Omit<BaseChipProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One selected value of a `multiple` combobox. Renders a `<div>`; put a
 * `<Combobox.ChipRemove>` inside it so the selection can be removed by
 * pointer as well as by keyboard (Backspace in the empty input already
 * removes the last chip). `data-highlighted` marks the chip keyboard
 * navigation has reached.
 */
export const ComboboxChip = React.forwardRef<HTMLDivElement, ComboboxChipProps>(
  function ComboboxChip({ className, ...props }, ref) {
    return (
      <BaseCombobox.Chip
        ref={ref}
        className={clsx(styles.chip, className)}
        data-forte="combobox-chip"
        {...props}
      />
    );
  },
);

type BaseChipRemoveProps = React.ComponentPropsWithoutRef<
  typeof BaseCombobox.ChipRemove
>;

export interface ComboboxChipRemoveProps
  extends Omit<BaseChipRemoveProps, "className"> {
  /**
   * Contents of the button. Defaults to an X glyph; give the button an
   * `aria-label` naming the value it removes.
   * @default <XIcon />
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A button that removes its chip's value from the selection. Renders a
 * native `<button>`.
 */
export const ComboboxChipRemove = React.forwardRef<
  HTMLButtonElement,
  ComboboxChipRemoveProps
>(function ComboboxChipRemove({ children, className, ...props }, ref) {
  return (
    <BaseCombobox.ChipRemove
      ref={ref}
      // `forte-target` grows the hit area to the SC 2.5.8 floor without
      // inflating the 1rem visual box, which has to fit inside a chip.
      className={clsx(styles.chipRemove, "forte-focus-ring", "forte-target", className)}
      data-forte="combobox-chip-remove"
      {...props}
    >
      {children ?? <XIcon />}
    </BaseCombobox.ChipRemove>
  );
});

/* -------------------------------------------------------------------------
 * Popup
 * ---------------------------------------------------------------------- */

type BasePopupProps = React.ComponentPropsWithoutRef<typeof BaseCombobox.Popup>;
type BasePositionerProps = React.ComponentPropsWithoutRef<
  typeof BaseCombobox.Positioner
>;
type BasePortalProps = React.ComponentPropsWithoutRef<
  typeof BaseCombobox.Portal
>;

export interface ComboboxPopupProps extends Omit<BasePopupProps, "className"> {
  /**
   * The popup's contents — typically `<Combobox.Empty>` followed by
   * `<Combobox.List>`, plus `<Combobox.Status>` for async lists or an
   * `<Combobox.Input>` first for the input-inside-popup pattern.
   */
  children?: React.ReactNode;
  /**
   * Which side of the anchor the popup opens on.
   * @default "bottom"
   */
  side?: BasePositionerProps["side"];
  /**
   * How the popup aligns along the chosen side.
   * @default "start"
   */
  align?: BasePositionerProps["align"];
  /**
   * Gap in pixels between the anchor and the popup. The default clears the
   * focus ring rather than sitting flush against it: unlike `Select`, focus
   * stays on the field while the popup is open, so the group's two-tone ring
   * (`--forte-focus-ring-offset` + `--forte-focus-ring-width`, 4px together) is
   * painted in exactly the gap this measures.
   * @default 8
   */
  sideOffset?: BasePositionerProps["sideOffset"];
  /**
   * Extra offset in pixels along the alignment axis.
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
   * Render a dimming layer behind the popup. Off by default — a combobox
   * popup is a listbox, not a dialog.
   * @default false
   */
  backdrop?: boolean;
  /**
   * Additional class name(s) for the popup surface. Applied after the
   * internal styles so consumer utilities win without needing `!important`.
   */
  className?: string;
  /**
   * Additional class name(s) for the positioner — the absolutely positioned
   * wrapper around the popup. Use this to reach `--forte-combobox-z-index`, the
   * only knob declared on the positioner.
   */
  positionerClassName?: string;
}

/**
 * The floating surface holding the list.
 *
 * This one part renders the floating half of Base UI's anatomy — `Portal` →
 * (`Backdrop`) → `Positioner` → `Popup` — and hands you the inside: unlike
 * `Select.Popup` it does NOT wrap its children in a list, because what sits
 * next to the list is the point of a combobox — `<Combobox.Empty>`,
 * `<Combobox.Status>`, or the input itself in the input-inside-popup pattern.
 */
export const ComboboxPopup = React.forwardRef<HTMLDivElement, ComboboxPopupProps>(
  function ComboboxPopup(
    {
      children,
      side,
      align = "start",
      sideOffset = 8,
      alignOffset,
      collisionPadding,
      container,
      backdrop = false,
      className,
      positionerClassName,
      ...props
    },
    ref,
  ) {
    return (
      <BaseCombobox.Portal container={container}>
        {backdrop ? (
          <BaseCombobox.Backdrop
            className={clsx(styles.backdrop, "forte-scrim")}
            data-forte="combobox-backdrop"
          />
        ) : null}
        <BaseCombobox.Positioner
          className={clsx(styles.positioner, positionerClassName)}
          data-forte="combobox-positioner"
          side={side}
          align={align}
          sideOffset={sideOffset}
          alignOffset={alignOffset}
          collisionPadding={collisionPadding}
        >
          {/* `forte-hc-surface` carries a transparent border that becomes a
            * system-coloured boundary in forced-colors mode, where the
            * box-shadow below is stripped and the popup would otherwise
            * dissolve into the page. */}
          <BaseCombobox.Popup
            ref={ref}
            className={clsx(styles.popup, "forte-hc-surface", className)}
            data-forte="combobox-popup"
            {...props}
          >
            {children}
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    );
  },
);

/* -------------------------------------------------------------------------
 * List
 * ---------------------------------------------------------------------- */

type BaseListProps = React.ComponentPropsWithoutRef<typeof BaseCombobox.List>;

export interface ComboboxListProps extends Omit<BaseListProps, "className"> {
  /**
   * The items, groups and separators — or a function `(item, index) =>
   * ReactNode` that renders each item Base UI's filtering lets through. The
   * function form is what keeps the list in sync with the query; it requires
   * `items` on `<Combobox.Root>`.
   */
  children?: BaseListProps["children"];
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The scrolling container for the items. Renders a `<div>`; scrolling lives
 * here rather than on the popup so a sibling input or status row stays put
 * while the items scroll under it.
 */
export const ComboboxList = React.forwardRef<HTMLDivElement, ComboboxListProps>(
  function ComboboxList({ className, ...props }, ref) {
    return (
      <BaseCombobox.List
        ref={ref}
        className={clsx(styles.list, className)}
        data-forte="combobox-list"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Empty / Status
 * ---------------------------------------------------------------------- */

type BaseEmptyProps = React.ComponentPropsWithoutRef<typeof BaseCombobox.Empty>;

export interface ComboboxEmptyProps extends Omit<BaseEmptyProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Shows its children only while the filtered list is empty, and announces the
 * change politely to screen readers. Requires `items` on `<Combobox.Root>`.
 * The element itself must stay mounted for the announcement to be reliable —
 * Base UI keeps it in the DOM and this component collapses it to nothing
 * while it has no content, so render it unconditionally.
 */
export const ComboboxEmpty = React.forwardRef<HTMLDivElement, ComboboxEmptyProps>(
  function ComboboxEmpty({ className, ...props }, ref) {
    return (
      <BaseCombobox.Empty
        ref={ref}
        className={clsx(styles.empty, className)}
        data-forte="combobox-empty"
        {...props}
      />
    );
  },
);

type BaseStatusProps = React.ComponentPropsWithoutRef<typeof BaseCombobox.Status>;

export interface ComboboxStatusProps extends Omit<BaseStatusProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A status row announced politely to screen readers when its content changes
 * — "Searching…", an error, a hint. Like `<Combobox.Empty>` it must stay
 * mounted to announce reliably: swap its children rather than the element,
 * and it collapses to nothing while it has none.
 */
export const ComboboxStatus = React.forwardRef<
  HTMLDivElement,
  ComboboxStatusProps
>(function ComboboxStatus({ className, ...props }, ref) {
  return (
    <BaseCombobox.Status
      ref={ref}
      className={clsx(styles.status, className)}
      data-forte="combobox-status"
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Item
 * ---------------------------------------------------------------------- */

type BaseItemProps = React.ComponentPropsWithoutRef<typeof BaseCombobox.Item>;

export interface ComboboxItemProps extends Omit<BaseItemProps, "className"> {
  /**
   * The item's label. Rendered next to the indicator column; give the item a
   * plain-text `aria-label` if this is not text.
   */
  children?: React.ReactNode;
  /**
   * The value this item selects. Objects are matched by `Object.is` unless
   * `<Combobox.Root>` is given `isItemEqualToValue`; a `{ value, label }`
   * shape displays its `label` in the input automatically.
   * @default null
   */
  value?: unknown;
  /**
   * Whether the item ignores user interaction. Disabled items stay in the
   * list and stay announced.
   * @default false
   */
  disabled?: boolean;
  /**
   * What marks the item as selected. Rendered inside
   * `<Combobox.ItemIndicator>`, which only mounts while the item is selected.
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
 * One option in the list. Renders a `<div>` with `role="option"`.
 *
 * `data-highlighted` is the focus analogue: DOM focus stays on the input
 * while arrow keys and pointer hover move the highlight between items.
 * Because the list is a clipping scroll container, the focus ring is applied
 * inset via `data-focus-inset` so `overflow` cannot crop it.
 */
export const ComboboxItem = React.forwardRef<HTMLDivElement, ComboboxItemProps>(
  function ComboboxItem({ children, indicator, className, ...props }, ref) {
    return (
      <BaseCombobox.Item
        ref={ref}
        className={clsx(styles.item, "forte-focus-ring", className)}
        data-forte="combobox-item"
        data-focus-inset=""
        {...props}
      >
        <BaseCombobox.ItemIndicator
          className={styles.itemIndicator}
          data-forte="combobox-item-indicator"
        >
          {indicator ?? <CheckIcon />}
        </BaseCombobox.ItemIndicator>
        <span className={styles.itemText} data-forte="combobox-item-text">
          {children}
        </span>
      </BaseCombobox.Item>
    );
  },
);

/* -------------------------------------------------------------------------
 * Group / GroupLabel / Separator / Row / Collection
 * ---------------------------------------------------------------------- */

type BaseGroupProps = React.ComponentPropsWithoutRef<typeof BaseCombobox.Group>;

export interface ComboboxGroupProps extends Omit<BaseGroupProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * Groups related items under a heading. Renders a `<div>` with
 * `role="group"`, associated with the `<Combobox.GroupLabel>` inside it. Pass
 * the group's `items` here and render them with `<Combobox.Collection>` so
 * filtering stays aware of the grouping.
 */
export const ComboboxGroup = React.forwardRef<HTMLDivElement, ComboboxGroupProps>(
  function ComboboxGroup({ className, ...props }, ref) {
    return (
      <BaseCombobox.Group
        ref={ref}
        className={clsx(styles.group, className)}
        data-forte="combobox-group"
        {...props}
      />
    );
  },
);

type BaseGroupLabelProps = React.ComponentPropsWithoutRef<
  typeof BaseCombobox.GroupLabel
>;

export interface ComboboxGroupLabelProps
  extends Omit<BaseGroupLabelProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The heading for a `<Combobox.Group>`. Renders a `<div>`, set at the list's
 * own text edge — outdented from the items it heads, and uppercased and
 * tracked — so it reads a level up from them rather than as one more row.
 */
export const ComboboxGroupLabel = React.forwardRef<
  HTMLDivElement,
  ComboboxGroupLabelProps
>(function ComboboxGroupLabel({ className, ...props }, ref) {
  return (
    <BaseCombobox.GroupLabel
      ref={ref}
      className={clsx(styles.groupLabel, className)}
      data-forte="combobox-group-label"
      {...props}
    />
  );
});

type BaseSeparatorProps = React.ComponentPropsWithoutRef<
  typeof BaseCombobox.Separator
>;

export interface ComboboxSeparatorProps
  extends Omit<BaseSeparatorProps, "className"> {
  /**
   * Orientation of the rule. A combobox list is vertical, so the separator
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
export const ComboboxSeparator = React.forwardRef<
  HTMLDivElement,
  ComboboxSeparatorProps
>(function ComboboxSeparator({ className, ...props }, ref) {
  return (
    <BaseCombobox.Separator
      ref={ref}
      className={clsx(styles.separator, className)}
      data-forte="combobox-separator"
      {...props}
    />
  );
});

type BaseRowProps = React.ComponentPropsWithoutRef<typeof BaseCombobox.Row>;

export interface ComboboxRowProps extends Omit<BaseRowProps, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * One row of items when the list is a grid (`grid` on `<Combobox.Root>`),
 * where arrow keys navigate across rows and columns. Renders a `<div>`.
 */
export const ComboboxRow = React.forwardRef<HTMLDivElement, ComboboxRowProps>(
  function ComboboxRow({ className, ...props }, ref) {
    return (
      <BaseCombobox.Row
        ref={ref}
        className={clsx(styles.row, className)}
        data-forte="combobox-row"
        {...props}
      />
    );
  },
);

/**
 * Renders the filtered items of the nearest `<Combobox.Group>` (or of the
 * root, inside a grid `<Combobox.Row>`) through a function child. Renders no
 * DOM element of its own — a flat list can pass the function straight to
 * `<Combobox.List>` instead. A direct re-export of Base UI's part.
 */
export const ComboboxCollection = BaseCombobox.Collection;

/* -------------------------------------------------------------------------
 * Filtering hooks
 * ---------------------------------------------------------------------- */

/**
 * `Intl.Collator`-backed matchers (`contains`, `startsWith`, `endsWith`) for
 * filtering externally — pass the result into `filter` on `<Combobox.Root>`,
 * or use one inside your own search. A direct re-export of Base UI's
 * `Combobox.useFilter`.
 */
export const useComboboxFilter = BaseCombobox.useFilter;

/**
 * Returns the items the combobox is currently showing after its internal
 * filtering — the hook a virtualizer measures. Must be called from a
 * component rendered inside `<Combobox.Root>`. A direct re-export of Base
 * UI's `Combobox.useFilteredItems`.
 */
export const useComboboxFilteredItems = BaseCombobox.useFilteredItems;

/* -------------------------------------------------------------------------
 * Compound export
 * ---------------------------------------------------------------------- */

/**
 * A combobox built on Base UI's unstyled `Combobox` primitives: an input
 * combined with a filterable list of predefined options. Prefer it over
 * `Select` when the list is long enough to need typing; prefer `Select` when
 * there is no input at all.
 *
 * ```tsx
 * <Combobox.Root items={fruits}>
 *   <Combobox.InputGroup>
 *     <Combobox.Input placeholder="e.g. Apple" aria-label="Fruit" />
 *     <Combobox.Clear aria-label="Clear selection" />
 *     <Combobox.Trigger aria-label="Open popup" />
 *   </Combobox.InputGroup>
 *   <Combobox.Popup>
 *     <Combobox.Empty>No fruits found.</Combobox.Empty>
 *     <Combobox.List>
 *       {(fruit: string) => (
 *         <Combobox.Item key={fruit} value={fruit}>
 *           {fruit}
 *         </Combobox.Item>
 *       )}
 *     </Combobox.List>
 *   </Combobox.Popup>
 * </Combobox.Root>
 * ```
 *
 * Styling is driven entirely by `data-*` attributes and `--forte-combobox-*`
 * custom properties, so it can be re-skinned from plain CSS or targeted with
 * Tailwind arbitrary variants (`data-[highlighted]:...`) without wrapping.
 * Each part declares its own knobs, so an ancestor's value is only inherited
 * and loses — set them on the part itself via `className`. The popup is also
 * portalled to `<body>`, so an ancestor of the input could not reach it in
 * any case; `positionerClassName` reaches `--forte-combobox-z-index`. The
 * global `--forte-color-*` / `--forte-control-*` / `--forte-radius-*` /
 * `--forte-space-*` tokens these resolve to ARE inherited, so re-pointing those
 * from `:root` or a theme scope moves every combobox at once.
 *
 * @summary A text input combined with a filterable option list — the Select to
 *   reach for once the list is long enough to need typing.
 * @category Forms
 */
export const Combobox = {
  Root: ComboboxRoot,
  Label: ComboboxLabel,
  InputGroup: ComboboxInputGroup,
  Input: ComboboxInput,
  Trigger: ComboboxTrigger,
  Value: ComboboxValue,
  Icon: ComboboxIcon,
  Clear: ComboboxClear,
  Chips: ComboboxChips,
  Chip: ComboboxChip,
  ChipRemove: ComboboxChipRemove,
  Popup: ComboboxPopup,
  List: ComboboxList,
  Empty: ComboboxEmpty,
  Status: ComboboxStatus,
  Item: ComboboxItem,
  Group: ComboboxGroup,
  GroupLabel: ComboboxGroupLabel,
  Separator: ComboboxSeparator,
  Row: ComboboxRow,
  Collection: ComboboxCollection,
  useFilter: useComboboxFilter,
  useFilteredItems: useComboboxFilteredItems,
};
