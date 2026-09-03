/**
 * Where this site lives, for the things that cannot work it out themselves.
 *
 * Three consumers, none of which can use a relative URL:
 *
 *   - `metadataBase` in the root layout. A share card's `og:image` is fetched
 *     by a crawler that has no page to resolve `/opengraph-image.png` against,
 *     so Next refuses to emit a relative one — without an origin here the tag
 *     is silently dropped and the link renders as bare text, which is the
 *     exact failure this file exists to fix.
 *   - `sitemap.ts`, whose entries are absolute by specification.
 *   - the OG cards, which print the domain: a card is very often read before
 *     the link under it, and a card with no address on it says nothing about
 *     where it goes.
 *
 * A constant rather than a `lib/env.ts` read, deliberately. That file is for
 * values that differ per deployment; this one must not. The site is a static
 * export published to one domain, and a preview build that pointed its
 * canonical URLs and card images at a preview host would teach crawlers the
 * wrong home for the whole site.
 *
 * No trailing slash: every consumer appends a path that starts with one, and
 * `new URL()` in `metadataBase` normalizes what it is given anyway.
 */
export const SITE_URL = "https://forte-ui.com";

/** The site's name as a reader sees it — the app bar's wordmark, in words. */
export const SITE_NAME = "Forte UI";

/**
 * The one-line pitch, shared by the root `description` and the home page's
 * card. Long enough to say what is different (one variable, no runtime),
 * short enough that neither X nor Discord truncates it — both cut a
 * description near 200 characters and a sentence lost mid-clause reads worse
 * than a shorter one that finished.
 */
export const SITE_TAGLINE =
  "An accessible React component library built on Base UI. One CSS variable re-themes the entire system, motion respects every user preference, and nothing ships a runtime.";

/**
 * The X account, for `twitter:site` / `twitter:creator`. The handle form with
 * the `@`, which is what the tag wants — a bare name is ignored rather than
 * rejected, so this is one to get right by looking, not by testing.
 */
export const X_HANDLE = "@dofortech";
