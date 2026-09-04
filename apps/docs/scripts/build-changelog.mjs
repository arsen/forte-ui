/**
 * Generates app/(docs)/changelog/page.mdx — the site's changelog page — from
 * the repository's CHANGELOG.md.
 *
 * The file at the root is the record: `/release-prep` writes it, Keep a
 * Changelog shapes it, and nothing on the site is allowed to say something
 * different about a release. So the page is not written, it is derived — the
 * ten most recent releases, verbatim, plus a link to the file for the rest.
 * Ten because a reader on this page is asking "what changed since I last
 * looked", which is the top of the file, and a page carrying every alpha back
 * to the first commit would bury that answer under history GitHub already
 * renders better. The full file is one click away, and the page says so.
 *
 * ---------------------------------------------------------------------------
 * Why an MDX page, and not a component over parsed data
 * ---------------------------------------------------------------------------
 * The entries are markdown — code spans, bold `**Breaking:**` prefixes, the
 * odd link — and the site already has a markdown pipeline with the prose
 * typography attached: the element mapping in `mdx-components.tsx`, rehype-slug
 * for the anchors, and `build-toc.mjs` reading the headings for the section
 * rail. Emitting MDX puts the changelog through all of it for free. A version
 * is an `##`, so the rail lists the releases; a component group stays an
 * `###`, so it nests under its release. Parsing the file into JSON and
 * rendering it with a component would mean a second markdown renderer for
 * the entries, or no formatting in them.
 *
 * That is also why this must run BEFORE `build-toc.mjs` in the `generate`
 * chain: the rail's seed is read off the page files, and this is one of them.
 *
 * ---------------------------------------------------------------------------
 * This is a gate as much as a generator
 * ---------------------------------------------------------------------------
 * It refuses to write the page if the changelog is malformed — a release
 * heading that is not `## [<version>] - <YYYY-MM-DD>`, a version with no link
 * definition at the foot of the file, or an entry MDX reads as code rather
 * than text (a bare `<tag>` or `{expression}` outside a code span is JSX to
 * MDX — it either fails to parse, or parses and then throws at render as an
 * undefined identifier, either way against a generated file nobody edits). Each failure
 * names the line in CHANGELOG.md to fix, because that is the file that is
 * wrong. The build stopping here, at the release that introduced the problem,
 * beats the site quietly shipping without its newest release.
 *
 *   pnpm --filter @forte-ui/docs changelog
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createProcessor } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = join(root, "..", "..", "CHANGELOG.md");
const outDir = join(root, "app", "(docs)", "changelog");
const outFile = join(outDir, "page.mdx");

/** How many releases the page carries; the rest are a link away. */
const LATEST = 10;

function fail(message) {
  console.error(`\nchangelog: page.mdx cannot be generated:\n  ✗ ${message}`);
  process.exit(1);
}

/* ---------------------------------------------------------------------------
 * Parse
 *
 * Keep a Changelog is regular enough that a line scan is the whole parser: a
 * `## [x] - date` opens a release, everything until the next `## ` is its
 * body, and `[x]: url` lines at the foot are the link definitions. The
 * preamble (the h1, the HTML comment, the Keep a Changelog paragraph) and the
 * `[Unreleased]` section both fall outside any release and are dropped — the
 * site is a snapshot of a shipped version, and an unreleased entry describes a
 * package no reader can install yet.
 * ------------------------------------------------------------------------ */
const lines = readFileSync(source, "utf8").split("\n");
const releases = [];
const links = new Map();
let current = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const at = `CHANGELOG.md:${i + 1}`;

  if (line.startsWith("## ")) {
    const heading = /^\[([^\]]+)\](?: - (\d{4}-\d{2}-\d{2}))?\s*$/.exec(line.slice(3));
    if (!heading) {
      fail(`${at}: a release heading has to read "## [<version>] - <YYYY-MM-DD>", got ${JSON.stringify(line)}`);
    }
    if (heading[1] === "Unreleased") {
      current = null;
      continue;
    }
    if (!heading[2]) fail(`${at}: release ${heading[1]} has no date — "## [${heading[1]}] - <YYYY-MM-DD>"`);
    current = { version: heading[1], date: heading[2], line: i + 1, body: [] };
    releases.push(current);
    continue;
  }

  const definition = /^\[([^\]]+)\]:\s+(\S+)\s*$/.exec(line);
  if (definition) {
    links.set(definition[1], definition[2]);
    continue;
  }

  if (current) current.body.push({ text: line, line: i + 1 });
}

if (releases.length === 0) fail("no release section found — the file has no `## [<version>] - <date>` heading");

for (const release of releases) {
  // Blank lines at either end of a body are the spacing between sections in
  // the source file, not part of the release.
  while (release.body.length && release.body[0].text.trim() === "") release.body.shift();
  while (release.body.length && release.body.at(-1).text.trim() === "") release.body.pop();
}

/* Every release links to its diff, and the release script's tag is what makes
 * that link resolve — so a missing definition is a release-prep mistake, and
 * this is the one place that notices before a reader clicks it. */
const shown = releases.slice(0, LATEST);
for (const release of shown) {
  release.href = links.get(release.version);
  if (!release.href) {
    fail(
      `CHANGELOG.md:${release.line}: no link definition for [${release.version}] — add ` +
        `"[${release.version}]: <repo>/compare/v<previous>...v${release.version}" at the foot of the file`,
    );
  }
}

/* The repository's address, taken from the links already in the file rather
 * than typed here: `https://github.com/<owner>/<repo>/compare/...` minus the
 * path after the repo. The same rule `release-prepper` follows for the
 * definitions it adds, so the two cannot name different repositories. */
const repo = (() => {
  const url = new URL(shown[0].href);
  const [owner, name] = url.pathname.split("/").filter(Boolean);
  if (!owner || !name) fail(`the link for [${shown[0].version}] does not look like a repository URL: ${url}`);
  return `${url.origin}/${owner}/${name}`;
})();
const changelogUrl = `${repo}/blob/main/CHANGELOG.md`;

/* ---------------------------------------------------------------------------
 * Emit
 *
 * Every emitted line remembers the CHANGELOG.md line it came from (or `null`
 * for the template), so the compile check below can point at the source
 * rather than at a line in a file the reader is told not to edit.
 * ------------------------------------------------------------------------ */
const out = [];
const emit = (text, src = null) => out.push({ text, src });

const earliest = releases.at(-1);
const older = releases.length - shown.length;
const longDate = (iso) =>
  new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

emit(`{/*`);
emit(` * GENERATED FILE — do not edit by hand.`);
emit(` * Regenerate with:  pnpm --filter @forte-ui/docs changelog`);
emit(` *`);
emit(` * The ${LATEST} most recent releases in the repository's CHANGELOG.md, verbatim.`);
emit(` * That file is the record — \`/release-prep\` writes it — and this page is`);
emit(` * derived from it, so a fix to an entry belongs there, not here.`);
emit(` */}`);
emit(``);
emit(`import { ReleaseMeta } from "@/components/release-meta";`);
emit(``);
emit(`export const metadata = {`);
emit(`  title: "Changelog",`);
emit(`  description:`);
emit(
  `    "What changed in each release of the forte-ui packages — the ${LATEST} most recent releases, newest first, with a link to the full history.",`,
);
emit(`};`);
emit(``);
emit(`# Changelog`);
emit(``);
emit(
  `What changed in each release, newest first. Breaking changes are marked **Breaking**.`,
);
emit(``);

for (const release of shown) {
  emit(`## v${release.version}`);
  emit(``);
  // A compare link for every release but the first, whose definition points
  // at the release itself — there is nothing before it to compare with.
  const kind = release.href.includes("/compare/") ? "compare" : "release";
  emit(`<ReleaseMeta date=${JSON.stringify(release.date)} href=${JSON.stringify(release.href)} kind="${kind}" />`);
  emit(``);
  for (const line of release.body) emit(line.text, line.line);
  emit(``);
}

emit(`## Full history`);
emit(``);
if (older > 0) {
  emit(
    `This page carries the ${LATEST} most recent releases. The ${older === 1 ? "one release" : `${older} releases`} before them — back to v${earliest.version} on ${longDate(earliest.date)} — ${older === 1 ? "is" : "are"} in [CHANGELOG.md](${changelogUrl}) on GitHub, along with everything above.`,
  );
} else {
  emit(
    `Every release to date is on this page. The same history, as one file, is [CHANGELOG.md](${changelogUrl}) on GitHub.`,
  );
}
emit(``);

const mdx = out.map((entry) => entry.text).join("\n");

/* ---------------------------------------------------------------------------
 * Check it compiles — with the plugins the page will actually go through,
 * minus Shiki, which is slow and only touches code blocks. An entry that MDX
 * rejects is reported at its CHANGELOG.md line; without this the error would
 * surface from `next build`, against the generated file, an hour later.
 *
 * Parsing alone is not enough. `{brace}` in prose is a VALID expression — an
 * identifier — so it compiles and then throws at render, and `<html>` in prose
 * is a JSX element that happens to parse. Neither belongs in an entry: the
 * changelog is markdown, and every `{…}` or `<…>` the template itself needs
 * sits on a line with no source. So anything MDX-specific whose position maps
 * back to CHANGELOG.md is an accident, and is refused as one.
 * ------------------------------------------------------------------------ */
const NOT_MARKDOWN = {
  mdxFlowExpression: "a `{…}` expression",
  mdxTextExpression: "a `{…}` expression",
  mdxJsxFlowElement: "a `<tag>`",
  mdxJsxTextElement: "a `<tag>`",
  mdxjsEsm: "an import or export",
};
function refuseMdxInEntries() {
  return (tree) => {
    const walk = (node) => {
      const what = NOT_MARKDOWN[node.type];
      const line = node.position?.start.line;
      if (what && line && out[line - 1]?.src) {
        const error = new Error(`${what} in an entry, which MDX reads as JSX rather than text — wrap it in backticks`);
        error.line = line;
        throw error;
      }
      for (const child of node.children ?? []) walk(child);
    };
    walk(tree);
  };
}

try {
  await createProcessor({
    remarkPlugins: [remarkGfm, refuseMdxInEntries],
    rehypePlugins: [rehypeSlug],
  }).process(mdx);
} catch (error) {
  const line = error?.line ?? error?.place?.start?.line ?? error?.place?.line;
  const src = line ? out[line - 1]?.src : null;
  const where = src ? `CHANGELOG.md:${src}` : line ? `generated page.mdx:${line} (template, not an entry)` : "the generated page";
  fail(`${where}: ${error.reason ? `MDX cannot parse it — ${error.reason}` : error.message}`);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, mdx);
console.log(
  `changelog: ${shown.length} of ${releases.length} releases (v${shown.at(-1).version} … v${shown[0].version})` +
    (older ? `, ${older} older behind the link` : ""),
);
