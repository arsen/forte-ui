/* The forte-ui overlay: what turns an upstream scaffold into the guides'
 * finished walkthrough. Wholesale replacement, not merging — every file
 * touched here was written by the scaffolder seconds ago, and the guides'
 * "replace, don't merge" warnings exist because the scaffold CSS is unlayered
 * author CSS that would beat everything in `@layer forte.*`.
 */

import fs from "node:fs";
import path from "node:path";
import { htmlAttrs, type ThemeAnswers } from "./theme.js";
import {
  viteIndexCss,
  viteMainTsx,
  viteAppTsx,
  VITE_CONFIG_TW,
  nextGlobalsCss,
  nextLayoutTsx,
  nextPageTsx,
} from "./templates.js";

export type Framework = "next" | "vite";

export type ProjectPlan = {
  name: string;
  dir: string;
  framework: Framework;
  tailwind: boolean;
  answers: ThemeAnswers;
};

function write(dir: string, rel: string, content: string) {
  fs.writeFileSync(path.join(dir, rel), content);
}

function remove(dir: string, rel: string) {
  fs.rmSync(path.join(dir, rel), { force: true });
}

/** Returns the files it wrote (project-relative), for the summary. */
export function applyOverlay(plan: ProjectPlan): string[] {
  return plan.framework === "vite" ? applyVite(plan) : applyNext(plan);
}

function applyVite({ name, dir, tailwind, answers }: ProjectPlan): string[] {
  const written: string[] = [];

  write(dir, "src/index.css", viteIndexCss(answers, tailwind));
  written.push("src/index.css");
  write(dir, "src/main.tsx", viteMainTsx(tailwind));
  written.push("src/main.tsx");
  write(dir, "src/App.tsx", viteAppTsx(name, tailwind, answers.scheme === "system"));
  written.push("src/App.tsx");
  /* The guide's warning covers App.css too: its rules are unlayered and the
   * new App.tsx no longer imports it. Delete rather than empty, so nobody
   * re-imports a file that looks like it should exist. */
  remove(dir, "src/App.css");

  if (tailwind) {
    write(dir, "vite.config.ts", VITE_CONFIG_TW);
    written.push("vite.config.ts");
  }

  /* Vite's `<html>` lives in index.html. Anchored replacements rather than a
   * rewrite — the rest of the file (favicon, root div, module script) is the
   * scaffolder's to evolve. A missed anchor is a template change upstream:
   * report it, never guess. */
  const htmlPath = path.join(dir, "index.html");
  let html = fs.readFileSync(htmlPath, "utf8");
  const attrs = htmlAttrs(answers);
  const anchored = html.replace(/<html lang="en">/, `<html lang="en"${attrs}>`);
  if (attrs && anchored === html) {
    throw new Error(
      `could not find '<html lang="en">' in index.html to add${attrs} — ` +
        `the create-vite template may have changed; add the attribute(s) by hand.`,
    );
  }
  html = anchored.replace(/<title>[^<]*<\/title>/, `<title>${name}</title>`);

  /* Replay a stored light/dark choice before first paint — the guides'
   * "Light and dark" step. A bundled component cannot run before the bundle,
   * so on Vite the script lives in the document itself; the string must stay
   * byte-identical to `themeInitScript` in @forte-ui/react, which is the
   * other writer of the same localStorage key.
   *
   * Not when a scheme is pinned: `data-theme` is then static in the markup
   * above, and the script would OVERRIDE it with any `forte-theme` record on
   * the origin — which on localhost is shared by every project, so a toggle
   * pressed in another app would flip this one's pinned palette. */
  if (answers.scheme === "system") {
    const themeReplay =
      "    <!-- Replays a stored light/dark choice before first paint\n" +
      "         (themeInitScript from @forte-ui/react). -->\n" +
      '    <script>(function(){try{var t=localStorage.getItem("forte-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}})();</script>\n';
    const replayed = html.replace(/[ \t]*<\/head>/, `${themeReplay}  </head>`);
    if (replayed === html) {
      throw new Error(
        "could not find '</head>' in index.html to add the theme replay script — " +
          "the create-vite template may have changed; copy the snippet from the " +
          "guide's 'Light and dark' step into <head> by hand.",
      );
    }
    html = replayed;
  }

  /* Tailwind only: pin the cascade-layer order in the DOCUMENT, not the
   * stylesheet. The bridge's own `@layer theme, base, forte, components,
   * utilities;` statement is supposed to do this, but Vite's CSS pipeline
   * (Tailwind's compiler re-slotting the statement, lightningcss merging
   * statements under minification, chunk concatenation order) rewrites it,
   * and the observed result is `base` first appearing AFTER `forte` — at
   * which point Preflight's `button { background: transparent }` beats every
   * component by layer order and buttons render as bare text. An inline
   * <style> ahead of every stylesheet is untouchable by that pipeline, and
   * layer order is fixed at first appearance, so nothing later can unpin it.
   * Next.js needs none of this — its pipeline emits the statement in order. */
  if (tailwind) {
    const pin =
      "    <!-- Pins the cascade-layer order before any stylesheet loads; the CSS\n" +
      "         bundler can reorder @layer statements, and first appearance wins. -->\n" +
      "    <style>@layer theme, base, forte, components, utilities;</style>\n";
    const pinned = html.replace(/[ \t]*<\/head>/, `${pin}  </head>`);
    if (pinned === html) {
      throw new Error(
        "could not find '</head>' in index.html to pin the cascade-layer order — " +
          "the create-vite template may have changed; add " +
          "<style>@layer theme, base, forte, components, utilities;</style> to <head> by hand.",
      );
    }
    html = pinned;
  }

  fs.writeFileSync(htmlPath, html);
  written.push("index.html");

  return written;
}

function applyNext({ name, dir, tailwind, answers }: ProjectPlan): string[] {
  const written: string[] = [];

  write(dir, "app/globals.css", nextGlobalsCss(answers, tailwind));
  written.push("app/globals.css");
  write(dir, "app/layout.tsx", nextLayoutTsx(name, answers, tailwind));
  written.push("app/layout.tsx");
  write(dir, "app/page.tsx", nextPageTsx(name, tailwind));
  written.push("app/page.tsx");
  /* The plain scaffold ships a page.module.css the new page no longer
   * imports; the Tailwind scaffold has none, so `force` covers both. */
  remove(dir, "app/page.module.css");

  return written;
}

export type Dependency = { name: string; spec: string };

/** The `--no-install` fallback: record the dependencies so the user's own
 *  install resolves them. The default spec is the "latest" dist-tag, which
 *  every manager accepts and replaces with a real range on first install —
 *  and so is anything `--library` put there instead, tag, range or exact. */
export function recordDependencies(dir: string, deps: Dependency[]) {
  const pkgPath = path.join(dir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as {
    dependencies?: Record<string, string>;
  };
  pkg.dependencies ??= {};
  for (const dep of deps) pkg.dependencies[dep.name] = dep.spec;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

/** `pm add` arguments: the bare name resolves `latest` exactly as before, so
 *  only a `--library` spec changes what gets asked of the registry. */
export function toAddSpecs(deps: Dependency[]): string[] {
  return deps.map((d) => (d.spec === "latest" ? d.name : `${d.name}@${d.spec}`));
}

export function dependenciesFor(plan: ProjectPlan, library?: string): Dependency[] {
  /* `--library` steers ONLY the library. The Vite Tailwind extras stay on
   * latest — the templates target current Tailwind v4 regardless of which
   * forte-ui build is being tried out. */
  const lib = { name: "@forte-ui/react", spec: library ?? "latest" };
  return plan.framework === "vite" && plan.tailwind
    ? [lib, { name: "tailwindcss", spec: "latest" }, { name: "@tailwindcss/vite", spec: "latest" }]
    : [lib];
}
