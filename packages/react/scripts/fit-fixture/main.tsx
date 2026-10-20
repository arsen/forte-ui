/*
 * The page check-fit.mjs loads: every InputGroup the gate holds to its
 * control height, all at once — density × size × variant × what sits in the
 * addons. One page is enough here, unlike the overflow fixture: the thing
 * measured is each group's own box, which a neighbour cannot change.
 *
 * Each case is a `[data-case]` cell carrying its density, with a probe beside
 * the group whose block size is the `--forte-control-h-*` the group promises
 * to match. Measuring the probe rather than hard-coding pixels keeps the gate
 * honest when a density preset is retuned: the number the group must hit is
 * read from the same token, in the same scope.
 *
 * The real component from src, through Vite's CSS Modules, with the real
 * theme — a hand-written copy of the markup would test the copy.
 */
import { createRoot } from "react-dom/client";
import "../../src/styles/theme.css";
import { InputGroup, type InputGroupSize, type InputGroupVariant } from "../../src/components/input-group";

const DENSITIES = ["default", "compact", "spacious"] as const;
const SIZES: InputGroupSize[] = ["sm", "md", "lg"];
const VARIANTS: InputGroupVariant[] = ["outline", "soft", "ghost"];

/** A stand-in glyph: the library ships no icons, and what matters is that
 * the button holds an svg at the group's icon size. */
const Glyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/** What the addons hold. `icon-button` is the issue-161 case — a search
 * field's clear button — and `both` puts one at each end, so the inline-start
 * padding correction is covered as well as the inline-end one. */
const KINDS = {
  none: null,
  text: (
    <InputGroup.Addon>
      <InputGroup.Text>https://</InputGroup.Text>
    </InputGroup.Addon>
  ),
  icon: (
    <InputGroup.Addon>
      <Glyph />
    </InputGroup.Addon>
  ),
  button: (
    <InputGroup.Addon align="inline-end">
      <InputGroup.Button>Search</InputGroup.Button>
    </InputGroup.Addon>
  ),
  "icon-button": (
    <InputGroup.Addon align="inline-end">
      <InputGroup.Button iconOnly aria-label="Clear">
        <Glyph />
      </InputGroup.Button>
    </InputGroup.Addon>
  ),
  // Button's own `size` must not get a vote inside a field either.
  "icon-button-lg": (
    <InputGroup.Addon align="inline-end">
      <InputGroup.Button iconOnly size="lg" aria-label="Clear">
        <Glyph />
      </InputGroup.Button>
    </InputGroup.Addon>
  ),
  both: (
    <>
      <InputGroup.Addon>
        <InputGroup.Button iconOnly aria-label="Filter">
          <Glyph />
        </InputGroup.Button>
      </InputGroup.Addon>
      <InputGroup.Addon align="inline-end">
        <InputGroup.Button iconOnly aria-label="Clear">
          <Glyph />
        </InputGroup.Button>
      </InputGroup.Addon>
    </>
  ),
};

createRoot(document.getElementById("root")!).render(
  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "flex-start" }}>
    {DENSITIES.flatMap((density) =>
      SIZES.flatMap((size) =>
        VARIANTS.flatMap((variant) =>
          Object.entries(KINDS).map(([kind, addons]) => (
            <div
              key={`${density}/${size}/${variant}/${kind}`}
              data-case={`${density}/${size}/${variant}/${kind}`}
              data-forte-density={density === "default" ? undefined : density}
              style={{ display: "flex", alignItems: "flex-start", gap: "0.25rem" }}
            >
              <span
                data-probe="control"
                style={{ inlineSize: "1px", blockSize: `var(--forte-control-h-${size})` }}
              />
              <span
                data-probe="target"
                style={{ inlineSize: "1px", blockSize: "var(--forte-target-min)" }}
              />
              <InputGroup.Root size={size} variant={variant} style={{ inlineSize: "14rem" }}>
                <InputGroup.Input defaultValue="query" aria-label="Field" />
                {addons}
              </InputGroup.Root>
            </div>
          )),
        ),
      ),
    )}
  </div>,
);
