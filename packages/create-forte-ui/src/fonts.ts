/* The font catalog — the ten most-used Google Fonts of each kind, plus the
 * library's own default stack as "System". This is the module of record: the
 * docs' Theme Studio re-exports it from here, so the CLI's font prompt and
 * the studio's pickers cannot drift apart. Everything a consumer of
 * an entry needs (the CSS stack, the full stylesheet URL, the tiny preview
 * URL) is precomputed here, so the component never builds a URL of its own
 * and the pre-paint replay in `layout.tsx` can trust what was stored.
 *
 * The axes in `axes` are per-family on purpose: css2 rejects a range a static
 * family cannot serve (`Lato:wght@400..700` is a 400), so variable families
 * ask for the 400..700 range and static ones list the weights they actually
 * have. The tokens only ever use 400/500/600/700; a family missing a step
 * (Lato, Space Mono…) lets the browser synthesise it, which is fine for a
 * preview and stated in the copied CSS by the import carrying the real list. */

export type FontOption = {
  /** Display name, and the value stored in the studio config. */
  name: string;
  /** `font-family` value, fallback stack included. `null` means "System" —
   *  no override at all, so the token keeps its shipped default. */
  stack: string | null;
  /** Full stylesheet for actually using the font. `null` for System. */
  css: string | null;
  /** Subsetted stylesheet carrying only the glyphs of the family's own name —
   *  a few KB, loaded when the picker opens so each menu item can render in
   *  its own face without pulling ten full families. */
  preview: string | null;
};

/* The shipped defaults from `tokens.css`, verbatim. They double as the
 * fallback tail behind every Google family, so a font that has not arrived
 * yet degrades to exactly the look the studio started with. */
export const SANS_FALLBACK =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
export const MONO_FALLBACK =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

const GOOGLE = "https://fonts.googleapis.com/css2";

function font(name: string, axes: string, fallback: string): FontOption {
  const family = name.replaceAll(" ", "+");
  return {
    name,
    stack: `"${name}", ${fallback}`,
    css: `${GOOGLE}?family=${family}:${axes}&display=swap`,
    preview: `${GOOGLE}?family=${family}&text=${encodeURIComponent(name)}&display=swap`,
  };
}

const system: FontOption = { name: "System", stack: null, css: null, preview: null };

export const SANS_FONTS: readonly FontOption[] = [
  system,
  font("Inter", "wght@400..700", SANS_FALLBACK),
  font("Roboto", "wght@400;500;700", SANS_FALLBACK),
  font("Open Sans", "wght@400..700", SANS_FALLBACK),
  font("Lato", "wght@400;700", SANS_FALLBACK),
  font("Montserrat", "wght@400..700", SANS_FALLBACK),
  font("Poppins", "wght@400;500;600;700", SANS_FALLBACK),
  font("Nunito", "wght@400..700", SANS_FALLBACK),
  font("Source Sans 3", "wght@400..700", SANS_FALLBACK),
  font("Work Sans", "wght@400..700", SANS_FALLBACK),
  font("DM Sans", "wght@400..700", SANS_FALLBACK),
];

export const MONO_FONTS: readonly FontOption[] = [
  system,
  font("JetBrains Mono", "wght@400..700", MONO_FALLBACK),
  font("Fira Code", "wght@400..700", MONO_FALLBACK),
  font("Source Code Pro", "wght@400..700", MONO_FALLBACK),
  font("IBM Plex Mono", "wght@400;500;600;700", MONO_FALLBACK),
  font("Roboto Mono", "wght@400..700", MONO_FALLBACK),
  font("Geist Mono", "wght@400..700", MONO_FALLBACK),
  font("Space Mono", "wght@400;700", MONO_FALLBACK),
  font("Ubuntu Mono", "wght@400;700", MONO_FALLBACK),
  font("Inconsolata", "wght@400..700", MONO_FALLBACK),
  font("Courier Prime", "wght@400;700", MONO_FALLBACK),
];

export function findFont(list: readonly FontOption[], name: string): FontOption {
  // Falls back to System rather than throwing: the name may come from
  // user-editable storage, and readStored() has already validated it — this
  // is belt-and-braces for the one caller that builds CSS from it.
  return list.find((f) => f.name === name) ?? list[0]!;
}

/** Append a stylesheet `<link>` once. Loaded fonts are deliberately never
 *  removed on switch-away — the files are cached, and keeping the link means
 *  flipping back to a font shows it instantly instead of re-flashing the
 *  fallback. */
export function ensureFontLink(href: string) {
  if (document.head.querySelector(`link[href="${href}"]`)) return;
  // One preconnect ahead of the first font request; gstatic is where the
  // actual woff2 files live and the stylesheet origin connects itself.
  if (!document.head.querySelector('link[rel="preconnect"][href="https://fonts.gstatic.com"]')) {
    const pre = document.createElement("link");
    pre.rel = "preconnect";
    pre.href = "https://fonts.gstatic.com";
    pre.crossOrigin = "anonymous";
    document.head.appendChild(pre);
  }
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}
