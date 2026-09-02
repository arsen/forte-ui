"use client";

import * as React from "react";
import { clsx } from "clsx";
import styles from "./Table.module.css";

export type TableVariant = "line" | "outline" | "grid";
export type TableSize = "sm" | "md" | "lg";
export type TableAlign = "start" | "center" | "end";
export type TableCaptionPlacement = "top" | "bottom";
export type TableSortDirection = "ascending" | "descending" | "none";

/* -------------------------------------------------------------------------
 * Container
 * ---------------------------------------------------------------------- */

export interface TableContainerProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The scroll box. A `<table>` refuses to be narrower than its widest row, so
 * on a phone a six-column table pushes the whole page sideways; wrapped in
 * this, the table scrolls and the page does not. It is also what a sticky
 * header sticks to — cap its height with a class (`max-h-80`) and set
 * `stickyHeader` on the root.
 *
 * Optional, and deliberately a separate part: a table that fits its column
 * needs no wrapper, and putting one in unconditionally would leave every
 * `ref`, `id` and `aria-*` a consumer passes with two candidate elements.
 */
export const TableContainer = React.forwardRef<HTMLDivElement, TableContainerProps>(
  function TableContainer({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(styles.container, className)}
        data-forte="table-container"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Root
 * ---------------------------------------------------------------------- */

export interface TableRootProps
  extends Omit<React.ComponentPropsWithoutRef<"table">, "className"> {
  /**
   * How much of the grid is drawn. `line` rules between rows only; `outline`
   * adds a frame with the surface radius around the whole table; `grid`
   * adds the column rules as well.
   * @default "line"
   */
  variant?: TableVariant;
  /**
   * Cell padding and type size. `md` follows `data-forte-density` through
   * `--forte-list-item-py`; `sm` and `lg` are fixed steps either side of it.
   * @default "md"
   */
  size?: TableSize;
  /**
   * Tint every other body row. Helps the eye hold a row across a wide table;
   * noise on a narrow one.
   * @default false
   */
  striped?: boolean;
  /**
   * Tint a body row under the pointer. Off by default because a hover fill
   * says "you can click this", and most rows cannot be clicked.
   * @default false
   */
  hoverable?: boolean;
  /**
   * Keep the header row visible while the body scrolls. Needs a scrolling
   * ancestor — `Table.Container` with a height cap — because a sticky
   * element sticks to the nearest scrollport, and the page is a poor one.
   * @default false
   */
  stickyHeader?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The `<table>` itself, and the element every appearance prop lives on.
 * Rendered as `border-collapse: separate` so the frame can carry a radius —
 * collapsed borders belong to no single box, and cannot be rounded.
 */
export const TableRoot = React.forwardRef<HTMLTableElement, TableRootProps>(function TableRoot(
  {
    variant = "line",
    size = "md",
    striped = false,
    hoverable = false,
    stickyHeader = false,
    className,
    ...props
  },
  ref,
) {
  return (
    <table
      ref={ref}
      className={clsx(styles.root, className)}
      data-forte="table"
      data-variant={variant}
      data-size={size}
      data-striped={striped ? "" : undefined}
      data-hoverable={hoverable ? "" : undefined}
      data-sticky-header={stickyHeader ? "" : undefined}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Caption
 * ---------------------------------------------------------------------- */

export interface TableCaptionProps
  extends Omit<React.ComponentPropsWithoutRef<"caption">, "className"> {
  /**
   * Which edge of the table the caption sits on. It is the table's
   * accessible name either way; `bottom` reads as a footnote, `top` as a
   * title.
   * @default "top"
   */
  placement?: TableCaptionPlacement;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The table's name — what a screen reader announces before the column
 * count, and what a sighted reader gets as a title or a footnote. Prefer it
 * to `aria-label` on the root: it is visible, so it names the table for
 * everyone.
 */
export const TableCaption = React.forwardRef<HTMLTableCaptionElement, TableCaptionProps>(
  function TableCaption({ placement = "top", className, ...props }, ref) {
    return (
      <caption
        ref={ref}
        className={clsx(styles.caption, className)}
        data-forte="table-caption"
        data-placement={placement}
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Sections
 * ---------------------------------------------------------------------- */

export interface TableHeaderProps
  extends Omit<React.ComponentPropsWithoutRef<"thead">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/** The `<thead>`. Holds one `Table.Row` of `Table.Head` cells. */
export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  function TableHeader({ className, ...props }, ref) {
    return (
      <thead
        ref={ref}
        className={clsx(styles.header, className)}
        data-forte="table-header"
        {...props}
      />
    );
  },
);

export interface TableBodyProps
  extends Omit<React.ComponentPropsWithoutRef<"tbody">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/** The `<tbody>`. Striping, hover and selection apply to its rows only. */
export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  function TableBody({ className, ...props }, ref) {
    return (
      <tbody
        ref={ref}
        className={clsx(styles.body, className)}
        data-forte="table-body"
        {...props}
      />
    );
  },
);

export interface TableFooterProps
  extends Omit<React.ComponentPropsWithoutRef<"tfoot">, "className"> {
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * The `<tfoot>` — totals, a summary line. Set apart from the body by a
 * heavier rule above it and the header's weight.
 */
export const TableFooter = React.forwardRef<HTMLTableSectionElement, TableFooterProps>(
  function TableFooter({ className, ...props }, ref) {
    return (
      <tfoot
        ref={ref}
        className={clsx(styles.footer, className)}
        data-forte="table-footer"
        {...props}
      />
    );
  },
);

/* -------------------------------------------------------------------------
 * Row
 * ---------------------------------------------------------------------- */

export interface TableRowProps
  extends Omit<React.ComponentPropsWithoutRef<"tr">, "className"> {
  /**
   * Tint the row as chosen. Visual only — put the state itself on a
   * `Checkbox` in the row, which is what assistive technology reads and
   * what the keyboard can reach.
   * @default false
   */
  selected?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A `<tr>`. The same part in every section; where it sits decides whether
 * `striped`, `hoverable` and `selected` apply.
 */
export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(function TableRow(
  { selected = false, className, ...props },
  ref,
) {
  return (
    <tr
      ref={ref}
      className={clsx(styles.row, className)}
      data-forte="table-row"
      data-selected={selected ? "" : undefined}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Head
 * ---------------------------------------------------------------------- */

function SortIcon(props: React.ComponentProps<"svg">) {
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
      {/* One arrow, pointing up; `descending` rotates it in the stylesheet
       * rather than swapping paths, so the flip is a transition and not a
       * cut. */}
      <path d="M8 13V3" />
      <path d="M4 7l4-4 4 4" />
    </svg>
  );
}

export interface TableHeadProps
  extends Omit<React.ComponentPropsWithoutRef<"th">, "className" | "align"> {
  /**
   * Horizontal alignment of the cell's content. Defaults to the start edge —
   * the UA centres `<th>` text, which lines up with nothing beneath it.
   * @default "start"
   */
  align?: TableAlign;
  /**
   * Mark the column as numeric: end-aligned, with tabular figures so digits
   * line up down the column. Set it on the header and the cells alike.
   * @default false
   */
  numeric?: boolean;
  /**
   * The column's current sort. Passing any value — `none` included — makes
   * the header a sort control: the label becomes a button with an arrow,
   * and `aria-sort` reports the state to assistive technology.
   * @default undefined
   */
  sort?: TableSortDirection;
  /**
   * Called when the sort control is activated, with the direction the
   * column should take next: `descending` when it is currently ascending,
   * `ascending` otherwise. The table holds no sort state of its own — sort
   * the rows and pass the new `sort` back.
   */
  onSortChange?: (direction: Exclude<TableSortDirection, "none">) => void;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/**
 * A `<th>`. Column headers go in `Table.Header`; a row header — the one cell
 * in a body row that names the row — is this part inside `Table.Body` with
 * `scope="row"`.
 */
export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(function TableHead(
  { align, numeric = false, sort, onSortChange, className, children, ...props },
  ref,
) {
  const sortable = sort !== undefined;

  return (
    <th
      ref={ref}
      className={clsx(styles.head, className)}
      data-forte="table-head"
      data-align={align}
      data-numeric={numeric ? "" : undefined}
      aria-sort={sortable ? sort : undefined}
      {...props}
    >
      {sortable ? (
        <button
          type="button"
          className={clsx(styles.sortButton, "forte-focus-ring")}
          data-forte="table-sort-button"
          data-direction={sort}
          onClick={() => onSortChange?.(sort === "ascending" ? "descending" : "ascending")}
        >
          {children}
          <SortIcon className={styles.sortIcon} />
          {/* `aria-sort` sits on the cell, which a screen reader reads in
           * table navigation but not when tabbing between buttons; the
           * button carries the state too so the focused control is never
           * announced as a bare column name. */}
          {sort !== "none" && (
            <span className="forte-visually-hidden">, sorted {sort}</span>
          )}
        </button>
      ) : (
        children
      )}
    </th>
  );
});

/* -------------------------------------------------------------------------
 * Cell
 * ---------------------------------------------------------------------- */

export interface TableCellProps
  extends Omit<React.ComponentPropsWithoutRef<"td">, "className" | "align"> {
  /**
   * Horizontal alignment of the cell's content.
   * @default "start"
   */
  align?: TableAlign;
  /**
   * Mark the cell as numeric: end-aligned, with tabular figures so digits
   * line up down the column. Set it on the header and the cells alike.
   * @default false
   */
  numeric?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

/** A `<td>`. */
export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  { align, numeric = false, className, ...props },
  ref,
) {
  return (
    <td
      ref={ref}
      className={clsx(styles.cell, className)}
      data-forte="table-cell"
      data-align={align}
      data-numeric={numeric ? "" : undefined}
      {...props}
    />
  );
});

/* -------------------------------------------------------------------------
 * Compound export
 *
 * The parts are ALSO exported flat (TableRoot, TableRow, …), for the reason
 * Card gives: a React Server Component cannot dereference `Table.Root` —
 * the namespace object crosses the client boundary as an opaque reference
 * whose properties are `undefined`, a runtime error the type checker
 * cannot see. A table of data fetched on the server is exactly the case.
 * ---------------------------------------------------------------------- */

/**
 * Rows and columns of data, on the real `<table>` element.
 *
 * ```tsx
 * <Table.Root variant="outline">
 *   <Table.Caption>Invoices this quarter</Table.Caption>
 *   <Table.Header>
 *     <Table.Row>
 *       <Table.Head>Invoice</Table.Head>
 *       <Table.Head>Status</Table.Head>
 *       <Table.Head numeric>Amount</Table.Head>
 *     </Table.Row>
 *   </Table.Header>
 *   <Table.Body>
 *     <Table.Row>
 *       <Table.Cell>INV-2041</Table.Cell>
 *       <Table.Cell>Paid</Table.Cell>
 *       <Table.Cell numeric>$250.00</Table.Cell>
 *     </Table.Row>
 *   </Table.Body>
 * </Table.Root>
 * ```
 *
 * There is no Base UI primitive underneath and no state at all: the parts
 * are the HTML table elements, one to one, and every one takes that
 * element's own props. What earns it a component is the vocabulary — a
 * variant axis for how much of the grid to draw, a size axis the density
 * presets drive, striping, hover and selection tints that each know which
 * section they belong to, numeric columns with tabular figures, a sortable
 * header that puts a real button in the cell and `aria-sort` on it, and a
 * sticky header that actually sticks.
 *
 * Sorting, filtering, pagination and selection STATE are the consumer's:
 * the table reports a click on a sort control and tints a row it is told is
 * selected, and does nothing else. That is what keeps it usable with any
 * data layer, a row-virtualiser included.
 *
 * Styling is driven by `data-variant`, `data-size`, `data-striped`,
 * `data-hoverable`, `data-sticky-header`, `data-selected`, `data-align`
 * and `data-numeric`, and by `--forte-table-*` custom properties, so it can
 * be re-skinned from plain CSS or targeted with Tailwind arbitrary variants
 * (`data-[selected]:...`) without wrapping.
 *
 * @summary Rows and columns of data on a real `<table>` — variants, sizes,
 *   striping, selection tint, numeric columns, sortable headers and a sticky
 *   header; the data, sorting and selection state stay with the consumer.
 * @category Content & layout
 */
export const Table = {
  Container: TableContainer,
  Root: TableRoot,
  Caption: TableCaption,
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Row: TableRow,
  Head: TableHead,
  Cell: TableCell,
};
