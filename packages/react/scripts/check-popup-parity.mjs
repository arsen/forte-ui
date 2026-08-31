/**
 * Popup parity gate — a check, not a generator; it writes nothing.
 *
 * The anchored popups (Menu, Popover, PreviewCard, Tooltip, NavigationMenu)
 * share their mechanics two different ways. The arrow geometry and the
 * viewport swap live ONCE, as `.forte-popup-*` patterns in
 * src/styles/patterns.css, wired up through generic `--forte-popup-*`
 * properties each popup maps its own knobs onto. But the enter/exit blocks —
 * the per-`data-side` displacement, the starting/ending-style gesture, the
 * size scale — are deliberately still per-component copies, because each one
 * is written in that component's own knob namespace and the namespaces are
 * public API (theming.json publishes them per component).
 *
 * Those copies carry an equality CSS cannot express and review will not
 * reliably catch: Popover's block must equal PreviewCard's modulo the
 * `--forte-popover-` / `--forte-preview-card-` prefix, and so on across the
 * group. A fix applied to one copy and not the others is invisible in a diff
 * and only surfaces as popups that enter from subtly different distances —
 * or, for the wiring, as an arrow that quietly falls back to the pattern's
 * defaults. This script makes that drift a build failure, the same way
 * check-contrast.mjs makes a bad ramp curve one.
 *
 * How it compares: parse each component's .module.css with postcss, take the
 * rules named in each block below (selectors keyed with all whitespace
 * stripped, rules under a `@media` excluded — the compared blocks are all
 * unconditional), rewrite the component's own `--forte-<component>-` prefix
 * to a placeholder in every property name and value, and require the
 * resulting declaration sets to be identical across the block's participants.
 * A component missing a listed rule fails the same as one whose copy drifted.
 *
 * When this gate fails on a change you MEANT to make, make the same change in
 * every listed file — or, if a component is genuinely diverging, remove it
 * from that block's participants here and say why in the same commit.
 *
 *   pnpm --filter @forte-ui/react check:parity
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

const root = fileURLToPath(new URL("..", import.meta.url));

/** Component name → { file, prefix }. The prefix is what gets rewritten to
 * `•` before comparing; a plain string replace of the full `--forte-<name>-`
 * run is safe even for menu vs menubar, because the trailing hyphen is part
 * of the match. */
const COMPONENTS = {
  menu: {
    file: "src/components/menu/Menu.module.css",
    prefix: "--forte-menu-",
  },
  popover: {
    file: "src/components/popover/Popover.module.css",
    prefix: "--forte-popover-",
  },
  "preview-card": {
    file: "src/components/preview-card/PreviewCard.module.css",
    prefix: "--forte-preview-card-",
  },
  tooltip: {
    file: "src/components/tooltip/Tooltip.module.css",
    prefix: "--forte-tooltip-",
  },
  "navigation-menu": {
    file: "src/components/navigation-menu/NavigationMenu.module.css",
    prefix: "--forte-navigation-menu-",
  },
};

/* Selector keys are the rule's selector with ALL whitespace removed, so the
 * house formatter's line breaks inside `:is()` cannot break a match. */
const SIDE_SELECTORS = [
  '.popup[data-side="top"]',
  '.popup[data-side="bottom"]',
  '.popup:is([data-side="left"],[data-side="inline-start"]:dir(ltr),[data-side="inline-end"]:dir(rtl))',
  '.popup:is([data-side="right"],[data-side="inline-end"]:dir(ltr),[data-side="inline-start"]:dir(rtl))',
];

const BLOCKS = [
  {
    name: "directional side mapping",
    selectors: SIDE_SELECTORS,
    participants: ["menu", "popover", "preview-card", "tooltip", "navigation-menu"],
  },
  {
    /* Tooltip is deliberately absent: it scales from the global
     * `--forte-scale-enter` rather than an enter-scale knob, and its exit
     * override retunes only the curve. That is a documented divergence, not
     * drift. */
    name: "enter/exit gesture",
    selectors: [
      ".popup[data-starting-style],.popup[data-ending-style]",
      ".popup[data-ending-style]",
    ],
    participants: ["menu", "popover", "preview-card", "navigation-menu"],
  },
  {
    /* NavigationMenu is deliberately absent: Base UI puts `data-instant` on
     * its POSITIONER, so the equivalent rule there is
     * `.positioner[data-instant] .arrow` and popup-level instant never
     * fires. */
    name: "instant open/close",
    selectors: [".popup[data-instant]"],
    participants: ["menu", "popover", "preview-card", "tooltip"],
  },
  {
    name: "size scale",
    selectors: [
      '.popup[data-size="sm"]',
      '.popup[data-size="md"]',
      '.popup[data-size="lg"]',
    ],
    participants: ["popover", "preview-card"],
  },
  {
    name: "viewport resize",
    selectors: [".popup:has(>.viewport)"],
    participants: ["popover", "preview-card"],
  },
];

/** The `--forte-popup-*` mappings each popup must declare for the shared
 * patterns in patterns.css to see its knobs — a class added in the TSX with
 * the mapping forgotten falls back to the pattern's generic defaults, which
 * is exactly the kind of silent near-miss nobody spots in review. Keyed by
 * the selector (whitespace-stripped) the mapping must sit on, so a mapping
 * that migrated to an element the pattern's descendants no longer inherit
 * from also fails. */
const REQUIRED_WIRING = [
  {
    name: "arrow wiring",
    selector: ".popup",
    props: [
      "--forte-popup-arrow-fill-color",
      "--forte-popup-arrow-width",
      "--forte-popup-arrow-height",
    ],
    participants: ["popover", "preview-card", "tooltip", "navigation-menu"],
  },
  {
    /* Tooltip is deliberately absent: its wedge is outline-less, which is the
     * pattern's own `transparent` fallback. */
    name: "arrow border wiring",
    selector: ".popup",
    props: ["--forte-popup-arrow-border-color"],
    participants: ["popover", "preview-card", "navigation-menu"],
  },
  {
    name: "popup width-cap and gap wiring",
    selector: ".popup",
    props: ["--forte-popup-available-width", "--forte-popup-gap"],
    participants: ["popover", "preview-card"],
  },
  {
    name: "viewport wiring",
    selector: ".viewport",
    props: ["--forte-popup-viewport-travel"],
    participants: ["popover", "preview-card"],
  },
];

/** True when the rule sits under any conditional at-rule. The compared blocks
 * are all unconditional, and skipping conditioned rules keeps a forced-colors
 * override with the same selector from shadowing the base copy. */
function conditioned(rule) {
  for (let p = rule.parent; p; p = p.parent) {
    if (p.type === "atrule" && p.name !== "layer") return true;
  }
  return false;
}

/** selectorKey → [ "prop:value", ... ] with the component prefix rewritten
 * and all whitespace stripped. Later same-selector rules append — CSS would
 * merge them the same way. */
function ruleMap(name) {
  const { file, prefix } = COMPONENTS[name];
  const css = readFileSync(join(root, file), "utf8");
  const map = new Map();
  postcss.parse(css, { from: file }).walkRules((rule) => {
    if (conditioned(rule)) return;
    const key = rule.selector.replace(/\s+/g, "");
    const decls = map.get(key) ?? [];
    rule.each((node) => {
      if (node.type !== "decl") return;
      const strip = (s) => s.replaceAll(prefix, "--forte-•-").replace(/\s+/g, "");
      decls.push(`${strip(node.prop)}:${strip(node.value)}`);
    });
    map.set(key, decls);
  });
  return map;
}

const maps = Object.fromEntries(Object.keys(COMPONENTS).map((n) => [n, ruleMap(n)]));
const failures = [];

for (const block of BLOCKS) {
  const [reference, ...rest] = block.participants;
  for (const selector of block.selectors) {
    const expected = maps[reference].get(selector);
    if (!expected) {
      failures.push(`${block.name}: ${reference} (the reference) has no rule ${selector}`);
      continue;
    }
    const sorted = [...expected].sort().join("\n    ");
    for (const other of rest) {
      const actual = maps[other].get(selector);
      if (!actual) {
        failures.push(`${block.name}: ${other} has no rule ${selector}`);
        continue;
      }
      if ([...actual].sort().join("\n    ") !== sorted) {
        failures.push(
          `${block.name}: ${other} drifted from ${reference} at ${selector}\n` +
            `  ${reference}:\n    ${sorted}\n` +
            `  ${other}:\n    ${[...actual].sort().join("\n    ")}`,
        );
      }
    }
  }
}

for (const wiring of REQUIRED_WIRING) {
  for (const name of wiring.participants) {
    const decls = maps[name].get(wiring.selector) ?? [];
    for (const prop of wiring.props) {
      if (!decls.some((d) => d.startsWith(`${prop}:`))) {
        failures.push(
          `${wiring.name}: ${name} does not declare ${prop} on ${wiring.selector}` +
            ` — the shared pattern will use its generic fallback instead of the component's knob`,
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`check-popup-parity: ${failures.length} failure(s)\n`);
  for (const f of failures) console.error(`✗ ${f}\n`);
  process.exit(1);
}

const rules = BLOCKS.reduce((n, b) => n + b.selectors.length * b.participants.length, 0);
const wires = REQUIRED_WIRING.reduce((n, w) => n + w.props.length * w.participants.length, 0);
console.log(`check-popup-parity: OK — ${rules} rule copies in parity, ${wires} pattern wires present`);
