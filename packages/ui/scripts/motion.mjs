/**
 * The pretty-ui motion table — source of truth for every motion token.
 *
 * Why this is generated rather than hand-written: the derived geometry tokens
 * must be RESTATED verbatim in each override block. A derived token does not
 * re-derive from an inherited `--pui-motion-ok`, because `var()` inside an
 * unregistered custom property is substituted where the property is declared.
 * So `[data-pui-motion="reduce"]` has to spell out every travel and scale
 * value itself. Hand-maintained, adding one token and forgetting one block
 * silently breaks subtree scoping while the global media query keeps working —
 * a bug that only shows up in the one place nobody tests. Generating all four
 * blocks from this table makes that class of mistake impossible.
 *
 * Three states beyond the default:
 *   reduce  matches prefers-reduced-motion, and the in-page control.
 *           Geometry off, durations SHORTENED not zeroed — the guidance is
 *           "reduce, not remove", and an opacity fade is the part that helps.
 *   off     everything as close to instant as is safe.
 *   full    explicit opt-in that overrides the OS preference.
 */

/** Durations. `loop*` are NEVER collapsed: a spinner at 1ms is a flashing
 *  hazard under WCAG 2.3.1, which is the opposite of an accessibility win. */
export const DURATIONS = [
  { name: "instant", base: "1ms",   reduce: "1ms",   off: "1ms" },
  { name: "fast",    base: "160ms", reduce: "100ms", off: "1ms" },
  { name: "normal",  base: "240ms", reduce: "120ms", off: "1ms" },
  { name: "slow",    base: "400ms", reduce: "150ms", off: "1ms" },
  // Positional slides that cannot be expressed as a travel token, because the
  // distance comes from the component at runtime (e.g. the tabs indicator).
  { name: "move",    base: "220ms", reduce: "1ms",   off: "1ms" },
  { name: "loop-spin",  base: "800ms",  reduce: "800ms",  off: "800ms",  never: true },
  { name: "loop-pulse", base: "1600ms", reduce: "1600ms", off: "1600ms", never: true },
  // A segment crossing the full width of something. Longer than a spin because
  // the distance is the page's width rather than a 24px circle, and a sweep
  // fast enough to feel like a spinner reads as a strobe.
  { name: "loop-sweep", base: "1400ms", reduce: "1400ms", off: "1400ms", never: true },
];

/** Geometry. Travel collapses to 0; scales interpolate toward 1 (identity),
 *  never toward 0 — `scale(calc(0.95 * ok))` would collapse the element to
 *  nothing when ok is 0. */
export const GEOMETRY = [
  { name: "travel-xs",   full: "2px",    reduced: "0px" },
  { name: "travel-sm",   full: "4px",    reduced: "0px" },
  { name: "travel-md",   full: "8px",    reduced: "0px" },
  { name: "travel-lg",   full: "16px",   reduced: "0px" },
  { name: "travel-page", full: "32px",   reduced: "0px" },
  { name: "scale-enter", full: "0.95",   reduced: "1" },
  { name: "scale-exit",  full: "1.02",   reduced: "1" },
  { name: "scale-press", full: "0.97",   reduced: "1" },
  { name: "spin-turn",   full: "1turn",  reduced: "0turn" },
  // Fades IN a non-motion cue when motion is suppressed, so state that was
  // carried by movement is still carried by something.
  { name: "pulse-dip",   full: "1",      reduced: "0.45" },
];

/**
 * Easings. The spring curves are real damped-harmonic-oscillator solutions
 * sampled into linear() stops — the same physics a JS spring library models,
 * but resolved at author time so it costs nothing at runtime. Values above 1
 * are genuine overshoot. Regenerate with scripts/springs.mjs.
 */
export const EASINGS = [
  { name: "standard",  value: "cubic-bezier(0.2, 0, 0, 1)" },
  // Symmetric, and the only easing here that is safe on a LOOP. The others all
  // end slower than they start, so a repeating animation crawls to its last
  // frame and then jumps back to a fast first one — a visible stutter once per
  // cycle. Easing in and out equally puts the slow parts at both ends, where
  // an indeterminate segment is usually off the edge of its track anyway.
  { name: "in-out",    value: "cubic-bezier(0.4, 0, 0.6, 1)" },
  { name: "emphasized", value: "cubic-bezier(0.2, 0, 0, 1.2)" },
  { name: "exit",      value: "cubic-bezier(0.4, 0, 1, 1)" },
  { name: "spring-gentle", value: "linear(0, 0.066, 0.203, 0.3552, 0.4964, 0.6164, 0.7132, 0.7887, 0.8461, 0.889, 0.9206, 0.9436, 0.9601, 0.972, 0.9804, 0.9864, 0.9905, 0.9934, 0.9955, 0.9969, 0.9979, 0.9985, 0.999)" },
  { name: "spring-snappy", value: "linear(0, 0.055, 0.1821, 0.3382, 0.4954, 0.6374, 0.7563, 0.8497, 0.919, 0.9673, 0.9987, 1.0169, 1.0258, 1.0284, 1.027, 1.0235, 1.0191, 1.0146, 1.0105, 1.0071, 1.0044, 1.0024, 1.001)" },
  { name: "spring-bouncy", value: "linear(0, 0.1344, 0.4195, 0.7176, 0.9501, 1.0898, 1.1445, 1.1392, 1.1023, 1.0571, 1.0184, 0.9926, 0.9803, 0.9784, 0.9826, 0.9891, 0.9954, 1, 1.0025, 1.0032, 1.0029, 1.002, 1.001)" },
  { name: "spring-precise", value: "linear(0, 0.0669, 0.2055, 0.3587, 0.5002, 0.6201, 0.7165, 0.7915, 0.8483, 0.8907, 0.9219, 0.9445, 0.9608, 0.9725, 0.9807, 0.9866, 0.9907, 0.9935, 0.9955, 0.9969, 0.9979, 0.9985, 0.999)" },
];

/** Matching settle times for the spring curves, so a transition-duration and
 *  its spring curve stay paired. Using a shorter duration truncates the
 *  spring mid-bounce and looks broken. */
export const SPRING_DURATIONS = [
  { name: "spring-gentle",  base: "700ms", reduce: "150ms", off: "1ms" },
  { name: "spring-snappy",  base: "400ms", reduce: "120ms", off: "1ms" },
  { name: "spring-bouncy",  base: "730ms", reduce: "150ms", off: "1ms" },
  { name: "spring-precise", base: "410ms", reduce: "120ms", off: "1ms" },
];
