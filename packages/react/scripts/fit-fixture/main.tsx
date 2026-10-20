/*
 * The page check-fit.mjs loads: every one-row field the gate holds to its
 * control height, all at once — `InputGroup` and `Combobox.InputGroup`, each
 * at every density × size × variant × what sits inside. One page is enough
 * here, unlike the overflow fixture: the thing measured is each field's own
 * box, which a neighbour cannot change.
 *
 * Each case is a `[data-case]` cell carrying its density, with probes beside
 * the field whose block sizes are the `--forte-control-h-*` the field
 * promises to match and the `--forte-target-min` its buttons' hit areas
 * must reach. Measuring probes rather than hard-coding pixels keeps the gate
 * honest when a density preset is retuned: the number the field must hit is
 * read from the same token, in the same scope.
 *
 * A cell marked `data-wraps` holds more than one row can, on purpose: its
 * height is allowed to grow, and only its buttons' row is checked.
 *
 * The real components from src, through Vite's CSS Modules, with the real
 * theme — a hand-written copy of the markup would test the copy.
 */
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "../../src/styles/theme.css";
import { Combobox } from "../../src/components/combobox";
import { InputGroup } from "../../src/components/input-group";

const DENSITIES = ["default", "compact", "spacious"] as const;
const SIZES = ["sm", "md", "lg"] as const;
const VARIANTS = ["outline", "soft", "ghost"] as const;
type Size = (typeof SIZES)[number];
type Variant = (typeof VARIANTS)[number];

/** A stand-in glyph: the library ships no icons, and what matters is that
 * the button holds an svg at the group's icon size. */
const Glyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

/** What an InputGroup's addons hold. `icon-button` is the issue-161 case — a
 * search field's clear button — and `both` puts one at each end, so the
 * inline-start padding correction is covered as well as the inline-end one. */
const INPUT_GROUP: Record<string, ReactNode> = {
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

const STATUSES = ["Draft", "Published", "Failed", "Archived", "Scheduled", "In review", "Rejected"];

/** A multiple combobox's chips, rendered the documented way: through
 * `Combobox.Value`, with the input last INSIDE the chips container. */
const Chips = () => (
  <Combobox.Chips>
    <Combobox.Value>
      {(value: string[]) => (
        <>
          {value.map((v) => (
            <Combobox.Chip key={v}>
              {v}
              <Combobox.ChipRemove aria-label={`Remove ${v}`} />
            </Combobox.Chip>
          ))}
          <Combobox.Input aria-label="Status" />
        </>
      )}
    </Combobox.Value>
  </Combobox.Chips>
);

/** What a Combobox field holds. `one-chip` is issue 162 — a chip taller than
 * an `sm` field's inside — and `two-chips` is issue 163: two short chips
 * beside Clear and Trigger, which fit on one row once the chips stop basing
 * themselves on the input's 20-character intrinsic width. `many-chips`
 * cannot fit, and is there to hold the buttons on the FIRST row while the
 * chips wrap under them. */
const COMBOBOX: Record<string, { value: string | string[] | null; wraps?: boolean; field: ReactNode }> = {
  single: {
    value: null,
    field: (
      <>
        <Combobox.Input aria-label="Status" />
        <Combobox.Trigger aria-label="Open" />
      </>
    ),
  },
  "single-clear": {
    value: "Draft",
    field: (
      <>
        <Combobox.Input aria-label="Status" />
        <Combobox.Clear aria-label="Clear" />
        <Combobox.Trigger aria-label="Open" />
      </>
    ),
  },
  "no-chips": {
    value: [],
    field: (
      <>
        <Chips />
        <Combobox.Clear aria-label="Clear" />
        <Combobox.Trigger aria-label="Open" />
      </>
    ),
  },
  "one-chip": { value: ["Draft"], field: <Chips /> },
  "two-chips": {
    value: ["Draft", "Published"],
    field: (
      <>
        <Chips />
        <Combobox.Clear aria-label="Clear" />
        <Combobox.Trigger aria-label="Open" />
      </>
    ),
  },
  "many-chips": {
    value: STATUSES,
    wraps: true,
    field: (
      <>
        <Chips />
        <Combobox.Clear aria-label="Clear" />
        <Combobox.Trigger aria-label="Open" />
      </>
    ),
  },
};

function Cell({
  name,
  density,
  size,
  wraps,
  children,
}: {
  name: string;
  density: (typeof DENSITIES)[number];
  size: Size;
  wraps?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      data-case={name}
      data-wraps={wraps ? "" : undefined}
      data-forte-density={density === "default" ? undefined : density}
      style={{ display: "flex", alignItems: "flex-start", gap: "0.25rem" }}
    >
      <span data-probe="control" style={{ inlineSize: "1px", blockSize: `var(--forte-control-h-${size})` }} />
      <span data-probe="target" style={{ inlineSize: "1px", blockSize: "var(--forte-target-min)" }} />
      {children}
    </div>
  );
}

const cases: ReactNode[] = [];
for (const density of DENSITIES)
  for (const size of SIZES)
    for (const variant of VARIANTS as readonly Variant[]) {
      for (const [kind, addons] of Object.entries(INPUT_GROUP)) {
        const name = `input-group/${density}/${size}/${variant}/${kind}`;
        cases.push(
          <Cell key={name} name={name} density={density} size={size}>
            <InputGroup.Root size={size} variant={variant} style={{ inlineSize: "14rem" }}>
              <InputGroup.Input defaultValue="query" aria-label="Field" />
              {addons}
            </InputGroup.Root>
          </Cell>,
        );
      }
      for (const [kind, { value, wraps, field }] of Object.entries(COMBOBOX)) {
        const name = `combobox/${density}/${size}/${variant}/${kind}`;
        cases.push(
          <Cell key={name} name={name} density={density} size={size} wraps={wraps}>
            <Combobox.Root items={STATUSES} multiple={Array.isArray(value)} defaultValue={value}>
              {/* 22rem: room for two short chips, the input's floor and both
                  buttons even at `spacious` `lg` (~334px), and still short of
                  the chips plus the input at its intrinsic width (~312px)
                  beside the buttons at every size — which is what issue 163
                  needs to show. */}
              <Combobox.InputGroup size={size} variant={variant} style={{ inlineSize: "22rem" }}>
                {field}
              </Combobox.InputGroup>
            </Combobox.Root>
          </Cell>,
        );
      }
    }

// Issue 163 exactly as reported: a 256px `sm` field. The 22rem cells above
// clear it at `sm`, where the buttons are small, so it gets a cell of its own.
// It WRAPS, and rightly: the two chips (~152px) and the input's 64px floor
// need 220px, and the buttons leave 202. What the issue reported was the
// buttons dropping under the chips; the input taking the second row instead
// is the field working.
cases.push(
  <Cell key="issue-163" name="combobox/default/sm/outline/issue-163-two-chips" density="default" size="sm" wraps>
    <Combobox.Root items={STATUSES} multiple defaultValue={["Draft", "Published"]}>
      <Combobox.InputGroup size="sm" style={{ inlineSize: "16rem" }}>
        {COMBOBOX["two-chips"].field}
      </Combobox.InputGroup>
    </Combobox.Root>
  </Cell>,
);

createRoot(document.getElementById("root")!).render(
  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "flex-start" }}>
    {cases}
  </div>,
);
