"use client";

import * as React from "react";

/*
 * The theme store behind `useTheme` and the uncontrolled `ThemeToggle`.
 *
 * The DOCUMENT is the source of truth, not React state and not storage:
 * `data-theme` on `<html>` is what the stylesheet reads, so it is the one
 * place the current mode is always correct — including when something other
 * than this module wrote it (a static `data-theme="dark"` in a server layout,
 * next-themes, the user's own script). Storage is only the persistence layer
 * that `themeInitScript` replays before first paint. Deriving state from the
 * attribute rather than from storage also self-heals the one misconfiguration
 * we can expect — a stored choice with no init script — by reporting what is
 * actually on screen instead of what storage wishes were on screen.
 *
 * "system" is modelled as the ABSENCE of the attribute and of the storage
 * record. With no attribute, every token resolves through `light-dark()`
 * against the OS preference at paint time, so following a live OS switch
 * costs no JavaScript at all; the `matchMedia` listener below exists only to
 * keep the `resolvedTheme` this hook REPORTS in step, never to rewrite the
 * attribute.
 */

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedThemeMode = "light" | "dark";

export interface UseThemeReturn {
  /** The stated preference: an explicit mode, or `"system"` when the page follows the OS. */
  theme: ThemeMode;
  /** What is actually on screen — `theme`, with `"system"` resolved against the OS preference. */
  resolvedTheme: ResolvedThemeMode;
  /** Write a preference. `"light"` / `"dark"` set `data-theme` on `<html>` and persist; `"system"` removes both. */
  setTheme: (theme: ThemeMode) => void;
}

/* One storage key for the whole origin, and the same one `themeInitScript`
 * replays — the attribute and its record have to move as a pair, because a
 * record the script does not read (or a script reading a record nothing
 * writes) is exactly the flash this module exists to prevent. */
const STORAGE_KEY = "forte-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

interface ThemeSnapshot {
  theme: ThemeMode;
  resolvedTheme: ResolvedThemeMode;
}

/* The server cannot know the visitor's OS preference or storage, so the
 * server (and hydration) snapshot is the zero-configuration default. A
 * component must not branch its markup on `resolvedTheme` if it wants to be
 * flash-free — `ThemeToggle` keys its icons off the attribute in CSS for
 * exactly this reason — but for the ones that do, React re-renders with the
 * real snapshot immediately after hydration. */
const SERVER_SNAPSHOT: ThemeSnapshot = { theme: "system", resolvedTheme: "light" };

const listeners = new Set<() => void>();

/* Cached so `getSnapshot` returns a stable reference between changes —
 * `useSyncExternalStore` compares by identity and would loop on a fresh
 * object per call. Nulled on every emit, and on the first subscribe, which
 * covers a change that lands between the initial render (which may read a
 * snapshot) and the effect that attaches the listeners. */
let snapshot: ThemeSnapshot | null = null;

function documentTheme(): ThemeMode {
  const attr = document.documentElement.getAttribute("data-theme");
  return attr === "light" || attr === "dark" ? attr : "system";
}

function storedTheme(): ThemeMode {
  try {
    const record = localStorage.getItem(STORAGE_KEY);
    return record === "light" || record === "dark" ? record : "system";
  } catch {
    /* Private mode / blocked storage: the toggle still works for this page. */
    return "system";
  }
}

function applyTheme(next: ThemeMode) {
  const root = document.documentElement;
  if (next === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", next);
}

function emit() {
  snapshot = null;
  for (const listener of listeners) listener();
}

function getSnapshot(): ThemeSnapshot {
  if (snapshot === null) {
    const theme = documentTheme();
    const resolvedTheme =
      theme === "system" ? (window.matchMedia(DARK_QUERY).matches ? "dark" : "light") : theme;
    snapshot = { theme, resolvedTheme };
  }
  return snapshot;
}

function getServerSnapshot(): ThemeSnapshot {
  return SERVER_SNAPSHOT;
}

/* The document-level listeners are attached while at least one hook is
 * mounted, and lazily — this module is also evaluated during SSR, where none
 * of these globals exist. */
let detach: (() => void) | null = null;

function attach() {
  /* An attribute observer rather than trusting our own `setTheme` to be the
   * only writer: next-themes, a router transition, or the consumer's own code
   * may set `data-theme` directly, and a hook that keeps reporting the old
   * value against a page that visibly changed is worse than no hook. */
  const observer = new MutationObserver(emit);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });

  /* Fires in OTHER tabs only, which is the point: it carries a choice made
   * elsewhere onto this tab's document. The attribute write re-enters through
   * the observer above, so no manual emit. `key === null` is a full
   * `storage.clear()`, which also cleared ours. */
  const onStorage = (event: StorageEvent) => {
    if (event.key !== null && event.key !== STORAGE_KEY) return;
    applyTheme(storedTheme());
  };
  window.addEventListener("storage", onStorage);

  /* Only `resolvedTheme` moves here — while "system", the attribute stays
   * absent and CSS follows the OS on its own. */
  const media = window.matchMedia(DARK_QUERY);
  media.addEventListener("change", emit);

  detach = () => {
    observer.disconnect();
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", emit);
    detach = null;
  };
}

function subscribe(listener: () => void): () => void {
  if (listeners.size === 0) {
    snapshot = null;
    attach();
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) detach?.();
  };
}

/** Shared by the hook and the uncontrolled `ThemeToggle`, so a toggle and a
 *  `useTheme` elsewhere on the page always agree without either knowing the
 *  other exists. */
export function setDocumentTheme(next: ThemeMode) {
  applyTheme(next);
  try {
    if (next === "system") localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* Storage refused: the page still switches, the choice is not remembered. */
  }
  /* The observer already fired for an attribute change; this emit covers the
   * moves it cannot see (system → system with a stale resolved value) and is
   * idempotent for the rest. */
  emit();
}

/** What is on screen right now, read straight off the document — for event
 *  handlers that need the current mode without subscribing a render to it. */
export function resolvedDocumentTheme(): ResolvedThemeMode {
  const theme = documentTheme();
  if (theme !== "system") return theme;
  return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

/**
 * Read and write the page's colour mode.
 *
 * `theme` is the stated preference (`"system"` when the page follows the OS),
 * `resolvedTheme` is what that currently amounts to on screen, and `setTheme`
 * writes a new one — `"light"` / `"dark"` set `data-theme` on `<html>` and
 * persist to `localStorage("forte-theme")`, `"system"` removes both and hands
 * control back to the OS preference.
 *
 * Pair it with `ThemeScript` (or the scaffolded `index.html` snippet) so a
 * persisted choice is replayed before first paint. On the server — and during
 * the hydration render — the snapshot is `{ theme: "system", resolvedTheme:
 * "light" }`, so markup that must be correct at first paint should key off
 * `data-theme` in CSS rather than branch on these values.
 */
export function useTheme(): UseThemeReturn {
  const { theme, resolvedTheme } = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return { theme, resolvedTheme, setTheme: setDocumentTheme };
}
