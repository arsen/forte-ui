import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * `out/sitemap.xml` — every route on the site, read off the filesystem.
 *
 * ---------------------------------------------------------------------------
 * Why this walks `app/` instead of importing a list
 * ---------------------------------------------------------------------------
 * There are two page lists already: `NAV` in `components/nav.tsx` and
 * `COMPONENT_PAGES` in the generated catalog. Neither is usable here, for
 * different reasons.
 *
 * `nav.tsx` is `"use client"`, and every export of a client module arrives on
 * the server as an opaque client reference — `NAV.map` would not be a
 * function. The catalog is importable but covers only the component pages,
 * so the eleven routes around them would still be typed out by hand, which is
 * the arrangement `build-catalog.mjs` exists to have removed.
 *
 * The directories under `app/` are the routes, so they are the list, and the
 * two generators that also need this answer — `build-toc.mjs` and
 * `build-catalog.mjs` — reach it the same way. A page added without a nav
 * entry still gets crawled, and there is nothing to keep in step.
 *
 * `process.cwd()` is this package's own directory: turbo runs a package script
 * from the package, and `next build` does not change it.
 */
export const dynamic = "force-static";

/**
 * Every route that answers with HTML.
 *
 * Route GROUPS are stripped rather than walked around: `(docs)` is a
 * parenthesised directory that organizes the layout tree and contributes
 * nothing to the URL, so `app/(docs)/components/button` is `/components/button`.
 * Miss that and every documentation URL in the sitemap is a 404 — which a
 * crawler reports as a broken site rather than as a bad sitemap.
 */
function routes(dir: string, prefix = ""): string[] {
  const found: string[] = [];

  for (const entry of readdirSync(dir).sort()) {
    // Skip Next's own reserved files and anything private (`_components`).
    if (entry.startsWith("_") || entry.startsWith(".")) continue;

    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      const segment = entry.startsWith("(") && entry.endsWith(")") ? prefix : `${prefix}/${entry}`;
      found.push(...routes(full, segment));
    } else if (entry === "page.mdx" || entry === "page.tsx") {
      // `trailingSlash: true` in next.config, so these are the URLs the site
      // actually answers on — and the ones `alternates.canonical` emits. A
      // sitemap that disagreed with the canonical tag would ask crawlers to
      // pick between two spellings of every page.
      found.push(prefix === "" ? "/" : `${prefix}/`);
    }
  }

  return found;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return routes(join(process.cwd(), "app")).map((route) => ({
    url: `${SITE_URL}${route}`,
    // No `lastModified`. The honest value is the page's own last edit, and the
    // only source for it here is the build machine's mtime — which a fresh
    // clone sets to the checkout time, telling crawlers the entire site
    // changed on every deploy. A wrong date is worse than no date.
    changeFrequency: "weekly",
    // The home page is the entry point; everything else is documentation of
    // equal standing, and inventing a ranking between component pages would
    // just be noise.
    priority: route === "/" ? 1 : 0.8,
  }));
}
