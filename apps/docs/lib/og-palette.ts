/**
 * The share cards' palette, resolved to literal hex at build time.
 *
 * ---------------------------------------------------------------------------
 * Why a card cannot just use the tokens
 * ---------------------------------------------------------------------------
 * The cards are drawn by satori, the renderer inside `next/og`. It is not a
 * browser: it lays elements out with Yoga (flexbox only) and reads the inline
 * `style` prop, and it has no CSS pipeline at all — no stylesheets, no
 * cascade, no custom properties, and no `oklch(from …)`. So the one mechanism
 * the whole library rests on is exactly the mechanism unavailable here, and a
 * card that wrote `var(--forte-color-background)` would come out transparent
 * with no error.
 *
 * This module is therefore a BAKE, in the same category as `app/icon.svg` and
 * `public/brand/forte-ui.svg` — the two other artifacts that draw the brand
 * somewhere the page's tokens cannot reach. It differs from those in one way
 * worth keeping: they bake finished hex strings, and this derives them, so a
 * change to the seed defaults reaches the cards by editing two numbers rather
 * than by re-eyedropping five.
 *
 * ---------------------------------------------------------------------------
 * What has to be re-baked, and when
 * ---------------------------------------------------------------------------
 * The maths is imported — `oklchToHex` is the module of record in
 * `create-forte-ui`, the same function the Theme Studio and the scaffolder
 * use, so the numbers below cannot drift from the ones the library ships.
 * Two inputs are copies, and both name their source:
 *
 *   - SEED / SECONDARY_SEED — the `initial-value` of `--forte-accent-seed`
 *     and `--forte-secondary-seed` in `packages/react/src/styles/properties.css`.
 *   - The neutral rows — the dark half of `GRAY_CURVE` in
 *     `packages/react/scripts/ramp.mjs`.
 *
 * Neither is reachable by an import: `properties.css` is CSS, and `scripts/`
 * is not in the library's exports map (the docs deliberately resolve library
 * data through that map — see `build-catalog.mjs` — rather than reaching
 * across the workspace with a relative path). Change either source and change
 * these; the cross-check is that `SEED` here must render the same `#0f7a52`
 * that `app/icon.svg` has baked into its gradient.
 */
import { oklchToHex, type Oklch } from "@/lib/color";

/** `--forte-accent-seed`'s initial value. Renders `#0f7a52`. */
const SEED: Oklch = { l: 0.5137, c: 0.11, h: 161 };

/** `--forte-secondary-seed`'s initial value. Renders `#a16207`. */
const SECONDARY_SEED: Oklch = { l: 0.554, c: 0.1207, h: 66.4 };

/**
 * `--forte-neutral-tint`'s initial value: 0 is a pure gray ramp, 1 is a
 * hue-matched sliver of the brand in every neutral.
 */
const NEUTRAL_TINT = 1;

/**
 * One dark neutral, by the rule the generated ramp uses:
 *
 *   oklch(<l> min(<tint cap> * --forte-neutral-tint, c * <ratio>) h)
 *
 * The `min()` is the part that matters and the part that is easy to drop. It
 * is what keeps a neon seed from tinting the page's background visibly while
 * still letting a nearly-gray seed degrade to a clean gray rather than a
 * muddy one — so the cap and the ratio are both required, and taking either
 * alone gives the right answer at the default seed and the wrong one at the
 * seeds the cap was tuned for.
 */
const neutral = (l: number, cap: number, ratio: number): string =>
  oklchToHex({ l, c: Math.min(cap * NEUTRAL_TINT, SEED.c * ratio), h: SEED.h });

/**
 * The card's colors, named for their role rather than their step, because a
 * card uses five neutrals and copying the whole twelve-step ramp in here
 * would be twelve rows to keep in step for the seven nobody draws.
 *
 * The step each one corresponds to is in its comment — that is the number to
 * match against `GRAY_CURVE` when re-baking, and against `tokens.css` when
 * asking whether the card still looks like the site.
 */
export const OG = {
  /** `--forte-color-background` → gray 1. The card's ground. */
  background: neutral(0.178, 0.004, 0.03),
  /** `--forte-color-panel` → gray 2. The lift under the footer row. */
  panel: neutral(0.213, 0.006, 0.04),
  /** `--forte-color-border-muted` → gray 6. Hairlines. */
  border: neutral(0.35, 0.013, 0.07),
  /** `--forte-color-foreground-muted` → gray 11. Body copy and the eyebrow. */
  muted: neutral(0.77, 0.007, 0.04),
  /** `--forte-color-foreground` → gray 12. The title. */
  foreground: neutral(0.949, 0.005, 0.03),
  /** `--forte-accent-9` — the seed itself, untouched. Fills, never text. */
  accent: oklchToHex(SEED),
  /**
   * `--forte-accent-11` in dark mode — the ramp's low-contrast TEXT step, and
   * the only accent that may carry type on this card.
   *
   * The seed itself measures 3.53:1 against the background above, which is
   * below AA and was what the eyebrow used in the first draft. Step 11 is the
   * step the curve defines for this exact job, and measures 9.09:1. Getting
   * this wrong on a card is worse than getting it wrong on a page: the card is
   * a flat image, so a reader who needs more contrast has no page zoom, no
   * forced-colors mode, and no text to select.
   *
   * The expression is `ACCENT_CURVE`'s step 11, dark column, transcribed:
   *   clamp(0.76, calc(l + 0.16), 0.92)  min(0.14, calc(c * 0.72))
   */
  accentText: oklchToHex({
    l: Math.min(Math.max(0.76, SEED.l + 0.16), 0.92),
    c: Math.min(0.14, SEED.c * 0.72),
    h: SEED.h,
  }),
  /** `--forte-secondary-9` — likewise. */
  secondary: oklchToHex(SECONDARY_SEED),
} as const;
