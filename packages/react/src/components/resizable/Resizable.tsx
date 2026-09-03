"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";
import { clsx } from "clsx";
import styles from "./Resizable.module.css";

/* -------------------------------------------------------------------------
 * Resizable
 *
 * Base UI has no resizable primitive, so this component owns its own layout
 * model. Three decisions shape everything below.
 *
 * 1 — Sizes are PERCENTAGES and the layout is `flex-grow`. A panel is
 *     `flex: <size> 1 0` inside a flex container, so the browser divides the
 *     group in the ratio we hand it and re-divides it for free when the
 *     window changes. Nothing is measured per frame and nothing is written in
 *     pixels, which is what lets a group be `width: 100%`, sit inside a grid
 *     cell, or be nested in another group without a resize observer chain.
 *
 * 2 — The group owns the sizes; the panels are told theirs. A panel cannot
 *     resize itself, because resizing is always a TRANSFER — every percent
 *     one panel gains another has to lose, and only the group can see both
 *     sides plus everyone their overflow cascades into.
 *
 * 3 — The registry is sorted by DOM POSITION, not by render order. Panels and
 *     handles register themselves and the group sorts them with
 *     `compareDocumentPosition`, so a handle always knows the two panels it
 *     actually sits between — including when a consumer maps over an array,
 *     wraps a panel in their own component, or renders one conditionally.
 *     An index passed down as a prop would go stale in all three cases,
 *     silently, and the symptom (the wrong pair of panels resizing) is one
 *     nobody debugs quickly.
 *
 * Constraints — `minSize`, `maxSize`, `collapsedSize` — accept a percentage
 * OR a `px` string. Percentages alone are the usual API and the usual
 * complaint: "the sidebar must not go below 240px" is not expressible as a
 * percentage of a container whose width nobody knows. A px constraint is
 * converted against the group's measured size at the moment it is needed, and
 * re-checked when the group is resized.
 * ---------------------------------------------------------------------- */

/** Which way the panels are laid out. */
export type ResizableOrientation = "horizontal" | "vertical";

/**
 * A size constraint: a bare number or a `"…%"` string is a percentage of the
 * group; a `"…px"` string is an absolute length, resolved against the group's
 * measured size whenever it is read.
 */
export type ResizableLength = number | `${number}%` | `${number}px`;

/** Storage for `autoSaveId`. `localStorage` and `sessionStorage` both fit. */
export interface ResizableStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

/* Percentages are compared, summed and clamped constantly; float noise from
 * the division would otherwise show up as a panel that is "collapsed" at
 * 1e-15% or a total that never quite reaches 100. */
const EPSILON = 0.0001;

const useIsoLayoutEffect =
  typeof document !== "undefined" ? React.useLayoutEffect : React.useEffect;

/* -------------------------------------------------------------------------
 * Geometry helpers — pure, and deliberately outside the components so the
 * resize algorithm can be reasoned about without React in the picture.
 * ---------------------------------------------------------------------- */

interface PanelConstraints {
  min: number;
  max: number;
  collapsible: boolean;
  collapsed: number;
  threshold: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Resolve a `ResizableLength` to a percentage of the group.
 *
 * `groupPx` of 0 means the group has not been measured yet — on the very
 * first layout pass, or while it is `display: none`. A px constraint has no
 * meaning then, so it falls back rather than dividing by zero and poisoning
 * every size derived from it with `Infinity`.
 */
function toPercent(
  value: ResizableLength | undefined,
  groupPx: number,
  fallback: number,
): number {
  if (value == null) return fallback;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return fallback;
  if (value.trim().endsWith("px")) {
    return groupPx > 0 ? (parsed / groupPx) * 100 : fallback;
  }
  return parsed;
}

/**
 * The percentage a length resolves to before anything is measured. A number
 * or a `%` string already is one; a px value needs the container and comes
 * back NaN. This is what the first paint — including the server's — can know,
 * which is why the pre-layout fallbacks below use it instead of `toPercent`.
 */
function staticPercent(value: ResizableLength | undefined): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && !value.trim().endsWith("px")) {
    return Number.parseFloat(value);
  }
  return Number.NaN;
}

/* `noUncheckedIndexedAccess` is on, and every index below is derived from the
 * length of the array it indexes a line or two earlier. Reading through these
 * two accessors keeps that provable-by-construction fact from decaying into a
 * `!` on every access — which would also silence the one case that is worth
 * catching, a constraints array that has fallen out of step with its sizes. */
const UNCONSTRAINED: PanelConstraints = {
  min: 0,
  max: 100,
  collapsible: false,
  collapsed: 0,
  threshold: 0.5,
};

function sizeAt(sizes: readonly number[], index: number): number {
  return sizes[index] ?? 0;
}

function limitsAt(constraints: readonly PanelConstraints[], index: number): PanelConstraints {
  return constraints[index] ?? UNCONSTRAINED;
}

/**
 * The size below which a panel is considered shut, and the size it may not be
 * dragged below. They are the same number unless the panel is collapsible, in
 * which case it may cross its minimum on its way to being closed.
 */
function floorOf(constraints: PanelConstraints, size: number): number {
  return constraints.collapsible && size <= constraints.collapsed + EPSILON
    ? constraints.collapsed
    : constraints.min;
}

/**
 * Snap a panel that has been dragged into the dead zone between its collapsed
 * size and its minimum.
 *
 * Without this the panel would rest at any size in that band, which is the one
 * range its own `minSize` says is not allowed. The snap point sits a fraction
 * `threshold` of the way up the band, so the panel falls shut when the drag is
 * closer to closed and springs back to `min` when it is closer to open.
 *
 * Returns the percentage the snap RELEASED — positive when the panel gave up
 * more than the drag took from it, negative when it clawed some back. The
 * caller has to fold that into its own accounting or the layout stops summing
 * to 100.
 */
function snapCollapsible(
  sizes: number[],
  constraints: readonly PanelConstraints[],
  index: number,
): number {
  const limits = limitsAt(constraints, index);
  if (!limits.collapsible) return 0;
  const size = sizeAt(sizes, index);
  if (size >= limits.min - EPSILON || size <= limits.collapsed + EPSILON) return 0;

  const snapPoint = limits.collapsed + (limits.min - limits.collapsed) * limits.threshold;
  const target = size <= snapPoint ? limits.collapsed : limits.min;
  sizes[index] = target;
  return size - target;
}

/**
 * Move the boundary at `pivot` (the panel BEFORE the handle) by `delta`
 * percent, and return the new layout. Pure: `sizes` is not mutated.
 *
 * The delta is taken from the panels on the shrinking side, NEAREST FIRST,
 * and cascades outward as each one bottoms out at its minimum. Cascading is
 * what stops a handle "sticking" the moment its immediate neighbour is at its
 * minimum while there is obviously room two panels over — the behavior every
 * real splitter has, and the one people notice is missing.
 *
 * Only the panel touching the handle may cross below its minimum, and only
 * because that is the collapse gesture. A panel two positions out collapsing
 * because its neighbour ran out of room would be a layout jumping about far
 * from the pointer.
 */
function resizeAt(
  sizes: number[],
  constraints: readonly PanelConstraints[],
  pivot: number,
  delta: number,
  snap = true,
): number[] {
  if (!Number.isFinite(delta) || Math.abs(delta) < EPSILON) return sizes;
  if (pivot < 0 || pivot + 1 >= sizes.length) return sizes;

  const next = sizes.slice();
  const growing = delta > 0;
  const growIndex = growing ? pivot : pivot + 1;

  // Away from the handle, in the direction the panels are giving up room.
  const shrinkOrder: number[] = [];
  if (growing) {
    for (let i = pivot + 1; i < next.length; i++) shrinkOrder.push(i);
  } else {
    for (let i = pivot; i >= 0; i--) shrinkOrder.push(i);
  }

  let remaining = Math.abs(delta);
  let freed = 0;

  for (let k = 0; k < shrinkOrder.length && remaining > EPSILON; k++) {
    const i = shrinkOrder[k] ?? 0;
    const limits = limitsAt(constraints, i);
    const floor = k === 0 && limits.collapsible ? limits.collapsed : limits.min;
    const take = Math.min(Math.max(0, sizeAt(next, i) - floor), remaining);
    next[i] = sizeAt(next, i) - take;
    remaining -= take;
    freed += take;
  }

  if (snap && shrinkOrder.length > 0) {
    freed += snapCollapsible(next, constraints, shrinkOrder[0] ?? 0);
  }

  const grow = limitsAt(constraints, growIndex);
  const applied = Math.min(freed, Math.max(0, grow.max - sizeAt(next, growIndex)));
  next[growIndex] = sizeAt(next, growIndex) + applied;
  let leftover = freed - applied;

  /* The growing panel may be a collapsed one on its way back open, in which
   * case it lands in the same dead band and snaps by the same rule — but here
   * the snap costs room rather than releasing it, so it can only be honored
   * out of what is still in hand. When it cannot be, the panel stays shut and
   * the reader drags a little further; the alternative is stealing percent
   * from a panel already at its minimum. */
  if (snap && grow.collapsible) {
    const size = sizeAt(next, growIndex);
    if (size > grow.collapsed + EPSILON && size < grow.min - EPSILON) {
      const snapPoint = grow.collapsed + (grow.min - grow.collapsed) * grow.threshold;
      const target = size <= snapPoint ? grow.collapsed : grow.min;
      const cost = target - size;
      if (cost <= leftover + EPSILON) {
        next[growIndex] = target;
        leftover -= cost;
      } else {
        leftover += size - grow.collapsed;
        next[growIndex] = grow.collapsed;
      }
    }
  }

  /* Hand back whatever the growing side could not absorb, FARTHEST panel
   * first — the reverse of the order it was taken in, so a cascade unwinds
   * the way it wound up and the panel next to the handle is the last to be
   * disturbed. Capped at each panel's original size: giving one more than it
   * started with would move the handle the opposite way to the drag. */
  for (let k = shrinkOrder.length - 1; k >= 0 && leftover > EPSILON; k--) {
    const i = shrinkOrder[k] ?? 0;
    const room = Math.max(
      0,
      Math.min(sizeAt(sizes, i), limitsAt(constraints, i).max) - sizeAt(next, i),
    );
    const give = Math.min(room, leftover);
    next[i] = sizeAt(next, i) + give;
    leftover -= give;
  }

  return next;
}

/**
 * Pull every panel back inside its constraints and re-balance to 100.
 *
 * Only px constraints make this necessary: a `240px` minimum is a different
 * percentage at every container width, so a group that shrinks can leave a
 * panel below a floor it was comfortably above a moment ago. Percent-only
 * groups are already valid and this is a no-op for them.
 */
function enforce(sizes: number[], constraints: readonly PanelConstraints[]): number[] {
  if (sizes.length === 0) return sizes;

  const next = sizes.slice();
  for (let i = 0; i < next.length; i++) {
    const limits = limitsAt(constraints, i);
    // A collapsed panel stays collapsed. Re-floating it to `min` because the
    // window got narrower would re-open a sidebar the reader shut.
    const floor = floorOf(limits, sizeAt(next, i));
    next[i] = clamp(sizeAt(next, i), Math.min(floor, limits.max), limits.max);
  }

  // Two passes: the first spreads the error over the panels with slack, the
  // second mops up whatever the bounds refused. Beyond that the constraints
  // are over-subscribed — their minimums sum past 100, which happens the
  // moment two px minimums are wider than the container — and there is no
  // valid layout to find.
  for (let pass = 0; pass < 2; pass++) {
    const error = 100 - next.reduce((sum, value) => sum + value, 0);
    if (Math.abs(error) < EPSILON) break;

    const room = next.map((size, i) => {
      const limits = limitsAt(constraints, i);
      if (error > 0) {
        // Surplus must not crack open a panel the reader shut. A collapsed
        // panel has headroom on paper — its whole `max` — but handing it any
        // would re-open a sidebar as a side effect of ANOTHER panel hitting
        // its ceiling.
        return limits.collapsible && size <= limits.collapsed + EPSILON
          ? 0
          : Math.max(0, limits.max - size);
      }
      return Math.max(0, size - floorOf(limits, size));
    });
    const slack = room.reduce((sum, value) => sum + value, 0);
    if (slack < EPSILON) break;

    for (let i = 0; i < next.length; i++) {
      next[i] = sizeAt(next, i) + error * (sizeAt(room, i) / slack);
    }
  }

  /* Over-subscribed, so scale the whole thing back to 100 and let every panel
   * share the shortfall. `flex-grow` would normalize the ratios anyway — this
   * changes no pixels — but the numbers are also what `aria-valuenow` and
   * `onLayout` publish, and a separator reporting 58 for a pane occupying 46%
   * of the group is simply wrong. */
  const total = next.reduce((sum, value) => sum + value, 0);
  if (total > EPSILON && Math.abs(total - 100) > EPSILON) {
    for (let i = 0; i < next.length; i++) next[i] = (sizeAt(next, i) / total) * 100;
  }

  return next;
}


function sameOrder(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

/* -------------------------------------------------------------------------
 * Registry and context
 * ---------------------------------------------------------------------- */

interface PanelConfig {
  defaultSize?: ResizableLength;
  minSize?: ResizableLength;
  maxSize?: ResizableLength;
  collapsible: boolean;
  collapsedSize: ResizableLength;
  collapseThreshold: number;
}

interface RegistryEntry {
  id: string;
  kind: "panel" | "handle";
  element: HTMLElement | null;
  /* Read through a ref rather than copied in, so the group always sees the
   * panel's CURRENT constraints. Re-registering on every prop change would
   * re-sort the whole group on every keystroke of a controlled `minSize`. */
  config: React.RefObject<PanelConfig> | null;
}

interface ResizableContextValue {
  orientation: ResizableOrientation;
  panelIds: readonly string[];
  /** Grow factor for a panel with no `defaultSize`, for the first paint only. */
  initialShare: number | undefined;
  sizes: Readonly<Record<string, number>>;
  collapsedIds: ReadonlySet<string>;
  draggingId: string | null;
  register: (entry: RegistryEntry) => () => void;
  invalidate: () => void;
  neighbours: (handleId: string) => { before?: string; after?: string };
  constraintsOf: (panelId: string) => PanelConstraints | undefined;
  measure: () => number;
  drag: (handleId: string, snapshot: number[], deltaPercent: number) => void;
  setDragging: (handleId: string | null) => void;
  nudge: (handleId: string, deltaPercent: number) => void;
  extreme: (handleId: string, edge: "min" | "max") => void;
  toggleCollapse: (handleId: string) => void;
  setPanelCollapsed: (panelId: string, collapsed: boolean) => void;
  resetLayout: () => void;
  step: number;
  largeStep: number;
}

const ResizableContext = React.createContext<ResizableContextValue | null>(null);

function useResizableContext(part: string): ResizableContextValue {
  const context = React.useContext(ResizableContext);
  if (!context) {
    throw new Error(`forte-ui: <Resizable.${part}> must be rendered inside <Resizable.Group>.`);
  }
  return context;
}

/* -------------------------------------------------------------------------
 * Group
 * ---------------------------------------------------------------------- */

export interface ResizableGroupProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className" | "onChange"> {
  /**
   * Which way the panels run. `"horizontal"` lays them out side by side with
   * vertical handles between them; `"vertical"` stacks them.
   * @default "horizontal"
   */
  orientation?: ResizableOrientation;
  /**
   * How far one arrow-key press moves a handle, in percent of the group.
   * @default 5
   */
  step?: number;
  /**
   * How far <kbd>Page Up</kbd> / <kbd>Page Down</kbd> moves a handle, in
   * percent of the group.
   * @default 20
   */
  largeStep?: number;
  /**
   * Remember the layout under this key and restore it on the next visit.
   * Sizes are stored positionally, so the saved layout is discarded if the
   * number of panels has changed since.
   *
   * Restoration happens after mount — the server has no access to the store —
   * so give the panels sensible `defaultSize`s as well, or the first paint is
   * the default layout rather than the saved one.
   */
  autoSaveId?: string;
  /**
   * Where `autoSaveId` writes. Defaults to `localStorage`; pass
   * `sessionStorage`, or your own two-method object, to change that.
   * @default localStorage
   */
  storage?: ResizableStorage;
  /**
   * Called with every panel's size, in percent and in DOM order, whenever the
   * layout changes — including the first time it settles.
   */
  onLayout?: (sizes: number[]) => void;
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
 * The container. Owns the layout: every panel's size lives here, because
 * resizing is a transfer between panels and only the group can see both sides.
 *
 * ```tsx
 * <Resizable.Group orientation="horizontal">
 *   <Resizable.Panel defaultSize={30} minSize="200px">…</Resizable.Panel>
 *   <Resizable.Handle />
 *   <Resizable.Panel>…</Resizable.Panel>
 * </Resizable.Group>
 * ```
 *
 * The group has no intrinsic size — it fills what it is given, so give it one
 * (a height for a horizontal group, a height for a vertical one too).
 */
export const ResizableGroup = React.forwardRef<HTMLDivElement, ResizableGroupProps>(
  function ResizableGroup(
    {
      orientation = "horizontal",
      step = 5,
      largeStep = 20,
      autoSaveId,
      storage,
      onLayout,
      render,
      className,
      children,
      ...props
    },
    forwardedRef,
  ) {
    const groupRef = React.useRef<HTMLDivElement | null>(null);
    const registryRef = React.useRef<Map<string, RegistryEntry> | null>(null);
    if (registryRef.current === null) registryRef.current = new Map();
    const registry = registryRef.current;

    const [, setRevision] = React.useState(0);
    const [order, setOrder] = React.useState<readonly string[]>([]);
    const [sizes, setSizes] = React.useState<Record<string, number>>({});
    const [draggingId, setDraggingId] = React.useState<string | null>(null);
    const [groupPx, setGroupPx] = React.useState(0);

    const invalidate = React.useCallback(() => {
      setRevision((value) => value + 1);
    }, []);

    const register = React.useCallback(
      (entry: RegistryEntry) => {
        registry.set(entry.id, entry);
        invalidate();
        return () => {
          registry.delete(entry.id);
          invalidate();
        };
      },
      [registry, invalidate],
    );

    /* Sort by DOM position. Children's layout effects have already run by the
     * time this one does, so every element that exists is in the document and
     * `compareDocumentPosition` can be trusted.
     *
     * Deliberately no dependency array. Registration covers panels arriving
     * and leaving, but not a consumer REORDERING the array it maps over —
     * that changes nothing the group is subscribed to while changing which
     * two panels every handle sits between. Re-deriving on each commit and
     * writing only on a real change costs a sort of a handful of elements and
     * removes the whole class of bug. The equality guard is what keeps it from
     * being an infinite loop. */
    useIsoLayoutEffect(() => {
      // Nothing can join or leave mid-gesture, and this is the one piece of
      // per-commit work in the group that touches the DOM. Skipping it keeps
      // a drag's frame budget to the render itself.
      if (draggingId) return;
      const next = [...registry.values()]
        .filter((entry): entry is RegistryEntry & { element: HTMLElement } => entry.element != null)
        .sort((a, b) =>
          a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1,
        )
        .map((entry) => entry.id);

      setOrder((prev) => (sameOrder(prev, next) ? prev : next));
    });

    const panelIds = React.useMemo(
      () => order.filter((id) => registry.get(id)?.kind === "panel"),
      [order, registry],
    );

    const measure = React.useCallback(() => {
      const element = groupRef.current;
      if (!element) return 0;
      const rect = element.getBoundingClientRect();
      return orientation === "horizontal" ? rect.width : rect.height;
    }, [orientation]);

    /* px constraints are a percentage of a number that changes, so the group
     * has to know its own size — and know when it changed. */
    useIsoLayoutEffect(() => {
      const element = groupRef.current;
      if (!element || typeof ResizeObserver === "undefined") {
        setGroupPx(measure());
        return;
      }
      const observer = new ResizeObserver(() => setGroupPx(measure()));
      observer.observe(element);
      setGroupPx(measure());
      return () => observer.disconnect();
    }, [measure]);

    const constraintsFor = React.useCallback(
      (ids: readonly string[], px: number): PanelConstraints[] =>
        ids.map((id) => {
          const config = registry.get(id)?.config?.current;
          const min = clamp(toPercent(config?.minSize, px, 0), 0, 100);
          const collapsed = clamp(toPercent(config?.collapsedSize, px, 0), 0, min);
          return {
            min,
            max: clamp(toPercent(config?.maxSize, px, 100), min, 100),
            collapsible: config?.collapsible ?? false,
            collapsed,
            threshold: clamp(config?.collapseThreshold ?? 0.5, 0, 1),
          };
        }),
      [],
    );

    /* The INTENT, resolved from whatever is known: a size already assigned
     * wins, then the panel's `defaultSize`, then an equal share of what is
     * left. Scaled to exactly 100 at the end so the flex ratios are also
     * readable as percentages.
     *
     * Deliberately unconstrained. Constraints are applied to the intent every
     * render, below, and never written back into it — see the note there. */
    const resolve = React.useCallback(
      (ids: readonly string[], previous: Record<string, number>, px: number) => {
        const next: Record<string, number> = {};
        const unsized: string[] = [];
        let assigned = 0;

        for (const id of ids) {
          const config = registry.get(id)?.config?.current;
          const size = previous[id] ?? toPercent(config?.defaultSize, px, Number.NaN);
          if (Number.isFinite(size)) {
            next[id] = size;
            assigned += size;
          } else {
            unsized.push(id);
          }
        }

        if (unsized.length > 0) {
          const each = Math.max(0, (100 - assigned) / unsized.length);
          for (const id of unsized) next[id] = each;
        }

        const total = ids.reduce((sum, id) => sum + (next[id] ?? 0), 0);
        if (total > EPSILON && Math.abs(total - 100) > EPSILON) {
          for (const id of ids) next[id] = ((next[id] ?? 0) / total) * 100;
        }

        return next;
      },
      [registry],
    );

    const commit = React.useCallback((ids: readonly string[], next: number[]) => {
      setSizes((prev) => {
        if (ids.every((id, i) => Math.abs((prev[id] ?? Number.NaN) - sizeAt(next, i)) < EPSILON)) {
          return prev;
        }
        const merged: Record<string, number> = {};
        ids.forEach((id, i) => {
          merged[id] = sizeAt(next, i);
        });
        return merged;
      });
    }, []);

    // A panel arrived or left: re-resolve, keeping every size already known.
    // NOT a dependent of `groupPx` — a container resize must not rewrite the
    // intent, which is the whole point of keeping the two apart.
    useIsoLayoutEffect(() => {
      setSizes((prev) => {
        const next = resolve(panelIds, prev, groupPx);
        const changed =
          Object.keys(prev).length !== panelIds.length ||
          panelIds.some((id) => Math.abs((prev[id] ?? Number.NaN) - (next[id] ?? 0)) > EPSILON);
        return changed ? next : prev;
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps -- see above
    }, [panelIds, resolve]);

    /* ---------------------------------------------------------------------
     * Persistence
     * ------------------------------------------------------------------ */

    const store = React.useMemo<ResizableStorage | null>(() => {
      if (storage) return storage;
      if (typeof window === "undefined") return null;
      try {
        // Reading the property is itself what throws in a locked-down or
        // sandboxed context, which is why it is inside the try.
        return window.localStorage;
      } catch {
        return null;
      }
    }, [storage]);

    const restoredRef = React.useRef(false);

    useIsoLayoutEffect(() => {
      if (!autoSaveId || !store || restoredRef.current || panelIds.length === 0) return;
      restoredRef.current = true;
      try {
        const raw = store.getItem(`forte-resizable:${autoSaveId}`);
        if (!raw) return;
        const saved: unknown = JSON.parse(raw);
        if (!Array.isArray(saved) || saved.length !== panelIds.length) return;
        if (!saved.every((value) => typeof value === "number" && Number.isFinite(value))) return;
        // Stored unconstrained, restored unconstrained: the saved layout is
        // an intent like any other, and the render pass fits it to whatever
        // the container happens to be on this visit.
        commit(panelIds, saved as number[]);
      } catch {
        // A malformed or unreadable entry is not worth failing a render over;
        // the default layout is a perfectly good answer.
      }
    }, [autoSaveId, store, panelIds, commit]);

    React.useEffect(() => {
      if (!autoSaveId || !store || !restoredRef.current || panelIds.length === 0) return;
      if (panelIds.some((id) => !Number.isFinite(sizes[id]))) return;
      try {
        store.setItem(
          `forte-resizable:${autoSaveId}`,
          JSON.stringify(panelIds.map((id) => Number((sizes[id] ?? 0).toFixed(4)))),
        );
      } catch {
        // Quota, private mode, or a storage-less environment. Not fatal.
      }
    }, [autoSaveId, store, panelIds, sizes]);

    /* ---------------------------------------------------------------------
     * Derived state
     * ------------------------------------------------------------------ */

    const constraints = React.useMemo(
      () => constraintsFor(panelIds, groupPx),
      [constraintsFor, panelIds, groupPx],
    );

    /* Intent, then constraints — in that order, every render, and never the
     * other way round.
     *
     * A px constraint is a different percentage at every container width, so a
     * group that is briefly narrow (mount, a collapsed accordion opening, a
     * phone) has briefly impossible constraints: `minSize="180px"` inside
     * 200px of container is 90%, and enforcing it squeezes everything else to
     * nothing. That is the RIGHT thing to draw at 200px. It is the wrong thing
     * to REMEMBER — written back into state it survives the container growing
     * again, because the enforced layout is self-consistent and there is no
     * error left to correct. The panel stays at 90% forever, and the only
     * clue is that it happened on a width nobody was looking at.
     *
     * So the state holds what the reader asked for and this memo holds what
     * fits. Squeezing is a rendering decision, and it is reversed the moment
     * there is room again. */
    /* Not settled while any panel is still missing a size — which is every
     * commit between a panel registering and the resolve effect running. That
     * window is invisible on a quiet mount, but a framework can stretch it
     * across several painted commits: a client-side navigation streams the
     * page in, and a hydration mismatch mounts the whole tree a second time.
     * Every derived value below has to be safe to read mid-window. */
    const settled =
      panelIds.length > 0 && panelIds.every((id) => Number.isFinite(sizes[id]));

    const layout = React.useMemo(() => {
      /* Before the intent is complete, enforcing would manufacture data:
       * `sizes[id] ?? 0` turns every not-yet-resolved panel into a zero, and
       * that zero is not inert — it renders a frame of collapsed panels, and
       * it is what told every collapsible panel it was shut (see
       * `collapsedIds`). Passing through only what is known lets a panel
       * without a size fall back to its own declared share, which is the
       * value the resolve effect is about to hand it anyway. */
      if (!settled) {
        const map: Record<string, number> = {};
        for (const id of panelIds) {
          const size = sizes[id];
          if (Number.isFinite(size)) map[id] = size as number;
        }
        return map;
      }
      const enforced = enforce(
        panelIds.map((id) => sizes[id] ?? 0),
        constraints,
      );
      const map: Record<string, number> = {};
      panelIds.forEach((id, i) => {
        map[id] = sizeAt(enforced, i);
      });
      return map;
    }, [panelIds, sizes, constraints, settled]);

    const collapsedIds = React.useMemo(() => {
      const set = new Set<string>();
      panelIds.forEach((id, i) => {
        const limits = limitsAt(constraints, i);
        // A panel with no size yet is unknown, not collapsed. Calling it
        // collapsed here fires `onCollapsedChange(true)` at a controlled
        // consumer whose state then really does collapse the panel.
        const size = layout[id];
        if (limits.collapsible && Number.isFinite(size) && (size as number) <= limits.collapsed + EPSILON) {
          set.add(id);
        }
      });
      return set;
    }, [panelIds, layout, constraints]);

    const onLayoutRef = React.useRef(onLayout);
    onLayoutRef.current = onLayout;

    React.useEffect(() => {
      if (panelIds.length === 0) return;
      if (panelIds.some((id) => !Number.isFinite(layout[id]))) return;
      onLayoutRef.current?.(panelIds.map((id) => layout[id] ?? 0));
    }, [panelIds, layout]);

    /* ---------------------------------------------------------------------
     * Mutations
     * ------------------------------------------------------------------ */

    const pivotOf = React.useCallback(
      (handleId: string) => {
        // The panel index the handle sits after, found by walking the sorted
        // registry rather than by counting children.
        const handleIndex = order.indexOf(handleId);
        if (handleIndex < 0) return -1;
        let pivot = -1;
        for (let i = 0; i < handleIndex; i++) {
          const itemId = order[i];
          if (itemId != null && registry.get(itemId)?.kind === "panel") pivot += 1;
        }
        return pivot;
      },
      [order],
    );

    /* Every gesture starts from what is ON SCREEN, not from the intent behind
     * it. Dragging a panel that is currently squeezed by its own px minimum
     * has to move from where the reader sees it. */
    const currentSizes = React.useCallback(
      () => panelIds.map((id) => layout[id] ?? 0),
      [panelIds, layout],
    );

    /* The size a panel had before it was shut, so expanding it puts it back
     * where the reader left it rather than at some computed default.
     *
     * Recorded on the TRANSITION, in the handler that causes it, rather than
     * from an effect watching the collapsed state. An effect would have to
     * observe the size one render before the collapse and hold it, which puts
     * the correctness of "reopen where it was" on React's effect ordering
     * between a panel's controlled-collapse effect and the group's — and that
     * ordering is exactly what changes when a panel is collapsed on mount. */
    const restoreSizes = React.useRef<Record<string, number>>({});

    const drag = React.useCallback(
      (handleId: string, snapshot: number[], deltaPercent: number) => {
        const pivot = pivotOf(handleId);
        if (pivot < 0) return;
        const next = resizeAt(snapshot, constraints, pivot, deltaPercent);

        panelIds.forEach((id, i) => {
          const limits = limitsAt(constraints, i);
          if (!limits.collapsible) return;
          const wasOpen = sizeAt(snapshot, i) > limits.collapsed + EPSILON;
          const isShut = sizeAt(next, i) <= limits.collapsed + EPSILON;
          if (wasOpen && isShut) restoreSizes.current[id] = sizeAt(snapshot, i);
        });

        commit(panelIds, next);
      },
      [pivotOf, panelIds, constraints, commit],
    );

    const nudge = React.useCallback(
      (handleId: string, deltaPercent: number) => {
        drag(handleId, currentSizes(), deltaPercent);
      },
      [drag, currentSizes],
    );

    const extreme = React.useCallback(
      (handleId: string, edge: "min" | "max") => {
        // 100 is further than any single transfer can go, so it saturates
        // against the constraints — which is exactly "as far as it will go".
        drag(handleId, currentSizes(), edge === "max" ? 100 : -100);
      },
      [drag, currentSizes],
    );

    /**
     * Move one panel to an exact size, taking the difference from (or giving
     * it to) the panel on the other side of its nearest handle. Snapping is
     * off: a programmatic target is a target, not a gesture to interpret.
     */
    const resizePanelTo = React.useCallback(
      (index: number, target: number) => {
        if (index < 0 || panelIds.length < 2) return;
        const snapshot = currentSizes();
        const delta = target - sizeAt(snapshot, index);
        const next =
          index < panelIds.length - 1
            ? resizeAt(snapshot, constraints, index, delta, false)
            : resizeAt(snapshot, constraints, index - 1, -delta, false);
        commit(panelIds, next);
      },
      [panelIds, constraints, currentSizes, commit],
    );

    const setPanelCollapsed = React.useCallback(
      (panelId: string, collapsed: boolean) => {
        const index = panelIds.indexOf(panelId);
        if (index < 0) return;
        const limits = limitsAt(constraints, index);
        if (!limits.collapsible) return;

        const current = layout[panelId] ?? 0;
        const isCollapsed = current <= limits.collapsed + EPSILON;
        if (isCollapsed === collapsed) return;

        if (collapsed) {
          restoreSizes.current[panelId] = current;
          resizePanelTo(index, limits.collapsed);
        } else {
          // Where it was, then where it started, then an equal share — the
          // last of which is only ever reached by a panel that was collapsed
          // on mount and has no `defaultSize`.
          const remembered = restoreSizes.current[panelId];
          const declared = toPercent(
            registry.get(panelId)?.config?.current.defaultSize,
            groupPx,
            Number.NaN,
          );
          const fallback = Number.isFinite(declared)
            ? declared
            : Math.max(limits.min, 100 / panelIds.length);
          const target = clamp(
            remembered != null && Number.isFinite(remembered) ? remembered : fallback,
            limits.min,
            limits.max,
          );
          resizePanelTo(index, target);
        }
      },
      [panelIds, layout, constraints, resizePanelTo, registry, groupPx],
    );

    const toggleCollapse = React.useCallback(
      (handleId: string) => {
        const pivot = pivotOf(handleId);
        if (pivot < 0) return;
        // The panel before the handle is the one a splitter's Enter key acts
        // on (APG calls it the primary pane); the one after is the fallback
        // for a handle whose primary side is not collapsible.
        const index = constraints[pivot]?.collapsible
          ? pivot
          : constraints[pivot + 1]?.collapsible
            ? pivot + 1
            : -1;
        const target = index < 0 ? undefined : panelIds[index];
        if (target == null) return;
        setPanelCollapsed(target, !collapsedIds.has(target));
      },
      [pivotOf, panelIds, constraints, collapsedIds, setPanelCollapsed],
    );

    const resetLayout = React.useCallback(() => {
      restoreSizes.current = {};
      setSizes(resolve(panelIds, {}, groupPx));
    }, [panelIds, groupPx, resolve]);

    const neighbours = React.useCallback(
      (handleId: string) => {
        const pivot = pivotOf(handleId);
        if (pivot < 0) return {};
        return { before: panelIds[pivot], after: panelIds[pivot + 1] };
      },
      [pivotOf, panelIds],
    );

    const constraintsOf = React.useCallback(
      (panelId: string) => {
        const index = panelIds.indexOf(panelId);
        if (index < 0) return undefined;
        return limitsAt(constraints, index);
      },
      [panelIds, constraints],
    );

    /* Panels do not animate to their first size — they arrive at it.
     *
     * The layout is resolved on the client, so a server-rendered group paints
     * its fallback split, hydrates, and corrects. With a transition declared
     * that correction is a visible slide from a layout nobody asked for, on
     * every page load. `ready` is set from a PASSIVE effect, which runs after
     * the corrected sizes have been painted, so the attribute that turns the
     * transition on can never be added in the same commit as a size change. */
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
      if (settled && !ready) setReady(true);
    }, [settled, ready]);

    // The reverse edge is a layout effect: a panel joining or leaving means
    // the layout is re-forming, and the attribute has to be gone before the
    // browser next computes style, not a paint later.
    useIsoLayoutEffect(() => {
      if (!settled && ready) setReady(false);
    }, [settled, ready]);

    /* Imperative, every commit, alongside the rendered attribute. Hydration
     * never patches attribute mismatches, so when a server-painted tree is
     * discarded and re-rendered — a mismatch during a streamed client-side
     * navigation does exactly that — the new mount can inherit a DOM node
     * that still says `data-ready` from the thrown-away pass. React then
     * diffs `undefined` against `undefined` and never removes it, and every
     * step of the fresh mount's layout cascade animates. Syncing the DOM to
     * this instance's own state closes that hole. */
    useIsoLayoutEffect(() => {
      groupRef.current?.toggleAttribute("data-ready", ready && settled);
    });

    /* And the fallback split itself, so there is as little as possible to
     * correct. A panel cannot know what its siblings declared, but the group
     * can read the children it was handed — for THIS ONE PURPOSE only. The
     * layout proper still comes from the DOM-ordered registry, because that is
     * the thing that stays right when panels are mapped, wrapped or
     * conditional; this is a hint for a frame that exists before any of that
     * has happened, and it simply does not apply when the children are not
     * plain `Resizable.Panel` elements. */
    const initialShare = React.useMemo(() => {
      if (ready) return undefined;
      let panels = 0;
      let sized = 0;
      let declared = 0;
      React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child) || child.type !== ResizablePanel) return;
        panels += 1;
        const size = staticPercent((child.props as ResizablePanelProps).defaultSize);
        if (Number.isFinite(size)) {
          sized += 1;
          declared += size;
        }
      });
      if (panels === 0 || panels === sized) return undefined;
      return Math.max(0, (100 - declared) / (panels - sized));
    }, [children, ready]);

    const context = React.useMemo<ResizableContextValue>(
      () => ({
        orientation,
        panelIds,
        initialShare,
        sizes: layout,
        collapsedIds,
        draggingId,
        register,
        invalidate,
        neighbours,
        constraintsOf,
        measure,
        drag,
        setDragging: setDraggingId,
        nudge,
        extreme,
        toggleCollapse,
        setPanelCollapsed,
        resetLayout,
        step,
        largeStep,
      }),
      [
        orientation,
        panelIds,
        initialShare,
        layout,
        collapsedIds,
        draggingId,
        register,
        invalidate,
        neighbours,
        constraintsOf,
        measure,
        drag,
        nudge,
        extreme,
        toggleCollapse,
        setPanelCollapsed,
        resetLayout,
        step,
        largeStep,
      ],
    );

    const setRef = React.useCallback(
      (element: HTMLDivElement | null) => {
        groupRef.current = element;
        if (typeof forwardedRef === "function") forwardedRef(element);
        else if (forwardedRef) forwardedRef.current = element;
      },
      [forwardedRef],
    );

    return (
      <ResizableContext.Provider value={context}>
        {useRender({
          render,
          ref: setRef,
          defaultTagName: "div",
          props: {
            className: clsx(styles.root, className),
            "data-forte": "resizable",
            "data-orientation": orientation,
            "data-resizing": draggingId ? "" : undefined,
            "data-ready": ready && settled ? "" : undefined,
            ...props,
            children: (
              <>
                {children}
                {/* A full-viewport sheet, mounted only while a handle is being
                  * dragged. It holds the resize cursor steady wherever the
                  * pointer wanders, and — the reason it exists rather than a
                  * cursor written onto <body> — it covers any iframe in the
                  * page, which would otherwise swallow the pointer stream the
                  * moment the drag crossed it and leave the handle stuck to
                  * the cursor. */}
                {draggingId ? (
                  <div
                    className={styles.dragOverlay}
                    data-forte="resizable-drag-overlay"
                    data-orientation={orientation}
                    aria-hidden="true"
                  />
                ) : null}
              </>
            ),
          },
        })}
      </ResizableContext.Provider>
    );
  },
);

/* -------------------------------------------------------------------------
 * Panel
 * ---------------------------------------------------------------------- */

export interface ResizablePanelProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Size before anyone drags anything, as a percentage of the group or a
   * `px` string. Panels without one split whatever the sized panels leave.
   */
  defaultSize?: ResizableLength;
  /**
   * Smallest the panel may be dragged to. A `px` string is honored at every
   * container width — `minSize="240px"` is the constraint a sidebar actually
   * has, and the one a percentage cannot express.
   * @default 0
   */
  minSize?: ResizableLength;
  /**
   * Largest the panel may be dragged to.
   * @default 100
   */
  maxSize?: ResizableLength;
  /**
   * Whether dragging past `minSize` snaps the panel shut instead of stopping.
   * A collapsed panel publishes `data-collapsed`, and the handle beside it
   * toggles it with <kbd>Enter</kbd>.
   * @default false
   */
  collapsible?: boolean;
  /**
   * Size when collapsed. `0` hides the panel; a small `px` value leaves an
   * icon rail behind.
   * @default 0
   */
  collapsedSize?: ResizableLength;
  /**
   * How far down the gap between `collapsedSize` and `minSize` the snap point
   * sits, as a fraction. `0.5` is the midpoint: drag past halfway and the
   * panel shuts, let go before it and it springs back to `minSize`.
   * @default 0.5
   */
  collapseThreshold?: number;
  /**
   * Controls the collapsed state. Pass it with `onCollapsedChange` to drive a
   * panel from your own button — a sidebar toggle needs no imperative handle,
   * just this pair.
   */
  collapsed?: boolean;
  /**
   * Called when the panel collapses or expands, whichever caused it — a drag
   * past the snap point, <kbd>Enter</kbd> on the handle, or your own state.
   */
  onCollapsedChange?: (collapsed: boolean) => void;
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
 * One resizable region. Sized by the group, so it takes constraints rather
 * than a size: `defaultSize` is a starting point, `minSize` and `maxSize` are
 * the bounds a drag is clamped to.
 *
 * It is `overflow: hidden` and `min-inline-size: 0`, which is what keeps a
 * long, unbreakable child — a code line, a wide table — from propping the
 * panel open past the size the group asked for. Put a scroll container inside
 * if the content needs to scroll.
 */
export const ResizablePanel = React.forwardRef<HTMLDivElement, ResizablePanelProps>(
  function ResizablePanel(
    {
      defaultSize,
      minSize,
      maxSize,
      collapsible = false,
      collapsedSize = 0,
      collapseThreshold = 0.5,
      collapsed: collapsedProp,
      onCollapsedChange,
      render,
      className,
      style,
      ...props
    },
    forwardedRef,
  ) {
    const context = useResizableContext("Panel");
    const { register, invalidate, sizes, collapsedIds, constraintsOf, setPanelCollapsed } = context;
    const id = React.useId();

    const config = React.useRef<PanelConfig>({
      defaultSize,
      minSize,
      maxSize,
      collapsible,
      collapsedSize,
      collapseThreshold,
    });
    config.current = {
      defaultSize,
      minSize,
      maxSize,
      collapsible,
      collapsedSize,
      collapseThreshold,
    };

    const entry = React.useRef<RegistryEntry>({
      id,
      kind: "panel",
      element: null,
      config,
    });

    useIsoLayoutEffect(() => register(entry.current), [register]);

    const setRef = React.useCallback(
      (element: HTMLDivElement | null) => {
        entry.current.element = element;
        if (typeof forwardedRef === "function") forwardedRef(element);
        else if (forwardedRef) forwardedRef.current = element;
      },
      [forwardedRef],
    );

    /* The constraints are read through a ref, so a change to one is invisible
     * to the group until something else makes it re-read them. Nudging the
     * revision on every constraint change is what makes `minSize` react to
     * state — a panel whose minimum grows when a toolbar appears, say. */
    useIsoLayoutEffect(() => {
      invalidate();
    }, [invalidate, defaultSize, minSize, maxSize, collapsible, collapsedSize, collapseThreshold]);

    const isCollapsed = collapsedIds.has(id);

    const changeRef = React.useRef(onCollapsedChange);
    changeRef.current = onCollapsedChange;
    const reported = React.useRef(isCollapsed);
    const correcting = React.useRef(false);
    const [, recheck] = React.useReducer((n: number) => n + 1, 0);

    /* Report first, enforce second — and never in the same pass.
     *
     * A drag that collapses a CONTROLLED panel puts the component and its
     * `collapsed` prop in disagreement for exactly one commit. Enforcing the
     * prop straight away would undo the gesture before `onCollapsedChange`
     * had reached the consumer, and the consumer's own `setState` would then
     * re-collapse it: one drag, two visible jumps and a spurious second
     * callback. So the report returns early and schedules a re-check, which
     * finds nothing to do if the consumer accepted and quietly restores the
     * panel if it did not. `correcting` marks the size change WE caused, so
     * it is not reported back to the consumer as news.
     *
     * A layout effect, not a passive one: this has to settle before paint, or
     * the correction is a visible frame at the wrong size. */
    useIsoLayoutEffect(() => {
      if (reported.current !== isCollapsed) {
        const wasCorrection = correcting.current;
        correcting.current = false;
        reported.current = isCollapsed;
        if (!wasCorrection) {
          changeRef.current?.(isCollapsed);
          recheck();
          return;
        }
      }
      if (collapsedProp !== undefined && collapsedProp !== isCollapsed) {
        correcting.current = true;
        setPanelCollapsed(id, collapsedProp);
      }
    }, [isCollapsed, collapsedProp, id, setPanelCollapsed]);

    const size = sizes[id];
    /* A panel collapsed to nothing is still in the DOM, still focusable and
     * still read out — `overflow: hidden` hides pixels, not the accessibility
     * tree, so Tab would walk into a sidebar that is not there. `inert` is the
     * one thing that removes both. Only when the collapsed size is genuinely
     * zero: a collapsible panel that shuts to an icon rail is still usable. */
    const collapsedSizePercent = constraintsOf(id)?.collapsed ?? 0;
    const hidden = isCollapsed && collapsedSizePercent < EPSILON;

    /* The DOM property, not the prop: React 18 drops a boolean `inert` (it is
     * an unknown attribute there) and React 19 reads the `""` workaround as
     * false, so no one prop value works across the peer range. The property
     * assignment does. Never true during SSR — collapse is resolved on the
     * client — so there is nothing for hydration to miss. */
    useIsoLayoutEffect(() => {
      const element = entry.current.element;
      if (element) element.inert = hidden;
    }, [hidden]);

    const declaredShare = staticPercent(defaultSize);

    return useRender({
      render,
      ref: setRef,
      defaultTagName: "div",
      props: {
        // The registry id doubles as the DOM id so the handle's
        // `aria-controls` resolves to a real element. A consumer's own `id`
        // (spread below) wins, at the cost of that linkage.
        id,
        className: clsx(styles.panel, className),
        "data-forte": "resizable-panel",
        "data-orientation": context.orientation,
        "data-collapsed": isCollapsed ? "" : undefined,
        style: {
          /* `flexGrow` alone is the layout. `flexBasis: 0` makes the grow
           * factor describe the WHOLE panel rather than the leftover space,
           * which is what turns the number into a percentage.
           *
           * Before the group has resolved the layout the panel falls back to
           * its own `defaultSize`, or — for a panel that declared none — to
           * the share the group worked out from its siblings. That makes the
           * server-rendered split identical to the resolved one for the
           * ordinary anatomy, so there is nothing to correct on hydration and
           * nothing to see. */
          flexGrow:
            size ??
            (Number.isFinite(declaredShare) ? declaredShare : (context.initialShare ?? 1)),
          ...style,
        },
        ...props,
      },
    });
  },
);

/* -------------------------------------------------------------------------
 * Handle
 * ---------------------------------------------------------------------- */

export interface ResizableHandleProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "className"> {
  /**
   * Draws a grip in the middle of the divider — the visible affordance for a
   * control that is otherwise a hairline.
   * @default false
   */
  grip?: boolean;
  /**
   * Makes the divider inert: not focusable, not draggable, and drawn without
   * a hover cue.
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether a double-click resets the group to its default layout. On by
   * default: it costs nothing, it is what every splitter does, and it is the
   * only way back from a layout dragged into a corner without a reload.
   * @default true
   */
  resetOnDoubleClick?: boolean;
  /**
   * Additional class name(s). Applied after the internal styles so consumer
   * utilities (e.g. Tailwind) win without needing `!important`.
   */
  className?: string;
}

interface DragState {
  pointerId: number;
  origin: number;
  sign: number;
  groupPx: number;
  snapshot: number[];
}

/**
 * The divider between two panels — draggable, focusable, and a real
 * `role="separator"` with the window-splitter keyboard interface: arrows to
 * move it, <kbd>Page Up</kbd>/<kbd>Page Down</kbd> for a bigger step,
 * <kbd>Home</kbd>/<kbd>End</kbd> for the extremes, and <kbd>Enter</kbd> to
 * collapse or expand a collapsible neighbour.
 *
 * Its hit area is expanded to the 24px minimum (SC 2.5.8) without changing
 * the hairline it draws, so it can be grabbed by a shaky hand or a thumb
 * without becoming a visible gutter.
 */
export const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleProps>(
  function ResizableHandle(
    {
      grip = false,
      disabled = false,
      resetOnDoubleClick = true,
      className,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onKeyDown,
      onBlur,
      onDoubleClick,
      ...props
    },
    forwardedRef,
  ) {
    const context = useResizableContext("Handle");
    const {
      orientation,
      sizes,
      collapsedIds,
      draggingId,
      register,
      neighbours,
      constraintsOf,
      measure,
      drag,
      setDragging,
      nudge,
      extreme,
      toggleCollapse,
      resetLayout,
      step,
      largeStep,
    } = context;
    const id = React.useId();

    const entry = React.useRef<RegistryEntry>({ id, kind: "handle", element: null, config: null });
    useIsoLayoutEffect(() => register(entry.current), [register]);

    const setRef = React.useCallback(
      (element: HTMLDivElement | null) => {
        entry.current.element = element;
        if (typeof forwardedRef === "function") forwardedRef(element);
        else if (forwardedRef) forwardedRef.current = element;
      },
      [forwardedRef],
    );

    const dragState = React.useRef<DragState | null>(null);
    const isDragging = draggingId === id;

    /* A pointer can report faster than the screen refreshes — a 1000Hz mouse
     * delivers a dozen `pointermove`s per frame, and a coalesced trackpad
     * burst more — and every one of them would otherwise be a full React
     * render whose result is thrown away by the next before anything is
     * painted. Keep the newest coordinate, resize once per frame. */
    const pending = React.useRef<{ frame: number; coordinate: number }>({
      frame: 0,
      coordinate: 0,
    });

    // The rAF fires a frame after the render that scheduled it, so it reads
    // the resize function through a ref rather than closing over a stale one.
    const dragFn = React.useRef(drag);
    dragFn.current = drag;

    /* `:focus-visible` cannot decide this one for us. The pointerdown is
     * `preventDefault`ed — it has to be, or the drag becomes a text selection
     * — which suppresses the compatibility mousedown the browser uses to
     * notice that the interaction was a pointer. The programmatic `focus()`
     * that follows is then treated as focus of unknown provenance, and on the
     * page's FIRST interaction, with no modality recorded yet, Chrome resolves
     * that in favor of showing the ring. Hence a ring that appears on the
     * first drag of a fresh page and never again.
     *
     * So the modality is tracked here instead: pointer focus is silent,
     * keyboard focus rings, and the first key pressed on a pointer-focused
     * handle brings the ring back. */
    const [pointerFocus, setPointerFocus] = React.useState(false);

    const { before, after } = neighbours(id);
    const beforeConstraints = before ? constraintsOf(before) : undefined;

    /* What the separator reports is the size of the pane it controls — the
     * one before it, which APG calls the primary pane — and the bounds are
     * that pane's own. The floor is its COLLAPSED size when it is collapsible,
     * not its minimum: the minimum is not the smallest the handle can make it,
     * and announcing a bound the control can be dragged straight past is worse
     * than announcing none. */
    const value = before != null ? Math.round(sizes[before] ?? 0) : undefined;
    const valueMin = Math.round(beforeConstraints?.collapsible
      ? beforeConstraints.collapsed
      : (beforeConstraints?.min ?? 0));
    const valueMax = Math.round(beforeConstraints?.max ?? 100);

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (event.defaultPrevented || disabled || event.button !== 0) return;

      const groupPx = measure();
      if (groupPx <= 0) return;

      const element = event.currentTarget;
      const rtl =
        orientation === "horizontal" &&
        typeof window !== "undefined" &&
        window.getComputedStyle(element).direction === "rtl";

      dragState.current = {
        pointerId: event.pointerId,
        origin: orientation === "horizontal" ? event.clientX : event.clientY,
        // `translate` and pointer coordinates are physical; the layout is
        // logical. In RTL a rightward drag has to SHRINK the panel that comes
        // first in the flow, which is the one on the right.
        sign: rtl ? -1 : 1,
        groupPx,
        snapshot: context.panelIds.map((panelId) => sizes[panelId] ?? 0),
      };

      // Stops the drag from turning into a text selection across the panels,
      // and stops the browser deciding this was the start of a native drag.
      event.preventDefault();
      setPointerFocus(true);
      // `preventScroll`: `.forte-focus-ring` carries a `scroll-margin`, and a
      // handle near the viewport edge is inside it — the default scroll-into
      // -view would yank the page sideways at the start of the drag.
      element.focus({ preventScroll: true });
      setDragging(id);

      /* Last, and defensively. `setPointerCapture` throws `NotFoundError` for
       * a pointer that is no longer active — a pointer released between the
       * event being queued and this handler running, and every synthetic
       * `PointerEvent` a test dispatches. Thrown from the middle of the
       * handler it would abort the rest of it, leaving a gesture that resizes
       * but never sets `data-resizing`, never takes focus and never rings:
       * broken in a way that only shows up under automation. */
      try {
        element.setPointerCapture(event.pointerId);
      } catch {
        // No capture, so a pointer leaving the handle ends the drag early.
        // Better than no drag at all.
      }
    };

    /* Measured from the ORIGIN against the snapshot, never accumulated frame
     * to frame. An incremental delta would bank every clamp: drag past a
     * panel's minimum, come back, and the handle would trail the pointer by
     * however far it had been over-dragged. */
    const applyPending = React.useCallback(() => {
      const state = dragState.current;
      if (!state) return;
      const delta =
        ((pending.current.coordinate - state.origin) * state.sign * 100) / state.groupPx;
      dragFn.current(id, state.snapshot, delta);
    }, [id]);

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      const state = dragState.current;
      if (!state || state.pointerId !== event.pointerId) return;

      pending.current.coordinate =
        orientation === "horizontal" ? event.clientX : event.clientY;
      if (pending.current.frame !== 0) return;
      pending.current.frame = requestAnimationFrame(() => {
        pending.current.frame = 0;
        applyPending();
      });
    };

    const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
      const state = dragState.current;
      if (!state || state.pointerId !== event.pointerId) return;

      // Land on the last coordinate rather than wherever the previous frame
      // happened to stop: releasing must leave the divider under the pointer.
      if (pending.current.frame !== 0) {
        cancelAnimationFrame(pending.current.frame);
        pending.current.frame = 0;
        applyPending();
      }

      dragState.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setDragging(null);
    };

    // A pointer released outside the window, or a component unmounted
    // mid-drag, would otherwise leave a frame queued against a dead handle.
    React.useEffect(
      () => () => {
        if (pending.current.frame !== 0) cancelAnimationFrame(pending.current.frame);
      },
      [],
    );

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      // Any key at all, not just the ones that resize: reaching for the
      // keyboard is the signal, and Tab away and back should already be
      // ringing by the time it lands.
      if (pointerFocus) setPointerFocus(false);
      if (event.defaultPrevented || disabled) return;

      const horizontal = orientation === "horizontal";
      const decrease = horizontal ? "ArrowLeft" : "ArrowUp";
      const increase = horizontal ? "ArrowRight" : "ArrowDown";
      // Physical keys move the handle the way they point, RTL included —
      // matching the drag, which is the gesture the key is standing in for.
      const sign =
        horizontal &&
        typeof window !== "undefined" &&
        window.getComputedStyle(event.currentTarget).direction === "rtl"
          ? -1
          : 1;

      switch (event.key) {
        case decrease:
          nudge(id, -step * sign);
          break;
        case increase:
          nudge(id, step * sign);
          break;
        case "PageUp":
          nudge(id, -largeStep * sign);
          break;
        case "PageDown":
          nudge(id, largeStep * sign);
          break;
        case "Home":
          extreme(id, "min");
          break;
        case "End":
          extreme(id, "max");
          break;
        case "Enter":
          toggleCollapse(id);
          break;
        case "F6":
          // Reserved by APG for cycling panes; the page owns that, not us.
          return;
        default:
          return;
      }

      event.preventDefault();
    };

    const handleDoubleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      onDoubleClick?.(event);
      if (event.defaultPrevented || disabled || !resetOnDoubleClick) return;
      resetLayout();
    };

    const collapsedNeighbour =
      (before != null && collapsedIds.has(before)) || (after != null && collapsedIds.has(after));

    return (
      <div
        ref={setRef}
        role="separator"
        // A separator between side-by-side panes is itself vertical. The
        // attribute describes the LINE, not the axis it travels along, and
        // getting it backwards tells a screen reader the arrow keys are the
        // other pair.
        aria-orientation={orientation === "horizontal" ? "vertical" : "horizontal"}
        aria-valuenow={value}
        aria-valuemin={valueMin}
        aria-valuemax={valueMax}
        aria-controls={before}
        aria-disabled={disabled || undefined}
        aria-label="Resize panels"
        tabIndex={disabled ? undefined : 0}
        className={clsx(styles.handle, "forte-focus-ring", "forte-target", className)}
        data-pointer-focus={pointerFocus ? "" : undefined}
        data-forte="resizable-handle"
        data-orientation={orientation}
        data-dragging={isDragging ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        data-collapsed={collapsedNeighbour ? "" : undefined}
        {...props}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          endDrag(event);
        }}
        onPointerCancel={endDrag}
        onKeyDown={handleKeyDown}
        onBlur={(event) => {
          onBlur?.(event);
          setPointerFocus(false);
        }}
        onDoubleClick={handleDoubleClick}
      >
        {grip ? (
          <span className={styles.grip} data-forte="resizable-grip" aria-hidden="true">
            <span className={styles.gripDots} />
          </span>
        ) : null}
      </div>
    );
  },
);

/**
 * A splitter: two or more panels the reader can re-proportion by dragging the
 * divider between them, with the keyboard, or from your own toggle button.
 *
 * ```tsx
 * <Resizable.Group orientation="horizontal" className="h-72">
 *   <Resizable.Panel defaultSize={25} minSize="180px" collapsible>
 *     Sidebar
 *   </Resizable.Panel>
 *   <Resizable.Handle grip />
 *   <Resizable.Panel>Content</Resizable.Panel>
 * </Resizable.Group>
 * ```
 *
 * Groups nest: put a group inside a panel and the inner panels register with
 * the inner group, so a three-pane editor layout is two groups and no
 * coordination between them.
 *
 * @summary Panels the user re-proportions by dragging the divider between them
 *   — keyboard operable, constrainable, and persistable.
 * @category Content & layout
 */
export const Resizable = {
  Group: ResizableGroup,
  Panel: ResizablePanel,
  Handle: ResizableHandle,
};
