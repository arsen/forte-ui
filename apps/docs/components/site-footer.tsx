import { Button } from "@forte-ui/react";
import { Heart } from "lucide-react";
import { SiGithub, SiNpm, SiX } from "react-icons/si";
import { ICON } from "./styles";

/**
 * The site footer — the shell's bottom row, on every route.
 *
 * It renders in the ROOT layout rather than the `(docs)` group's, for the same
 * reason the app bar does: the home page is the one route outside the docs
 * shell, and a credit line that stops at the docs is a credit line missing
 * from the front door. Both routes put `flex-1` on the thing above this — the
 * home page's own `<main>`, the docs group's shell grid — so it comes to rest
 * against the bottom of the viewport on a short page rather than floating
 * halfway up it, with no `mt-auto` of its own.
 *
 * The rule across the top is full-bleed while the home page's section
 * dividers stop at the band. That is the same split the app bar draws: the
 * hairline under a scrolled `AppBar` runs edge to edge because it separates
 * the page from the chrome, and the rules inside a page do not.
 *
 * A Server Component, unlike `site-header.tsx`. Nothing here reads the route
 * or the theme — the header needs `usePathname` for the home page's wordmark —
 * and `react-icons` does render on the server: its `IconContext` is guarded on
 * `React.createContext` being present, which the `react-server` build does not
 * export, so `IconBase` falls through to its default config rather than
 * mounting a Consumer. Adding `"use client"` here would ship three brand
 * glyphs and a link list to the browser for nothing.
 *
 * The measure is the home page's own section band — `max-w-6xl` — and not the
 * docs shell's grid. The shell is three columns and this is one, so matching
 * it would strand the credit line out under the sidebar; matching the landing
 * page's sections lands it under the page column on both kinds of route.
 */

/**
 * Where the project lives, in the order a reader wants them: the source, the
 * thing they install, then who made it.
 *
 * `title` is the tooltip and `label` the accessible name, and they are
 * deliberately different strings — the glyph is unambiguous on hover, where a
 * pointer is already resting on it, and bare "GitHub" three times over is not
 * a name a screen reader user can act on out of the link list.
 *
 * The GitHub entry repeats the app bar's, which is not duplication to remove:
 * the bar's copy scrolls away with the page, and a reader who has reached the
 * bottom of a component page is exactly the one looking for the repo.
 */
const LINKS = [
  {
    title: "GitHub",
    label: "forte-ui on GitHub",
    href: "https://github.com/arsen/forte-ui",
    Icon: SiGithub,
  },
  {
    title: "npm",
    label: "@forte-ui/react on npm",
    href: "https://www.npmjs.com/package/@forte-ui/react",
    Icon: SiNpm,
  },
  {
    title: "X",
    label: "DoFor Tech on X",
    href: "https://x.com/dofortech",
    Icon: SiX,
  },
];

/**
 * The credit link.
 *
 * The underline is not decoration, it is the second cue: the site's link reset
 * in globals.css strips `text-decoration` from every `<a>`, so without it this
 * link is separated from the muted sentence around it by color alone — SC
 * 1.4.1. The utilities sit in `@layer utilities`, which is declared after
 * `docs`, so they beat that reset without an `!important`.
 *
 * `text-foreground` restates the color the reset would otherwise inherit from
 * the muted paragraph; the hover then pulls the underline up to match. No
 * `forte-focus-ring` class, on purpose — globals.css rings every
 * `:focus-visible` that is not a library part, and adding the marker would
 * opt this anchor OUT of the `color: inherit` reset beside it and hand it the
 * UA link color.
 */
const CREDIT_LINK =
  "text-foreground underline decoration-border-strong underline-offset-4 transition-colors duration-fast hover:decoration-current";

export function SiteFooter() {
  return (
    <footer className="border-t border-border-muted">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-5 gap-y-2 px-4 py-5">
        <p className="text-2 text-foreground-muted">
          Built with{" "}
          {/* `size-[1em]` rather than a space step: the heart is a word in this
            * sentence, so it should track the font size and nothing else — an
            * arbitrary value that is a ratio, not a magic number. `fill-current`
            * is a declaration and beats lucide's `fill="none"` attribute, which
            * is what turns the outline into the solid glyph the phrase means.
            *
            * The nudge is `vertical-align` and not a transform: an SVG is
            * replaced content, so it sits on the text baseline and its optical
            * center lands a shade above it. */}
          <Heart
            aria-hidden="true"
            className="inline-block size-[1em] align-[-0.15em] fill-current text-danger-text"
          />
          {/* The glyph carries the word. `aria-hidden` on the heart and the
            * word in the tree beside it, rather than a `role="img"` +
            * `aria-label` on the SVG, because the sentence has to read as one
            * string — "Built with love at dofortech.com" — and not as text
            * interrupted by a graphic. */}
          <span className="forte-visually-hidden">love</span> at{" "}
          <a
            className={CREDIT_LINK}
            href="https://dofortech.com"
            target="_blank"
            rel="noreferrer"
          >
            dofortech.com
          </a>
        </p>
        {/* The same treatment the app bar gives its controls: a link wearing a
          * ghost Button, so the three sit at one optical size and hover as a
          * set. `render` swaps the ELEMENT and keeps the styling;
          * `nativeButton={false}` tells Base UI this is not a `<button>`, and
          * `role="link"` puts back the semantics its button emulation would
          * otherwise take away — these navigate, and they open in a new tab
          * from the context menu, so they have to be announced as links. */}
        <div className="flex items-center gap-1">
          {LINKS.map(({ title, label, href, Icon }) => (
            <Button
              key={href}
              variant="ghost"
              iconOnly
              nativeButton={false}
              role="link"
              aria-label={label}
              title={title}
              render={<a href={href} target="_blank" rel="noreferrer" />}
            >
              <Icon className={ICON} aria-hidden="true" />
            </Button>
          ))}
        </div>
      </div>
    </footer>
  );
}
