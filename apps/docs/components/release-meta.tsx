import { PROSE_LINK } from "./styles";

/**
 * The line under a release heading on the changelog page: when it shipped,
 * and where its diff is.
 *
 * A component rather than markdown in the generated page because the date
 * wants a `<time dateTime>` and the paragraph wants to read as metadata — one
 * step quieter than the entries under it — and a lowercase element written as
 * literal JSX in MDX does NOT pass through the mapping in `mdx-components.tsx`,
 * so `<p className>` around a markdown link would leave the link unstyled.
 * Here the link carries the prose link style by name instead, which is what
 * `PROSE_LINK` in `styles.ts` is for.
 *
 * A Server Component: it formats one date and renders one link, and the
 * generated page is static. `en-US` is the site's language and `UTC` is what
 * makes a bare `YYYY-MM-DD` mean the same day on every build machine — parsed
 * in local time, `2026-09-03` becomes September 2nd on a build west of
 * Greenwich.
 */
export function ReleaseMeta({
  date,
  href,
  kind,
}: {
  /** The release date as written in CHANGELOG.md, `YYYY-MM-DD`. */
  date: string;
  /** The release's link definition from the foot of the file. */
  href: string;
  /**
   * What the link is: a `compare` view against the previous release, or the
   * `release` itself for the first one, which has nothing before it.
   */
  kind: "compare" | "release";
}) {
  const label = new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
  return (
    <p className="mb-4 text-2 text-foreground-muted">
      Released <time dateTime={date}>{label}</time>
      <span aria-hidden="true"> · </span>
      <a className={PROSE_LINK} href={href} target="_blank" rel="noreferrer">
        {kind === "compare" ? "Compare with the previous release" : "View the release"}
      </a>
    </p>
  );
}
