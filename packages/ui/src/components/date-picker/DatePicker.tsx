"use client";

import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { clsx } from "clsx";
import { Button } from "../button";
import {
  Calendar,
  type CalendarMode,
  type CalendarProps,
  type CalendarRange,
  type CalendarSelection,
} from "../calendar";
import { Popover } from "../popover";
import styles from "./DatePicker.module.css";

export type DatePickerSize = "sm" | "md" | "lg";
export type DatePickerVariant = "outline" | "soft" | "ghost";

// Module-scoped ambient declaration, not a global one: the package compiles
// without `@types/node`, and every bundler statically replaces the literal
// expression `process.env.NODE_ENV`, so the dev-only warning below is dropped
// from production builds. The `typeof` guard covers the bundler that doesn't.
declare const process: { env: { NODE_ENV?: string } };

const isDevelopment =
  typeof process !== "undefined" && process.env.NODE_ENV !== "production";

/* -------------------------------------------------------------------------
 * Context
 *
 * The selection is owned HERE rather than by the calendar, because two parts
 * on opposite sides of a portal need it: `Value`, inside the trigger, and
 * `Calendar`, inside the popup. Hoisting it is also what lets picking a date
 * close the popover — the calendar has no idea it is in one.
 * ---------------------------------------------------------------------- */

type Selection = Date | Date[] | CalendarRange | null;

interface DatePickerContextValue {
  mode: CalendarMode;
  required: boolean;
  selection: Selection;
  locale: string;
  select: (next: Selection, day: Date) => void;
  clear: () => void;
  format: (selection: Selection) => string | null;
}

const DatePickerContext = React.createContext<DatePickerContextValue | null>(null);

function useDatePicker(part: string): DatePickerContextValue {
  const context = React.useContext(DatePickerContext);
  if (!context) {
    throw new Error(`[pretty-ui] <DatePicker.${part}> must be rendered inside <DatePicker.Root>.`);
  }
  return context;
}

/* -------------------------------------------------------------------------
 * Value formatting
 * ---------------------------------------------------------------------- */

/**
 * What the trigger says when nothing overrides it.
 *
 * `multiple` collapses past two days rather than growing the field without
 * limit — a field that widens as you pick reflows the form around it. The
 * overflow is written as `+3` because a digit needs no translation, and the
 * full list is in the popup either way.
 */
function formatSelection(
  selection: Selection,
  mode: CalendarMode,
  formatter: Intl.DateTimeFormat,
): string | null {
  if (!selection) {
    return null;
  }
  if (mode === "single") {
    return formatter.format(selection as Date);
  }
  if (mode === "multiple") {
    const days = selection as Date[];
    if (days.length === 0) {
      return null;
    }
    if (days.length <= 2) {
      return days.map((day) => formatter.format(day)).join(", ");
    }
    return `${formatter.format(days[0]!)} +${days.length - 1}`;
  }
  const range = selection as CalendarRange;
  if (!range.from) {
    return null;
  }
  // An en dash, not a hyphen: this is a span between two values, and the
  // hyphen is the one character a screen reader is likely to read aloud.
  return range.to
    ? `${formatter.format(range.from)} – ${formatter.format(range.to)}`
    : formatter.format(range.from);
}

/** Whether picking `next` should close the popup, when the consumer has not said. */
function closesOnSelect(mode: CalendarMode, next: Selection): boolean {
  if (mode === "single") {
    // Not on a deselect: clicking the chosen day again to clear it and having
    // the popup vanish leaves you with no idea whether it took.
    return next !== null;
  }
  if (mode === "range") {
    return Boolean((next as CalendarRange | null)?.to);
  }
  // `multiple` is a session: closing after the first day would make picking a
  // second one cost another two clicks.
  return false;
}

function isEmpty(selection: Selection): boolean {
  if (!selection) {
    return true;
  }
  if (Array.isArray(selection)) {
    return selection.length === 0;
  }
  if (selection instanceof Date) {
    return false;
  }
  return !selection.from;
}

/* -------------------------------------------------------------------------
 * Icons
 * ---------------------------------------------------------------------- */

function CalendarGlyph(props: React.ComponentProps<"svg">) {
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
    >
      <rect x="2.25" y="3.25" width="11.5" height="10.5" rx="2" />
      <path d="M2.25 6.75h11.5M5.5 2v2.5M10.5 2v2.5" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface DatePickerRootProps<M extends CalendarMode = "single"> {
  /**
   * How many days can be picked. Decides what `selected` holds and, unless
   * `closeOnSelect` says otherwise, when the popup closes.
   * @default "single"
   */
  mode?: M;
  /**
   * The current selection. Pass it with `onSelect` to control the picker;
   * leave it off entirely to let the picker own its state.
   */
  selected?: CalendarSelection<M> | null;
  /** The selection an uncontrolled picker starts with. */
  defaultSelected?: CalendarSelection<M> | null;
  /** Called with the next selection and the day that was clicked. */
  onSelect?: (selection: CalendarSelection<M> | null, day: Date) => void;
  /**
   * Keep at least one day selected: clicking the current selection no longer
   * clears it, and `DatePicker.Clear` is disabled.
   * @default false
   */
  required?: boolean;
  /** Whether the popup is open when the picker first mounts. */
  defaultOpen?: boolean;
  /** Whether the popup is open. Pass it with `onOpenChange` to control it. */
  open?: boolean;
  /** Called when the popup wants to open or close. */
  onOpenChange?: (open: boolean) => void;
  /**
   * Close the popup when a day is picked. Left unset it follows the mode:
   * `single` closes on a pick, `range` closes once both ends are in, and
   * `multiple` stays open because picking a second day would otherwise cost
   * another two clicks.
   */
  closeOnSelect?: boolean;
  /**
   * BCP 47 tag for the calendar and for the trigger's own text. Pinned rather
   * than left to the runtime for the same reason as on `Calendar`: an
   * unpinned locale differs between the server render and the browser.
   * @default "en-US"
   */
  locale?: string;
  /**
   * Replaces the trigger's text entirely. Receives the current selection and
   * the locale, and returns `null` to fall back to the placeholder.
   */
  formatValue?: (selection: CalendarSelection<M> | null, locale: string) => string | null;
  /**
   * Whether the popup takes the page over while it is open. Forwarded to
   * `Popover.Root`.
   * @default false
   */
  modal?: React.ComponentPropsWithoutRef<typeof Popover.Root>["modal"];
  children?: React.ReactNode;
}

/**
 * Groups every part of the picker and owns both its selection and its open
 * state. Renders no DOM of its own.
 *
 * ```tsx
 * <DatePicker.Root mode="single" selected={date} onSelect={setDate}>
 *   <DatePicker.Trigger aria-label="Due date">
 *     <DatePicker.Value placeholder="Pick a date" />
 *     <DatePicker.Icon />
 *   </DatePicker.Trigger>
 *   <DatePicker.Popup>
 *     <DatePicker.Calendar />
 *   </DatePicker.Popup>
 * </DatePicker.Root>
 * ```
 *
 * The selection lives here rather than on the calendar because the trigger
 * and the calendar sit on opposite sides of a portal, and because closing on
 * a pick is a decision the calendar cannot make — it does not know it is in a
 * popover.
 */
export function DatePickerRoot<M extends CalendarMode = "single">(props: DatePickerRootProps<M>) {
  const {
    mode = "single" as M,
    selected: selectedProp,
    defaultSelected = null,
    onSelect,
    required = false,
    defaultOpen = false,
    open: openProp,
    onOpenChange,
    closeOnSelect,
    locale = "en-US",
    formatValue,
    modal = false,
    children,
  } = props;

  /* Decided once, from whether the prop was PASSED — see the same note in
   * Calendar: `useState<Date>()` starts at `undefined`, and reading that as
   * "uncontrolled" makes the picker switch modes on the first pick. */
  const isControlled = React.useRef("selected" in props).current;
  const [selectedState, setSelectedState] = React.useState<Selection>(
    defaultSelected as Selection,
  );
  const selection = (isControlled ? (selectedProp ?? null) : selectedState) as Selection;

  const isOpenControlled = openProp !== undefined;
  const [openState, setOpenState] = React.useState(defaultOpen);
  const open = isOpenControlled ? openProp : openState;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isOpenControlled) {
        setOpenState(next);
      }
      onOpenChange?.(next);
    },
    [isOpenControlled, onOpenChange],
  );

  const formatter = React.useMemo(
    () => new Intl.DateTimeFormat(locale, { dateStyle: "medium" }),
    [locale],
  );

  const context = React.useMemo<DatePickerContextValue>(
    () => ({
      mode,
      required,
      selection,
      locale,
      select: (next, day) => {
        if (!isControlled) {
          setSelectedState(next);
        }
        onSelect?.(next as CalendarSelection<M> | null, day);
        if (closeOnSelect ?? closesOnSelect(mode, next)) {
          setOpen(false);
        }
      },
      clear: () => {
        if (!isControlled) {
          setSelectedState(mode === "multiple" ? [] : null);
        }
        // No `day` to report: nothing was clicked in the grid. The callback
        // takes the day that caused the change, so clearing has none to give
        // and the picker's own state is the only thing that moves.
        onSelect?.(null as CalendarSelection<M> | null, new Date());
      },
      format: (value) =>
        formatValue
          ? formatValue(value as CalendarSelection<M> | null, locale)
          : formatSelection(value, mode, formatter),
    }),
    [closeOnSelect, formatValue, formatter, isControlled, locale, mode, onSelect, required, selection, setOpen],
  );

  return (
    <DatePickerContext.Provider value={context}>
      <Popover.Root open={open} onOpenChange={(next: boolean) => setOpen(next)} modal={modal}>
        {children}
      </Popover.Root>
    </DatePickerContext.Provider>
  );
}

/* -------------------------------------------------------------------------
 * Trigger
 * ---------------------------------------------------------------------- */

type BaseTriggerProps = React.ComponentPropsWithoutRef<typeof Popover.Trigger>;

export interface DatePickerTriggerProps extends Omit<BaseTriggerProps, "className"> {
  /**
   * How much visual weight the field carries. `outline` reads as a form
   * control, `soft` as a filled field, `ghost` as an inline affordance.
   * @default "outline"
   */
  variant?: DatePickerVariant;
  /**
   * Size of the field. Actual dimensions also follow the ambient
   * `data-pui-density` setting.
   * @default "md"
   */
  size?: DatePickerSize;
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
 * The field that opens the picker. Renders a native `<button>`.
 *
 * Give it a `<DatePicker.Value>` and a `<DatePicker.Icon>` as children. It
 * must have an accessible name: a `<Field.Label nativeLabel={false}>` in the
 * same `<Field.Root>` — which it picks up through Base UI's field context —
 * or an `aria-label` here. In development the trigger warns once if it ends
 * up with neither.
 *
 * The picker holds no form value of its own. Submit the date from your own
 * state, or render a hidden input beside the trigger.
 */
export const DatePickerTrigger = React.forwardRef<HTMLButtonElement, DatePickerTriggerProps>(
  function DatePickerTrigger(
    { variant = "outline", size = "md", fullWidth = false, className, ...props },
    ref,
  ) {
    const { selection } = useDatePicker("Trigger");
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

    const warnedRef = React.useRef(false);

    // Dev-only, and the timing matters — the same three reasons as
    // `Select.Trigger`, where the long version of this note lives. In short:
    // no dependency array so the check runs once renders have settled and a
    // label that publishes its id from an effect is not reported as missing;
    // `setTimeout` rather than `requestAnimationFrame` because rAF never
    // fires in a background tab; and a ref so it warns at most once.
    React.useEffect(() => {
      if (!isDevelopment) {
        return undefined;
      }
      const timer = setTimeout(() => {
        const node = localRef.current;
        if (!node || warnedRef.current) {
          return;
        }
        if (!node.getAttribute("aria-label") && !node.getAttribute("aria-labelledby")) {
          warnedRef.current = true;
          // eslint-disable-next-line no-console
          console.warn(
            "[pretty-ui] <DatePicker.Trigger> has no accessible name. Render a " +
              "<Field.Label nativeLabel={false}> in the same <Field.Root>, or pass " +
              "aria-label to the trigger.",
          );
        }
      }, 0);
      return () => clearTimeout(timer);
    });

    return (
      <Popover.Trigger
        ref={handleRef}
        className={clsx(styles.trigger, "pui-focus-ring", className)}
        data-pui="date-picker-trigger"
        data-variant={variant}
        data-size={size}
        data-full-width={fullWidth || undefined}
        data-empty={isEmpty(selection) || undefined}
        /* Rendered THROUGH Base UI's `Field.Control`, which is what makes a
         * `<Field.Label>` in the same `<Field.Root>` actually name this
         * button. `Input`, `Select.Trigger` and the rest read the field
         * context themselves; a popover trigger has no reason to, so without
         * this the label renders, points at nothing, and the control ends up
         * unnamed — the failure that looks fine on screen and is invisible
         * until someone reaches it with a screen reader.
         *
         * Outside a `Field.Root` it is inert: the button keeps its own
         * `aria-label` and gains no attributes. `name` from the field does
         * land on it, which submits nothing — `type="button"` means this is
         * never a form's submitter. Placed BEFORE the spread, so a consumer's
         * own `render` still wins (and then owns its own labelling). */
        render={<BaseField.Control render={<button type="button" />} />}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Value
 * ---------------------------------------------------------------------- */

export interface DatePickerValueProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className" | "children"> {
  /** Shown while nothing is selected. */
  placeholder?: string;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The trigger's text: the formatted selection, or the placeholder while there
 * is none. Carries `data-placeholder` in the second case so the two states
 * can be styled apart.
 *
 * Formatting comes from `DatePicker.Root` — its `locale`, or its
 * `formatValue` when you need something other than a medium date.
 */
export const DatePickerValue = React.forwardRef<HTMLSpanElement, DatePickerValueProps>(
  function DatePickerValue({ placeholder, className, ...props }, ref) {
    const { selection, format } = useDatePicker("Value");
    const text = format(selection);

    return (
      <span
        ref={ref}
        className={clsx(styles.value, className)}
        data-pui="date-picker-value"
        data-placeholder={text === null || undefined}
        {...props}
      >
        {text ?? placeholder}
      </span>
    );
  },
);

/* -------------------------------------------------------------------------
 * Icon
 * ---------------------------------------------------------------------- */

export interface DatePickerIconProps
  extends Omit<React.ComponentPropsWithoutRef<"span">, "className"> {
  /**
   * Contents of the slot. Defaults to a calendar glyph.
   * @default <CalendarGlyph />
   */
  children?: React.ReactNode;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The calendar glyph at the end of the field. Decorative — the trigger's
 * accessible name and its value carry the meaning, so the glyph is hidden
 * from assistive technology and does not take pointer events of its own.
 */
export const DatePickerIcon = React.forwardRef<HTMLSpanElement, DatePickerIconProps>(
  function DatePickerIcon({ children, className, ...props }, ref) {
    return (
      <span
        ref={ref}
        aria-hidden="true"
        className={clsx(styles.icon, className)}
        data-pui="date-picker-icon"
        {...props}
      >
        {children ?? <CalendarGlyph />}
      </span>
    );
  },
);

/* -------------------------------------------------------------------------
 * Popup
 * ---------------------------------------------------------------------- */

type BasePopupProps = React.ComponentPropsWithoutRef<typeof Popover.Popup>;

export interface DatePickerPopupProps extends Omit<BasePopupProps, "className" | "size"> {
  /**
   * Additional class name(s) for the panel inside the popup. Applied after
   * the internal styles so consumer utilities (e.g. Tailwind) win without
   * needing `!important`.
   */
  className?: string;
}

/**
 * The floating surface, and the column inside it that stacks the calendar
 * over an optional `DatePicker.Footer`.
 *
 * The surface itself is a `Popover.Popup` and keeps that component's own
 * marker and `--pui-popover-*` knobs — it is a popover surface, and there is
 * nothing date-shaped about it. The panel it wraps is this component's part,
 * which is what a consumer targets to reach the picker's own popup and not
 * every popover on the page.
 *
 * Every `Popover.Popup` prop except `size` is forwarded, so `side`, `align`
 * and `sideOffset` work as usual. `size` is not: a calendar has an intrinsic
 * width and a width cap would only ever fight it.
 */
export const DatePickerPopup = React.forwardRef<HTMLDivElement, DatePickerPopupProps>(
  function DatePickerPopup({ className, children, ...props }, ref) {
    return (
      <Popover.Popup ref={ref} className={styles.popup} {...props}>
        <div className={clsx(styles.panel, className)} data-pui="date-picker-panel">
          {children}
        </div>
      </Popover.Popup>
    );
  },
);

/* -------------------------------------------------------------------------
 * Calendar
 * ---------------------------------------------------------------------- */

export interface DatePickerCalendarProps
  extends Omit<
    CalendarProps<CalendarMode>,
    "mode" | "selected" | "defaultSelected" | "onSelect" | "required" | "locale"
  > {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The calendar inside the popup, wired to the root's selection and locale.
 * Every other `Calendar` prop is forwarded — `numberOfMonths`,
 * `captionLayout`, `minDate`, `disabled` and the rest.
 *
 * `autoFocus` defaults to **on** here, the opposite of `Calendar`'s own
 * default. The calendar is behind a press that the user just made, so the
 * first arrow key should move a day rather than do nothing; a calendar
 * sitting in the page has no such press behind it, which is why the base
 * component leaves focus alone.
 */
export const DatePickerCalendar = React.forwardRef<HTMLDivElement, DatePickerCalendarProps>(
  function DatePickerCalendar({ autoFocus = true, className, ...props }, ref) {
    const { mode, required, selection, locale, select } = useDatePicker("Calendar");

    return (
      <Calendar
        ref={ref}
        mode={mode}
        required={required}
        selected={selection as CalendarSelection<CalendarMode> | null}
        onSelect={select}
        locale={locale}
        autoFocus={autoFocus}
        className={className}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Footer
 * ---------------------------------------------------------------------- */

export interface DatePickerFooterProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * An actions row under the calendar, inside the popup — where "Clear" and
 * "Today" belong. It is a row of real buttons, so it is reached by
 * <kbd>Tab</kbd> from the grid, which is one Tab stop.
 */
export const DatePickerFooter = React.forwardRef<HTMLDivElement, DatePickerFooterProps>(
  function DatePickerFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.footer, className)}
        data-pui="date-picker-footer"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Clear
 * ---------------------------------------------------------------------- */

type ButtonProps = React.ComponentPropsWithoutRef<typeof Button>;

export interface DatePickerClearProps extends Omit<ButtonProps, "onClick"> {
  /**
   * Contents of the button.
   * @default "Clear"
   */
  children?: React.ReactNode;
}

/**
 * Empties the selection. A `Button`, so it answers to `variant`, `tone` and
 * `size` — and tags itself `data-pui="button"` rather than being handed a
 * marker, the way every composed component in the library does.
 *
 * It disables itself when there is nothing to clear, and when the root is
 * `required`. Disabled rather than hidden: a control that disappears as you
 * reach for it is worse than one that is visibly unavailable, and the popup
 * would reflow under the pointer.
 */
export const DatePickerClear = React.forwardRef<HTMLButtonElement, DatePickerClearProps>(
  function DatePickerClear({ children = "Clear", disabled, ...props }, ref) {
    const { selection, required, clear } = useDatePicker("Clear");

    return (
      <Button
        ref={ref}
        variant="ghost"
        tone="neutral"
        size="sm"
        disabled={disabled ?? (required || isEmpty(selection))}
        onClick={clear}
        {...props}
      >
        {children}
      </Button>
    );
  },
);

/* -------------------------------------------------------------------------
 * Namespace
 * ---------------------------------------------------------------------- */

/**
 * A date field that opens a calendar.
 *
 * `Calendar` in a `Popover`, with the two things that composition always
 * needs anyway: one place that owns the selection, since the trigger's text
 * and the grid sit on opposite sides of a portal, and a rule for when picking
 * a day closes the popup.
 *
 * ```tsx
 * const [date, setDate] = React.useState<Date | null>(null);
 *
 * <DatePicker.Root selected={date} onSelect={setDate}>
 *   <DatePicker.Trigger aria-label="Due date">
 *     <DatePicker.Value placeholder="Pick a date" />
 *     <DatePicker.Icon />
 *   </DatePicker.Trigger>
 *   <DatePicker.Popup>
 *     <DatePicker.Calendar />
 *   </DatePicker.Popup>
 * </DatePicker.Root>
 * ```
 *
 * Every part declares its own knobs, so an ancestor's value is only inherited
 * and never wins.
 */
export const DatePicker = {
  Root: DatePickerRoot,
  Trigger: DatePickerTrigger,
  Value: DatePickerValue,
  Icon: DatePickerIcon,
  Popup: DatePickerPopup,
  Calendar: DatePickerCalendar,
  Footer: DatePickerFooter,
  Clear: DatePickerClear,
};
