"use client";

import * as React from "react";
import { clsx } from "clsx";
import { Button, type ButtonVariant } from "../button";
import { Select } from "../select";
import styles from "./Calendar.module.css";

export type CalendarMode = "single" | "multiple" | "range";
export type CalendarSize = "sm" | "md" | "lg";
export type CalendarCaptionLayout =
  | "label"
  | "dropdown"
  | "dropdown-months"
  | "dropdown-years";

/** A contiguous span of days. `to` is absent while the second end is still being picked. */
export interface CalendarRange {
  from: Date;
  to?: Date | undefined;
}

/**
 * What `selected` holds for a given `mode`. This is the type that makes
 * `onSelect={setDate}` typecheck against a plain `useState<Date>()` — the
 * component is generic over its mode so the callback is not widened to the
 * union of all three shapes.
 */
export type CalendarSelection<M extends CalendarMode = "single"> = M extends "single"
  ? Date
  : M extends "multiple"
    ? Date[]
    : CalendarRange;

/**
 * Describes a SET of days — what `disabled` takes.
 *
 * `{ before, after }` given together is the exclusive interval between them —
 * after `after` AND before `before` — which is how you disable a gap in the
 * middle. Either one alone is the open-ended half you would expect.
 */
export type CalendarMatcher =
  | boolean
  | Date
  | CalendarRange
  | { before?: Date; after?: Date }
  | { dayOfWeek: number | number[] }
  | ((date: Date) => boolean)
  | readonly CalendarMatcher[];

/** Strings the component speaks. Override them to localise the chrome. */
export interface CalendarLabels {
  /** Accessible name of the whole calendar. @default "Calendar" */
  calendar?: string;
  /** Accessible name of the back arrow. @default "Previous month" */
  previousMonth?: string;
  /** Accessible name of the forward arrow. @default "Next month" */
  nextMonth?: string;
  /** Accessible name of the month dropdown. @default "Month" */
  monthDropdown?: string;
  /** Accessible name of the year dropdown. @default "Year" */
  yearDropdown?: string;
  /** Accessible name of the week-number column. @default "Week" */
  weekNumber?: string;
}

const DEFAULT_LABELS: Required<CalendarLabels> = {
  calendar: "Calendar",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  monthDropdown: "Month",
  yearDropdown: "Year",
  weekNumber: "Week",
};

/* -------------------------------------------------------------------------
 * Dates
 *
 * Every helper here goes through the `new Date(year, month, day)` constructor
 * and never through millisecond arithmetic. Adding 86_400_000 to a timestamp
 * lands an hour short or long on the two days a year a DST boundary is
 * crossed, and the visible failure is a grid that repeats or skips a date —
 * in one timezone, twice a year, which is the bug nobody reproduces. The
 * constructor also normalizes overflow (month 12 is next January, day 0 is
 * last month's last day), so the same three lines cover every unit.
 *
 * Everything is local time on purpose. A calendar shows the user's civil
 * date; normalizing to UTC to "be safe" is what makes the 1st of the month
 * render as the 31st for everyone west of Greenwich.
 * ---------------------------------------------------------------------- */

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/** Steps whole months. Takes and returns the FIRST of a month. */
function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

/**
 * Steps whole months while keeping the day of the month, clamped to the
 * target month's length. Without the clamp, `new Date(y, m + 1, 31)` on
 * January 31st overflows into March 3rd — a Page Down that skips February
 * entirely.
 */
function addMonthsKeepingDay(date: Date, amount: number): Date {
  const target = addMonths(date, amount);
  const lastDay = daysInMonth(target);
  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), lastDay));
}

/** Day 0 of the NEXT month is the last day of this one. */
function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** Negative when `a` is the earlier day, 0 when they are the same day. */
function compareDay(a: Date, b: Date): number {
  return (
    a.getFullYear() - b.getFullYear() || a.getMonth() - b.getMonth() || a.getDate() - b.getDate()
  );
}

/**
 * Months since year 0, so "is this month in range" is one integer comparison
 * instead of a year-then-month pair that is easy to get subtly wrong.
 */
function monthOrdinal(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

/**
 * The inverse. Built through `setFullYear` rather than the constructor
 * because `new Date(y, m, d)` maps a two-digit year onto the 1900s — a
 * calendar clamped to a `minDate` in the year 47 would land in 1947.
 */
function monthFromOrdinal(ordinal: number): Date {
  const date = new Date(2000, ordinal % 12, 1);
  date.setFullYear(Math.floor(ordinal / 12));
  return date;
}

/**
 * The identity a day is addressed by: the `data-day` attribute the focus
 * effect queries, and the React key. Deliberately not `toISOString()`, which
 * converts to UTC and therefore reports the previous date for anyone east of
 * Greenwich after 00:00 local.
 */
function dayKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * ISO 8601 week number: weeks run Monday to Sunday, and week 1 is the one
 * containing the first Thursday of the year. Finding that Thursday is the
 * whole algorithm — it is the day that decides which year a week belongs to,
 * which is why the last days of December can be week 1 of the next year.
 *
 * The division is over whole weeks, so a DST shift of an hour on either end
 * is three orders of magnitude smaller than the rounding step and cannot
 * change the result.
 */
function isoWeek(date: Date): number {
  const thursday = addDays(date, 3 - ((date.getDay() + 6) % 7));
  const jan4 = new Date(thursday.getFullYear(), 0, 4);
  const firstThursday = addDays(jan4, 3 - ((jan4.getDay() + 6) % 7));
  return 1 + Math.round((thursday.getTime() - firstThursday.getTime()) / 604800000);
}

/**
 * The rows of one month's grid, each a full run of seven days including the
 * leading and trailing days that belong to the neighbouring months. The grid
 * is always rectangular — a ragged last row would break both the table
 * semantics and arrow-key navigation.
 */
function getWeeks(month: Date, weekStartsOn: number, fixedWeeks: boolean): Date[][] {
  const first = startOfMonth(month);
  const lead = (first.getDay() - weekStartsOn + 7) % 7;
  const weekCount = fixedWeeks ? 6 : Math.ceil((lead + daysInMonth(first)) / 7);
  const gridStart = addDays(first, -lead);

  const weeks: Date[][] = [];
  for (let week = 0; week < weekCount; week += 1) {
    const days: Date[] = [];
    for (let day = 0; day < 7; day += 1) {
      days.push(addDays(gridStart, week * 7 + day));
    }
    weeks.push(days);
  }
  return weeks;
}

/**
 * `Array.isArray` narrows to `any[]`, which a `readonly` array is not
 * assignable to — so TypeScript keeps the array member in the union on the
 * FALSE branch and every later `in` check fails to compile. Widening the
 * predicate to a readonly array is what makes the negative narrowing work.
 */
function isMatcherList(value: CalendarMatcher): value is readonly CalendarMatcher[] {
  return Array.isArray(value);
}

/** Whether `date` falls inside a matcher's set. Ends are inclusive throughout. */
function matchesDay(date: Date, matcher: CalendarMatcher | undefined): boolean {
  if (matcher === undefined || matcher === false) {
    return false;
  }
  if (matcher === true) {
    return true;
  }
  if (isMatcherList(matcher)) {
    return matcher.some((entry) => matchesDay(date, entry));
  }
  if (typeof matcher === "function") {
    return matcher(date);
  }
  if (matcher instanceof Date) {
    return isSameDay(date, matcher);
  }
  if ("from" in matcher) {
    const { from, to } = matcher;
    if (!to) {
      return isSameDay(date, from);
    }
    return compareDay(date, from) >= 0 && compareDay(date, to) <= 0;
  }
  if ("dayOfWeek" in matcher) {
    const days = Array.isArray(matcher.dayOfWeek) ? matcher.dayOfWeek : [matcher.dayOfWeek];
    return days.includes(date.getDay());
  }
  const { before, after } = matcher;
  if (before && after) {
    return compareDay(date, after) > 0 && compareDay(date, before) < 0;
  }
  if (before) {
    return compareDay(date, before) < 0;
  }
  if (after) {
    return compareDay(date, after) > 0;
  }
  return false;
}

/* -------------------------------------------------------------------------
 * Selection
 * ---------------------------------------------------------------------- */

/**
 * How a click folds into an existing range. Clicking the pending start again
 * clears it (unless `required`), clicking before it swaps the ends rather
 * than throwing the pick away, and clicking with a complete range starts a
 * new one — the behavior every date-range picker has trained users into.
 */
function addToRange(day: Date, range: CalendarRange | null, required: boolean): CalendarRange | null {
  if (!range?.from) {
    return { from: day, to: undefined };
  }
  if (range.to) {
    return { from: day, to: undefined };
  }
  if (isSameDay(day, range.from)) {
    return required ? range : null;
  }
  return compareDay(day, range.from) < 0
    ? { from: day, to: range.from }
    : { from: range.from, to: day };
}

function toggleInList(day: Date, list: Date[] | null, required: boolean): Date[] {
  const current = list ?? [];
  const without = current.filter((entry) => !isSameDay(entry, day));
  if (without.length !== current.length) {
    return required && without.length === 0 ? current : without;
  }
  return [...current, day].sort(compareDay);
}

/** The day a fresh calendar should open on, whatever shape the selection has. */
function firstSelectedDay(mode: CalendarMode, selection: unknown): Date | null {
  if (!selection) {
    return null;
  }
  if (mode === "single") {
    return selection as Date;
  }
  if (mode === "multiple") {
    return (selection as Date[])[0] ?? null;
  }
  return (selection as CalendarRange).from ?? null;
}

/* -------------------------------------------------------------------------
 * Icons
 *
 * Decorative — the arrows carry their meaning in the button's `aria-label`.
 * One glyph pointing forward, mirrored for the back arrow with `scale`: the
 * chevron travels along the inline axis, which has no logical form, so the
 * flip is a physical one that `--forte-direction` turns around in RTL. See
 * `.navIcon` in the stylesheet.
 * ---------------------------------------------------------------------- */

function ChevronIcon(props: React.ComponentProps<"svg">) {
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
      <path d="m6 3.5 4.5 4.5L6 12.5" />
    </svg>
  );
}

/* Squares the arrows at the calendar's own measure. Hoisted to module scope
 * so it is one frozen object rather than a new one per render, which would
 * make both buttons re-render on every keystroke. The icon padding is zeroed
 * because Button's icon-only sizing treats its height as a floor and grows
 * for `icon + padding` — with the default padding the 16px chevron would
 * outgrow a `sm` calendar's 28px nav square and knock the arrows out of the
 * caption row they overlay. The icon size is pinned for the same reason:
 * Button sizes a dropped-in glyph from its own label, which would shrink the
 * chevron with the button's `size` rather than hold it at the measure the
 * caption row is built around. The calendar's geometry is
 * `--forte-calendar-*`'s to decide, not the button's. */
const NAV_BUTTON_STYLE = {
  "--forte-button-height": "var(--forte-calendar-nav-size)",
  "--forte-button-icon-padding": "0px",
  "--forte-button-icon-size": "1rem",
} as React.CSSProperties;

/* -------------------------------------------------------------------------
 * Props
 * ---------------------------------------------------------------------- */

export interface CalendarProps<M extends CalendarMode = "single">
  extends Omit<
    React.ComponentPropsWithoutRef<"div">,
    "className" | "onSelect" | "defaultValue" | "children"
  > {
  /**
   * How many days can be picked at once. `"single"` selects one `Date`,
   * `"multiple"` a `Date[]`, `"range"` a `{ from, to }` object.
   * @default "single"
   */
  mode?: M;
  /**
   * The current selection. Pass it with `onSelect` to control the calendar;
   * leave it off entirely to let the calendar own its state.
   */
  selected?: CalendarSelection<M> | null;
  /** The selection an uncontrolled calendar starts with. */
  defaultSelected?: CalendarSelection<M> | null;
  /**
   * Called with the next selection and the day that was clicked. The
   * selection is `null` once the last pick is cleared, so a controlled
   * `useState<Date>()` takes it directly.
   */
  onSelect?: (selection: CalendarSelection<M> | null, day: Date) => void;
  /**
   * Keep at least one day selected: clicking the current selection no longer
   * clears it.
   * @default false
   */
  required?: boolean;
  /**
   * The month on display, as any date within it. Pass it with `onMonthChange`
   * to drive navigation yourself.
   */
  month?: Date;
  /**
   * The month an uncontrolled calendar opens on.
   * @default the month of the selection, or the current month
   */
  defaultMonth?: Date;
  /** Called with the first day of the new leading month whenever navigation moves. */
  onMonthChange?: (month: Date) => void;
  /**
   * How many months to show side by side.
   * @default 1
   */
  numberOfMonths?: number;
  /**
   * Move a whole page at a time — with `numberOfMonths={2}`, the arrows jump
   * two months instead of one.
   * @default false
   */
  pagedNavigation?: boolean;
  /**
   * Earliest selectable day. Also stops navigation and trims the year
   * dropdown, so one prop bounds the calendar in every direction at once.
   */
  minDate?: Date;
  /** Latest selectable day. The upper half of `minDate`. */
  maxDate?: Date;
  /**
   * Days that cannot be picked, as a date, a range, `{ before }` / `{ after }`,
   * `{ dayOfWeek }`, a predicate, or an array of any of those. Disabled days
   * stay focusable so keyboard navigation can cross them.
   */
  disabled?: CalendarMatcher;
  /**
   * BCP 47 tag used for every month, weekday and day name.
   *
   * Pinned rather than left to the runtime on purpose: `undefined` resolves
   * to the server's locale during SSR and the browser's on the client, and
   * "August" hydrating over "août" is a mismatch React can only fix by
   * throwing the markup away.
   * @default "en-US"
   */
  locale?: string;
  /**
   * First column of the week — 0 is Sunday, 1 Monday, 6 Saturday. Not derived
   * from `locale`: `Intl` cannot be asked for it in every browser, and a
   * silent fallback would move the columns under some of your users and not
   * others.
   * @default 0
   */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /**
   * Fill the first and last rows with the neighbouring months' days instead
   * of leaving them blank.
   * @default true
   */
  showOutsideDays?: boolean;
  /**
   * Always render six rows, so the calendar keeps one height all year and a
   * popover containing it never resizes as you page through it.
   * @default false
   */
  fixedWeeks?: boolean;
  /**
   * Add a leading column of ISO 8601 week numbers.
   * @default false
   */
  showWeekNumbers?: boolean;
  /**
   * What sits between the arrows: a static month and year, or dropdowns for
   * one or both. Dropdowns turn a birthday twenty years back into two clicks
   * instead of two hundred and forty.
   * @default "label"
   */
  captionLayout?: CalendarCaptionLayout;
  /**
   * Cell size and text size. Follows the ambient `data-forte-density` too.
   * @default "md"
   */
  size?: CalendarSize;
  /**
   * Visual weight of the two navigation arrows — any `Button` variant.
   * @default "ghost"
   */
  navVariant?: ButtonVariant;
  /**
   * Rendered under the grid inside a `role="status"` region, so a summary
   * like "3 nights selected" is announced as it changes.
   */
  footer?: React.ReactNode;
  /**
   * Focus the calendar's active day on mount. Use it when the calendar opens
   * in a popover, not on a calendar sitting in the page.
   * @default false
   */
  autoFocus?: boolean;
  /** Today's date. Override it to pin the "today" marker in tests or stories. */
  today?: Date;
  /** Chrome strings — arrow and dropdown labels. Merged over the English defaults. */
  labels?: CalendarLabels;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/* -------------------------------------------------------------------------
 * Component
 * ---------------------------------------------------------------------- */

const CalendarImpl = React.forwardRef<HTMLDivElement, CalendarProps<CalendarMode>>(
  function Calendar(props, forwardedRef) {
    const {
      mode = "single",
      selected: selectedProp,
      defaultSelected = null,
      onSelect,
      required = false,
      month: monthProp,
      defaultMonth,
      onMonthChange,
      numberOfMonths = 1,
      pagedNavigation = false,
      minDate,
      maxDate,
      disabled,
      locale = "en-US",
      weekStartsOn = 0,
      showOutsideDays = true,
      fixedWeeks = false,
      showWeekNumbers = false,
      captionLayout = "label",
      size = "md",
      navVariant = "ghost",
      footer,
      autoFocus = false,
      today: todayProp,
      labels: labelsProp,
      className,
      ...rest
    } = props;

    const labels = { ...DEFAULT_LABELS, ...labelsProp };
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const captionIdBase = React.useId();

    /* Controlled-ness is decided ONCE, from whether the prop was PASSED
     * rather than from whether it is currently defined. The idiomatic
     * `const [date, setDate] = useState<Date>()` starts at `undefined`, so a
     * `selected !== undefined` test would run the calendar as uncontrolled
     * until the first pick and then silently switch — the classic React
     * warning, and here it also means the first click would not clear. */
    const isControlled = React.useRef("selected" in props).current;
    const [selectedState, setSelectedState] = React.useState<unknown>(defaultSelected);
    const selection = (isControlled ? (selectedProp ?? null) : selectedState) as
      | Date
      | Date[]
      | CalendarRange
      | null;

    /* `new Date()` is read once, not on every render, so a calendar left open
     * across midnight does not silently move its "today" marker mid-session —
     * and so the value cannot change between two renders of the same commit. */
    const todayTime = todayProp ? startOfDay(todayProp).getTime() : undefined;
    const today = React.useMemo(
      () => (todayTime === undefined ? startOfDay(new Date()) : new Date(todayTime)),
      [todayTime],
    );

    const [monthState, setMonthState] = React.useState(() =>
      startOfMonth(defaultMonth ?? firstSelectedDay(mode, selectedProp ?? defaultSelected) ?? today),
    );
    const leadingMonth = startOfMonth(monthProp ?? monthState);

    const [focusedDay, setFocusedDay] = React.useState<Date | null>(null);
    const [previewDay, setPreviewDay] = React.useState<Date | null>(null);
    /* Set by the handlers that MOVE focus, read and cleared by the effect
     * that lands it. A month change unmounts the old button, so the focus
     * call has to wait for the commit that mounts the new one. */
    const pendingFocus = React.useRef(autoFocus);

    /* -------------------------------------------------------------------
     * Bounds
     * ---------------------------------------------------------------- */

    const minOrdinal = minDate ? monthOrdinal(minDate) : -Infinity;
    const maxOrdinal = maxDate ? monthOrdinal(maxDate) : Infinity;
    const leadOrdinal = monthOrdinal(leadingMonth);
    const step = pagedNavigation ? numberOfMonths : 1;
    const canGoBack = leadOrdinal > minOrdinal;
    const canGoForward = leadOrdinal + numberOfMonths - 1 < maxOrdinal;

    const months = React.useMemo(
      () => Array.from({ length: numberOfMonths }, (_, index) => addMonths(leadingMonth, index)),
      // The month is identified by its ordinal, not the Date instance —
      // `startOfMonth` returns a new object every render and would otherwise
      // rebuild every grid on every keystroke.
      [leadOrdinal, numberOfMonths],
    );

    const weeksByMonth = React.useMemo(
      () => months.map((month) => getWeeks(month, weekStartsOn, fixedWeeks)),
      [months, weekStartsOn, fixedWeeks],
    );

    const goToMonth = React.useCallback(
      (next: Date) => {
        // The LAST displayed month is what `maxDate` bounds, so the leading
        // one has to stop `numberOfMonths - 1` earlier or a two-month view
        // could page a month past the end.
        const ordinal = Math.min(
          Math.max(monthOrdinal(next), minOrdinal),
          maxOrdinal - numberOfMonths + 1,
        );
        const target = Number.isFinite(ordinal) ? monthFromOrdinal(ordinal) : startOfMonth(next);
        if (monthProp === undefined) {
          setMonthState(target);
        }
        onMonthChange?.(target);
      },
      [maxOrdinal, minOrdinal, monthProp, numberOfMonths, onMonthChange],
    );

    /* -------------------------------------------------------------------
     * Formatting
     *
     * `Intl.DateTimeFormat` instances are expensive enough to build that
     * doing it per cell is measurable on a two-month grid; they are pure
     * given a locale, so one memo covers every day on screen.
     * ---------------------------------------------------------------- */

    const formatters = React.useMemo(
      () => ({
        weekdayShort: new Intl.DateTimeFormat(locale, { weekday: "short" }),
        weekdayLong: new Intl.DateTimeFormat(locale, { weekday: "long" }),
        monthYear: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
        month: new Intl.DateTimeFormat(locale, { month: "long" }),
        year: new Intl.DateTimeFormat(locale, { year: "numeric" }),
        dayNumber: new Intl.DateTimeFormat(locale, { day: "numeric" }),
        dayLabel: new Intl.DateTimeFormat(locale, {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      }),
      [locale],
    );

    /* One real week, so the column headers are the weekday names in the
     * order this calendar actually lays them out. */
    const weekdays = weeksByMonth[0]?.[0] ?? [];

    /* -------------------------------------------------------------------
     * Day state
     * ---------------------------------------------------------------- */

    const isDisabledDay = React.useCallback(
      (day: Date) => {
        if (minDate && compareDay(day, minDate) < 0) {
          return true;
        }
        if (maxDate && compareDay(day, maxDate) > 0) {
          return true;
        }
        return matchesDay(day, disabled);
      },
      [disabled, maxDate, minDate],
    );

    const isSelectedDay = React.useCallback(
      (day: Date) => {
        if (!selection) {
          return false;
        }
        if (mode === "single") {
          return isSameDay(day, selection as Date);
        }
        if (mode === "multiple") {
          return (selection as Date[]).some((entry) => isSameDay(entry, day));
        }
        const range = selection as CalendarRange;
        return Boolean(
          (range.from && isSameDay(day, range.from)) || (range.to && isSameDay(day, range.to)),
        );
      },
      [mode, selection],
    );

    /* The band drawn behind a range. While only one end is picked, the day
     * under the pointer (or under focus) stands in for the other one, so the
     * span you are about to commit is visible before you commit it. */
    const band = React.useMemo(() => {
      if (mode !== "range") {
        return null;
      }
      const range = selection as CalendarRange | null;
      if (!range?.from) {
        return null;
      }
      if (range.to) {
        return { from: range.from, to: range.to, preview: false };
      }
      if (!previewDay || isSameDay(previewDay, range.from)) {
        return null;
      }
      return compareDay(previewDay, range.from) < 0
        ? { from: previewDay, to: range.from, preview: true }
        : { from: range.from, to: previewDay, preview: true };
    }, [mode, previewDay, selection]);

    /* -------------------------------------------------------------------
     * Focus
     * ---------------------------------------------------------------- */

    const isDisplayed = React.useCallback(
      (day: Date) => months.some((month) => isSameMonth(day, month)),
      [months],
    );

    /* Exactly one day in the whole calendar is in the tab order (a roving
     * tabindex): the grid is one stop, and the arrow keys move within it.
     * Falling back through selection → today → the first of the month means
     * Tab always lands somewhere meaningful rather than on January 1st of
     * whatever month happens to be open. */
    const tabTarget = React.useMemo(() => {
      const candidates = [focusedDay, firstSelectedDay(mode, selection), today];
      const found = candidates.find((day) => day && isDisplayed(day));
      return found ?? months[0] ?? today;
    }, [focusedDay, isDisplayed, mode, months, selection, today]);
    const tabTargetKey = dayKey(tabTarget);

    const moveFocus = React.useCallback(
      (day: Date) => {
        const clamped =
          minDate && compareDay(day, minDate) < 0
            ? minDate
            : maxDate && compareDay(day, maxDate) > 0
              ? maxDate
              : day;

        setFocusedDay(clamped);
        setPreviewDay(clamped);
        pendingFocus.current = true;

        if (!isDisplayed(clamped)) {
          // Land the target in the nearest edge month rather than always
          // making it the leading one: paging forward from a two-month view
          // should reveal one new month, not scroll past the month you were
          // reading.
          const target = startOfMonth(clamped);
          goToMonth(
            compareDay(clamped, leadingMonth) < 0
              ? target
              : addMonths(target, -(numberOfMonths - 1)),
          );
        }
      },
      [goToMonth, isDisplayed, leadingMonth, maxDate, minDate, numberOfMonths],
    );

    /* No dependency array: the focus has to land on whichever commit finally
     * mounts the target button, and after a month change that is one commit
     * later than the one that set the flag. The ref guard is what keeps this
     * from stealing focus on unrelated re-renders. */
    React.useEffect(() => {
      if (!pendingFocus.current) {
        return;
      }
      pendingFocus.current = false;
      const node = rootRef.current?.querySelector<HTMLElement>(
        `[data-forte="calendar-day"][data-day="${tabTargetKey}"]:not([data-outside])`,
      );
      node?.focus();
    });

    /* -------------------------------------------------------------------
     * Interaction
     * ---------------------------------------------------------------- */

    const selectDay = React.useCallback(
      (day: Date) => {
        let next: Date | Date[] | CalendarRange | null;
        if (mode === "single") {
          const current = selection as Date | null;
          next = current && isSameDay(current, day) ? (required ? current : null) : day;
        } else if (mode === "multiple") {
          next = toggleInList(day, selection as Date[] | null, required);
        } else {
          next = addToRange(day, selection as CalendarRange | null, required);
        }

        if (!isControlled) {
          setSelectedState(next);
        }
        onSelect?.(next as CalendarSelection<CalendarMode> | null, day);
      },
      [isControlled, mode, onSelect, required, selection],
    );

    const handleDayClick = (day: Date) => {
      if (isDisabledDay(day)) {
        return;
      }
      setFocusedDay(day);
      // Clicking a day belonging to a neighbouring month brings that month
      // into view, or the day you just picked would vanish behind the fold.
      if (!isDisplayed(day)) {
        goToMonth(startOfMonth(day));
      }
      selectDay(day);
    };

    const handleDayKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, day: Date) => {
      // The inline axis is physical: in RTL the left arrow walks FORWARD
      // through the month, because that is the direction the columns run.
      const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
      let next: Date | null = null;

      switch (event.key) {
        case "ArrowLeft":
          next = addDays(day, rtl ? 1 : -1);
          break;
        case "ArrowRight":
          next = addDays(day, rtl ? -1 : 1);
          break;
        case "ArrowUp":
          next = addDays(day, -7);
          break;
        case "ArrowDown":
          next = addDays(day, 7);
          break;
        case "Home":
          next = addDays(day, -((day.getDay() - weekStartsOn + 7) % 7));
          break;
        case "End":
          next = addDays(day, 6 - ((day.getDay() - weekStartsOn + 7) % 7));
          break;
        case "PageUp":
          next = addMonthsKeepingDay(day, event.shiftKey ? -12 : -1);
          break;
        case "PageDown":
          next = addMonthsKeepingDay(day, event.shiftKey ? 12 : 1);
          break;
        default:
          return;
      }

      // Only after a key we handle: preventing default on every keystroke
      // would swallow Tab and the type-ahead a screen reader sends.
      event.preventDefault();
      moveFocus(next);
    };

    /* -------------------------------------------------------------------
     * Render
     * ---------------------------------------------------------------- */

    const setRootRef = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    const showMonthDropdown = captionLayout === "dropdown" || captionLayout === "dropdown-months";
    const showYearDropdown = captionLayout === "dropdown" || captionLayout === "dropdown-years";

    /* Without explicit bounds the year list has to stop somewhere. A century
     * back covers every date of birth and a decade forward every renewal;
     * `minDate` / `maxDate` are the knob for anything else. */
    const firstYear = minDate ? minDate.getFullYear() : today.getFullYear() - 100;
    const lastYear = maxDate ? maxDate.getFullYear() : today.getFullYear() + 10;

    const renderCaption = (month: Date, index: number) => {
      const captionId = `${captionIdBase}-caption-${index}`;
      const monthYearText = formatters.monthYear.format(month);

      if (!showMonthDropdown && !showYearDropdown) {
        return (
          <div className={styles.caption} data-forte="calendar-caption">
            {/* Named, and announced when it changes: paging with the arrows
             * moves nothing visible for a screen reader otherwise. */}
            <span
              id={captionId}
              role="status"
              aria-live="polite"
              className={styles.captionLabel}
              data-forte="calendar-caption-label"
            >
              {monthYearText}
            </span>
          </div>
        );
      }

      // Which months this year can offer, so a `minDate` in June does not
      // leave five dead entries at the top of the list.
      const monthStart = month.getFullYear() === firstYear && minDate ? minDate.getMonth() : 0;
      const monthEnd = month.getFullYear() === lastYear && maxDate ? maxDate.getMonth() : 11;

      const monthItems: Record<string, string> = {};
      for (let value = monthStart; value <= monthEnd; value += 1) {
        monthItems[String(value)] = formatters.month.format(new Date(month.getFullYear(), value, 1));
      }

      const yearItems: Record<string, string> = {};
      for (let value = firstYear; value <= lastYear; value += 1) {
        yearItems[String(value)] = formatters.year.format(new Date(value, 0, 1));
      }

      /* The dropdowns set THIS month, so with several on screen the leading
       * month steps back by the column's index — picking March in the second
       * column shows February and March, not March and April. */
      const goToDisplayed = (next: Date) => goToMonth(addMonths(next, -index));

      return (
        <div className={styles.caption} data-forte="calendar-caption">
          <span id={captionId} role="status" aria-live="polite" className="forte-visually-hidden">
            {monthYearText}
          </span>

          {showMonthDropdown ? (
            <Select.Root
              items={monthItems}
              value={String(month.getMonth())}
              /* Base UI types the value as nullable because a Select CAN be
               * cleared; this one has no empty item, so the guard is a type
               * narrowing rather than a reachable branch. */
              onValueChange={(value: string | null) => {
                if (value !== null) {
                  goToDisplayed(new Date(month.getFullYear(), Number(value), 1));
                }
              }}
            >
              <Select.Trigger
                size="sm"
                variant="ghost"
                aria-label={labels.monthDropdown}
                data-nav="month"
              >
                <Select.Value />
                <Select.Icon />
              </Select.Trigger>
              <Select.Popup>
                {Object.entries(monthItems).map(([value, label]) => (
                  <Select.Item key={value} value={value}>
                    {label}
                  </Select.Item>
                ))}
              </Select.Popup>
            </Select.Root>
          ) : (
            <span className={styles.captionLabel} data-forte="calendar-caption-label">
              {formatters.month.format(month)}
            </span>
          )}

          {showYearDropdown ? (
            <Select.Root
              items={yearItems}
              value={String(month.getFullYear())}
              onValueChange={(value: string | null) => {
                if (value === null) {
                  return;
                }
                // Clamped to the last month the bounds allow in the year
                // being moved to, so jumping to the final year of the range
                // cannot land past `maxDate`.
                const year = Number(value);
                const highest = year === lastYear && maxDate ? maxDate.getMonth() : 11;
                const lowest = year === firstYear && minDate ? minDate.getMonth() : 0;
                goToDisplayed(
                  new Date(year, Math.min(Math.max(month.getMonth(), lowest), highest), 1),
                );
              }}
            >
              <Select.Trigger
                size="sm"
                variant="ghost"
                aria-label={labels.yearDropdown}
                data-nav="year"
              >
                <Select.Value />
                <Select.Icon />
              </Select.Trigger>
              <Select.Popup>
                {Object.entries(yearItems).map(([value, label]) => (
                  <Select.Item key={value} value={value}>
                    {label}
                  </Select.Item>
                ))}
              </Select.Popup>
            </Select.Root>
          ) : (
            <span className={styles.captionLabel} data-forte="calendar-caption-label">
              {formatters.year.format(month)}
            </span>
          )}
        </div>
      );
    };

    const renderDay = (day: Date, month: Date) => {
      const key = dayKey(day);
      const outside = !isSameMonth(day, month);

      if (outside && !showOutsideDays) {
        // The cell still exists: a ragged row would misalign the columns and
        // leave the grid's row lengths uneven.
        return (
          <td key={key} role="gridcell" className={styles.cell} data-forte="calendar-cell" data-empty />
        );
      }

      const dayDisabled = isDisabledDay(day);
      const selected = isSelectedDay(day);
      const isToday = isSameDay(day, today);
      const inBand =
        band && compareDay(day, band.from) >= 0 && compareDay(day, band.to) <= 0 ? true : false;
      const bandStart = inBand && isSameDay(day, band!.from);
      const bandEnd = inBand && isSameDay(day, band!.to);

      return (
        <td
          key={key}
          role="gridcell"
          // Range middles are part of the selection too, so they say so —
          // but a hover preview is not a selection yet and must not claim to
          // be one.
          aria-selected={selected || (inBand && !band!.preview) || undefined}
          className={styles.cell}
          data-forte="calendar-cell"
          data-in-range={inBand || undefined}
          data-range-start={bandStart || undefined}
          data-range-end={bandEnd || undefined}
          data-preview={(inBand && band!.preview) || undefined}
          data-outside={outside || undefined}
        >
          <button
            type="button"
            // Inset ring: the cells sit edge to edge so the range band is
            // continuous, and an outward ring would be drawn over the two
            // neighbours instead of around the focused day.
            className={clsx(styles.day, "forte-focus-ring")}
            data-focus-inset
            data-forte="calendar-day"
            data-day={key}
            data-selected={selected || undefined}
            data-today={isToday || undefined}
            data-outside={outside || undefined}
            data-in-range={inBand || undefined}
            // Outside days are reachable by pointer but never the tab target:
            // arrow keys page the month instead, and the same date would
            // otherwise be in the tab order twice in a two-month view.
            tabIndex={!outside && key === tabTargetKey ? 0 : -1}
            // `aria-disabled`, not the `disabled` attribute: a disabled
            // button cannot be focused, so a blocked-out week would trap
            // arrow-key navigation on the day before it.
            aria-disabled={dayDisabled || undefined}
            aria-current={isToday ? "date" : undefined}
            aria-label={formatters.dayLabel.format(day)}
            onClick={() => handleDayClick(day)}
            onKeyDown={(event) => handleDayKeyDown(event, day)}
            onFocus={() => {
              setFocusedDay(day);
              setPreviewDay(day);
            }}
            onPointerEnter={() => setPreviewDay(day)}
          >
            {formatters.dayNumber.format(day)}
          </button>
        </td>
      );
    };

    return (
      <div
        ref={setRootRef}
        role="group"
        aria-label={labels.calendar}
        className={clsx(styles.root, className)}
        data-forte="calendar"
        data-size={size}
        data-mode={mode}
        // The preview follows the pointer, so it has to be dropped when the
        // pointer leaves — otherwise a half-picked range keeps a stale band
        // frozen under the last cell that was hovered. It falls back to the
        // focused day rather than to nothing, or moving the mouse away would
        // also erase the band a keyboard user is steering with.
        onPointerLeave={() => setPreviewDay(focusedDay)}
        {...rest}
      >
        <div className={styles.body} data-forte="calendar-body">
          {/* Overlays the caption row rather than taking a row of its own, so
            * a two-month view gets one pair of arrows on the outer edges.
            * The container is pointer-transparent; only the buttons are not,
            * or it would swallow clicks meant for the dropdowns beneath. */}
          <div className={styles.nav} data-forte="calendar-nav">
            <Button
              variant={navVariant}
              tone="neutral"
              size="sm"
              iconOnly
              className={styles.navButton}
              /* Inline, not in the stylesheet. Button's own
               * `.root[data-size="sm"]` rule declares this property on this
               * very element at (0,2,0), so a class selector in
               * Calendar.module.css ties on nothing and loses — the arrows
               * came out shorter than the caption row they overlay. An
               * inline declaration is on the element and beats both. */
              style={NAV_BUTTON_STYLE}
              data-nav="previous"
              disabled={!canGoBack}
              aria-label={labels.previousMonth}
              onClick={() => goToMonth(addMonths(leadingMonth, -step))}
            >
              <ChevronIcon className={styles.navIcon} data-nav-icon="previous" />
            </Button>
            <Button
              variant={navVariant}
              tone="neutral"
              size="sm"
              iconOnly
              className={styles.navButton}
              style={NAV_BUTTON_STYLE}
              data-nav="next"
              disabled={!canGoForward}
              aria-label={labels.nextMonth}
              onClick={() => goToMonth(addMonths(leadingMonth, step))}
            >
              <ChevronIcon className={styles.navIcon} data-nav-icon="next" />
            </Button>
          </div>

          <div className={styles.months} data-forte="calendar-months">
            {months.map((month, index) => (
              <div key={monthOrdinal(month)} className={styles.month} data-forte="calendar-month">
                {renderCaption(month, index)}

                <table
                  role="grid"
                  aria-labelledby={`${captionIdBase}-caption-${index}`}
                  className={styles.grid}
                  data-forte="calendar-grid"
                >
                  <thead data-forte="calendar-weekdays">
                    <tr className={styles.weekdayRow}>
                      {showWeekNumbers ? (
                        <th
                          scope="col"
                          className={styles.weekNumber}
                          data-forte="calendar-week-number-header"
                        >
                          <span className="forte-visually-hidden">{labels.weekNumber}</span>
                        </th>
                      ) : null}
                      {weekdays.map((weekday) => (
                        <th
                          key={weekday.getDay()}
                          scope="col"
                          className={styles.weekday}
                          data-forte="calendar-weekday"
                        >
                          {/* Abbreviated for the eye, spelled out for the ear:
                            * "Mo" is read as a word by most screen readers. */}
                          <span aria-hidden="true">{formatters.weekdayShort.format(weekday)}</span>
                          <span className="forte-visually-hidden">
                            {formatters.weekdayLong.format(weekday)}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody data-forte="calendar-weeks">
                    {weeksByMonth[index]!.map((week) => (
                      <tr key={dayKey(week[0]!)} className={styles.week} data-forte="calendar-week">
                        {showWeekNumbers ? (
                          <th
                            scope="row"
                            className={styles.weekNumber}
                            data-forte="calendar-week-number"
                          >
                            {isoWeek(week[0]!)}
                          </th>
                        ) : null}
                        {week.map((day) => renderDay(day, month))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>

        {footer ? (
          <div role="status" className={styles.footer} data-forte="calendar-footer">
            {footer}
          </div>
        ) : null}
      </div>
    );
  },
);

/**
 * A month grid for picking one day, several days, or a range.
 *
 * ```tsx
 * const [date, setDate] = React.useState<Date>();
 *
 * <Calendar mode="single" selected={date} onSelect={setDate} />
 * ```
 *
 * It owns no date library. Month arithmetic goes through the `Date`
 * constructor (DST-safe by construction) and every name on screen comes from
 * `Intl.DateTimeFormat`, so the whole component adds nothing to a consumer's
 * bundle beyond itself.
 *
 * The grid is a real `<table role="grid">` with a roving tabindex: one Tab
 * stop for the whole calendar, arrows to move a day, <kbd>Page Up</kbd> /
 * <kbd>Page Down</kbd> to move a month, and <kbd>Shift</kbd> with either to
 * move a year. Days that cannot be picked are `aria-disabled` rather than
 * `disabled`, so navigation can cross them.
 *
 * @summary An inline month grid for picking one day, several days, or a range;
 *   for a form field that opens a calendar on demand, use DatePicker.
 * @category Forms
 */
export const Calendar = CalendarImpl as <M extends CalendarMode = "single">(
  props: CalendarProps<M> & React.RefAttributes<HTMLDivElement>,
) => React.ReactElement;
