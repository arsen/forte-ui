/**
 * Generates src/styles/motion.css from motion.mjs.
 * Run via `pnpm --filter @forte-ui/react tokens`.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DURATIONS, GEOMETRY, EASINGS, SPRING_DURATIONS } from "./motion.mjs";

const OUT = fileURLToPath(new URL("../src/styles/motion.css", import.meta.url));

/** The defaults are declared on `:root` ALONE — deliberately not on
 *  `.forte-theme` / `[data-forte-theme]` the way the color ramps are.
 *
 *  A ramp has to be restated on every scope selector because it is derived
 *  from a seed the scope may override. Motion tokens are literals, so a scope
 *  has nothing to re-derive — and restating them there would make every theme
 *  scope re-declare the defaults, which beats the value inherited from an
 *  ancestor carrying `data-forte-motion`. That is exactly the docs' arrangement:
 *  a `.forte-theme` demo frame inside a page whose <html> has been set to
 *  "reduce" would silently animate at full speed. Leaving the scopes alone
 *  lets inheritance carry the setting in, while a scope that wants its own
 *  motion still says so with `data-forte-motion` and wins on the blocks below. */
const ROOT = [":root"];

/** `:root[data-forte-motion="x"]` scores (0,2,0) and beats the base `:root`
 *  (0,1,0). A bare `[data-forte-motion="x"]` — needed so the control also works
 *  on a subtree — scores (0,1,0), which is why `:where()` must NOT be used
 *  here: it would zero the specificity and silently lose to the base block. */
const motionScope = (state) => [`:root[data-forte-motion="${state}"]`, `[data-forte-motion="${state}"]`];

const decl = (n, v) => `    --forte-${n}: ${v};`;

function stateBlock(selectors, { durationKey, geometryKey, motionOk, comment }) {
  const lines = [
    decl("motion-ok", motionOk),
    decl("motion-off", motionOk === "1" ? "0" : "1"),
    "",
    ...DURATIONS.map((d) => decl(`duration-${d.name}`, d[durationKey])),
    ...SPRING_DURATIONS.map((d) => decl(`duration-${d.name}`, d[durationKey])),
    "",
    ...GEOMETRY.map((g) => decl(g.name, g[geometryKey])),
  ];
  return `${comment ? `  ${comment}\n` : ""}  ${selectors.join(",\n  ")} {\n${lines.join("\n")}\n  }`;
}

const css = `/**
 * GENERATED FILE — do not edit by hand.
 * Source of truth: packages/react/scripts/motion.mjs
 * Regenerate with:  pnpm --filter @forte-ui/react tokens
 *
 * This is the ONLY prefers-reduced-motion block in the library. Component
 * stylesheets must never write their own — they consume the tokens below and
 * get correct behavior for free.
 *
 * Two rules worth knowing before you use these:
 *
 *  - Durations never reach 0s. At exactly 0s no transition object is created
 *    at all, so 'transitionend' never fires and any consumer code awaiting it
 *    deadlocks. 1ms costs one frame and keeps the event contract intact.
 *
 *  - Never put an 'infinite' animation on a Base UI Popup or Positioner part.
 *    Base UI awaits Promise.all(el.getAnimations().map(a => a.finished)) to
 *    decide when a popup may unmount, and an infinite animation's promise
 *    never settles — the popup would stay in the DOM forever. Put spinners on
 *    an inner child instead.
 *
 * The defaults below sit on ':root' alone, unlike the color ramps, which are
 * restated on '.forte-theme' / '[data-forte-theme]'. A ramp must be restated
 * because it is DERIVED from a seed a scope can override; these are literals,
 * so a scope has nothing to re-derive — and restating them would let every
 * theme scope re-declare the defaults on top of a 'data-forte-motion' inherited
 * from an ancestor. Inheritance carries the setting into a scope; a scope that
 * wants its own motion sets 'data-forte-motion' and wins on the blocks below.
 */
@layer forte.tokens {
${EASINGS.length ? `  :root {\n${EASINGS.map((e) => decl(`ease-${e.name}`, e.value)).join("\n")}\n  }\n` : ""}
${stateBlock(ROOT, { durationKey: "base", geometryKey: "full", motionOk: "1" })}

  /* The OS preference. Geometry off, durations shortened rather than removed. */
  @media (prefers-reduced-motion: reduce) {
${stateBlock(ROOT, { durationKey: "reduce", geometryKey: "reduced", motionOk: "0" })
    .split("\n").map((l) => (l ? `  ${l}` : l)).join("\n")}
  }

${stateBlock(motionScope("reduce"), { durationKey: "reduce", geometryKey: "reduced", motionOk: "0", comment: "/* In-page control (SC 2.3.3), and per-subtree scoping for docs demos. */" })}

${stateBlock(motionScope("off"), { durationKey: "off", geometryKey: "reduced", motionOk: "0" })}

${stateBlock(motionScope("full"), { durationKey: "base", geometryKey: "full", motionOk: "1", comment: "/* Explicit opt-in — deliberately overrides the OS preference. */" })}
}
`;

writeFileSync(OUT, css);
console.log(`wrote ${OUT} (${css.split("\n").length} lines)`);
