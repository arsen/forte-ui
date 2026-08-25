/**
 * Turns any matched file into `export default "<its source>"`.
 *
 * This is what makes a demo's displayed code provably identical to the demo
 * that renders: the same .tsx file is imported twice from the same path, once
 * normally (rendered, type-checked, hot-reloaded) and once with `?raw` (the
 * exact bytes). There is no second copy to drift.
 *
 * Why not the documented alternatives, all verified against Next 16.2.10:
 *   - `turbopack.rules[].type: "raw"` is accepted by the config schema, builds
 *     without error, and silently yields an EMPTY module. Wrong output, no
 *     warning.
 *   - `turbopack.rules[].type: "text"` is rejected by the schema and panics
 *     Turbopack, despite being documented for 16.3.
 *   - `import.meta.glob` is not implemented until 16.3; it type-errors, and
 *     with hand-written ambient types it compiles and then throws at prerender.
 *
 * A loader is version-independent, so this keeps working after the upgrade.
 */
module.exports = function rawSourceLoader(source) {
  this.cacheable && this.cacheable();
  return `export default ${JSON.stringify(source)};`;
};
