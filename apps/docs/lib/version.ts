import pkg from "@forte-ui/react/package.json";

/**
 * The library version the site documents, read from `@forte-ui/react`'s own
 * `package.json` at build time.
 *
 * The library's, not the docs app's. `apps/docs/package.json` carries the
 * same number — `/release-prep` bumps it and `pnpm release` refuses a
 * mismatch — but it is a mirror kept for the record, and a mirror is the
 * copy that can lag. The package the reader installs is the source of
 * truth, and the library exports its manifest under `./package.json` for
 * exactly this kind of read.
 *
 * A build-time constant: the site is a static export, so the number is
 * baked into the HTML and never fetched. It is a plain string, which is
 * what lets both a server component (the hero) and a client one (the app
 * bar) import it without crossing the boundary as a client reference.
 */
export const LIBRARY_VERSION: string = pkg.version;

/** The GitHub release the version pill links to. */
export const RELEASE_URL = `https://github.com/arsen/forte-ui/releases/tag/v${LIBRARY_VERSION}`;
