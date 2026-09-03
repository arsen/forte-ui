"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import type { Analytics as FirebaseAnalytics } from "firebase/analytics";
import { firebaseConfig, isProduction, type FirebaseConfig } from "@/lib/env";

/**
 * Tracking is on only in a production build that carries a Firebase config.
 *
 * `firebaseConfig` is already `undefined` without a measurement id — the one
 * value Analytics cannot work without, and the one a fork is least likely
 * to have copied by accident — see `lib/env.ts`. The production guard keeps
 * `next dev` on a machine with a filled-in `.env.local` from counting every
 * reload as a visitor.
 */
const config = isProduction ? firebaseConfig : undefined;

/**
 * Loads Firebase Analytics once, off the critical path.
 *
 * A dynamic import so the SDK is a separate chunk fetched after hydration,
 * not part of the bundle every page pays for. `isSupported()` is the guard
 * Firebase itself asks for: it is `false` where `indexedDB` or cookies are
 * unavailable — a privacy-mode browser, some embedded webviews — and
 * `getAnalytics` throws there instead of degrading.
 */
let instance: Promise<FirebaseAnalytics | null> | null = null;
function load(config: FirebaseConfig): Promise<FirebaseAnalytics | null> {
  instance ??= (async () => {
    try {
      const [{ initializeApp, getApps }, { getAnalytics, isSupported }] = await Promise.all([
        import("firebase/app"),
        import("firebase/analytics"),
      ]);
      if (!(await isSupported())) return null;
      const app = getApps()[0] ?? initializeApp(config);
      return getAnalytics(app);
    } catch {
      // A blocked script or a rejected network request is not the site's
      // problem to surface — the reader sees a docs page either way.
      return null;
    }
  })();
  return instance;
}

/**
 * Page-view tracking for the docs site — visitors, the pages they read, and
 * the referrer or campaign that brought them.
 *
 * Renders nothing. Firebase's `gtag` fires the FIRST `page_view` itself when
 * the SDK initializes, and that event is the one carrying `document.referrer`
 * and any `utm_*` in the URL, which is where "where did they come from" is
 * answered. What it cannot see is a client-side navigation: the App Router
 * swaps the page without a load, so every route change after the first is
 * reported here by hand, keyed on `usePathname`. The first pathname is
 * skipped or the landing page would count twice.
 *
 * `page_location` is read from `location.href` rather than rebuilt from the
 * pathname, so the trailing slash and any query string match what the
 * exported site actually serves. `page_title` is awaited: the App Router
 * streams a route's `metadata` after its body, so at the moment the pathname
 * effect runs `document.title` is briefly empty, and reading it there logged
 * every navigation as "(not set)".
 */
/**
 * Resolves with `document.title` once there is one.
 *
 * Immediate when the title is already present. Otherwise a MutationObserver
 * on `<head>` waits for React to hoist the new `<title>` in, capped at a
 * second so a route that sets no title still reports its view.
 */
function nextTitle(): Promise<string> {
  if (document.title) return Promise.resolve(document.title);
  return new Promise((resolve) => {
    const done = () => {
      observer.disconnect();
      clearTimeout(timer);
      resolve(document.title);
    };
    const observer = new MutationObserver(() => {
      if (document.title) done();
    });
    observer.observe(document.head, { childList: true, subtree: true, characterData: true });
    const timer = setTimeout(done, 1000);
  });
}

export function Analytics() {
  const pathname = usePathname();
  const previous = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!config) return;
    const isFirst = previous.current === null;
    previous.current = pathname;
    if (isFirst) {
      void load(config);
      return;
    }
    void load(config).then(async (analytics) => {
      if (!analytics) return;
      const [{ logEvent }, title] = await Promise.all([import("firebase/analytics"), nextTitle()]);
      logEvent(analytics, "page_view", {
        page_location: window.location.href,
        page_path: window.location.pathname,
        page_title: title,
      });
    });
  }, [pathname]);

  return null;
}
