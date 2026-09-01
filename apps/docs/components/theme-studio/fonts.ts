/* The catalogue moved to the create-forte-ui package, which is where the CLI's
 * font prompt reads it — one module of record, so the studio's pickers and
 * `pnpm create forte-ui --font-sans ...` cannot drift apart. This re-export
 * keeps the studio's import paths (and this file's name in them) stable. */
export * from "create-forte-ui/fonts";
