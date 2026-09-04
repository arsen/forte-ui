/**
 * The id a category heading gets on the component index.
 *
 * Written as .mjs rather than .ts for the same reason `shiki.mjs` is: it is
 * imported from BOTH sides of the build. `component-index.tsx` puts the id on
 * the `<h2>` it renders, and `scripts/build-toc.mjs` — plain Node, no
 * TypeScript — writes the same id into the "On this page" seed for that
 * route. One function, so the seed and the heading cannot disagree by a
 * character and have the rail rewrite itself on mount.
 *
 * Not github-slugger's, which is what `rehype-slug` gives the MDX headings,
 * and it does not need to be: nothing links to these from another page. It
 * is the readable answer for the one category with punctuation in it —
 * `content-layout`, where the slugger's literal reading of "Content & layout"
 * would be `content--layout`.
 *
 * @param {string} category
 * @returns {string}
 */
export const categorySlug = (category) =>
  category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
