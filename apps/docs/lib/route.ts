/**
 * One canonical spelling of a route, for comparing two of them.
 *
 * Every href on this site ends in a slash, because `trailingSlash: true` in
 * next.config makes that the URL a page actually answers on. That is only half
 * of a match, though: `usePathname()` reports the URL as the browser has it,
 * the App Router normalizes nothing against the config, and a static host is
 * free to serve `/components/button` without redirecting. So the pathname the
 * rail compares against can arrive with the slash or without it depending on
 * where the page is served from — and an exact `===` then silently highlights
 * nothing, which is the failure mode this exists to remove.
 *
 * Root stays `"/"`: it is the one route whose slash is not trailing.
 */
export function routeKey(path: string): string {
  const bare = path.replace(/\/+$/, "");
  return bare === "" ? "/" : `${bare}/`;
}
