"use client";

import * as React from "react";
import { AppBar, Badge, Button } from "@forte-ui/react";
import { SiGithub } from "react-icons/si";
import { ICON } from "./styles";
import { Logo } from "./logo";
import { ThemeDrawer } from "./theme-drawer";
import { NavDrawer, TocDrawer } from "./shell-drawers";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { routeKey } from "@/lib/route";
import { LIBRARY_VERSION, PACKAGE_URL } from "@/lib/version";
import { cn } from "@/lib/cn";

/**
 * The site header — the shell's top row, and the library's own `AppBar`.
 *
 * A client component, and not by choice: the root layout has to stay a server
 * component for its `metadata` export, and `AppBar` reaches the server as a
 * client-reference proxy of the whole namespace object, on which `.Root` is
 * `undefined`. The layout renders this instead, and everything the bar holds
 * is a client component anyway — the three drawers are — so nothing crosses
 * the boundary that was not crossing it already.
 *
 * `frosted` carries the translucency and the blur guard — only where the
 * browser can blur, never for a reader who has asked for less transparency —
 * and `elevateOnScroll` keeps the bar part of the page until content is
 * actually under it. The site adds no header CSS of its own: the sticky
 * offset the two shell columns hang from is the bar's height, read from the
 * library's `--forte-app-bar-h-md` token.
 */
/**
 * On the home page the wordmark in the bar starts hidden and fades in once
 * the page has scrolled.
 *
 * The hero directly under the bar IS the logo, half a screen tall, and a
 * second copy an inch above it names the site twice. So on that one route
 * the bar's copy waits for the reader to leave the top — and only there:
 * on every docs page it is the only thing naming the site, and it stays.
 *
 * The signal is the AppBar's own `data-scrolled`, which the library sets
 * from an IntersectionObserver on a sentinel above the bar, so this is
 * pure CSS on the docs side and works in every browser the library does.
 * The cost is timing: `data-scrolled` lands after the first pixel of
 * scroll, while the big logo is still in view, so for a few hundred pixels
 * both are on screen. The exact version — the wordmark fading in AS the
 * hero logo slides out under the bar — is a scroll-driven animation: a
 * `view-timeline-name` on the hero's logo, `timeline-scope` on `body`, and
 * an `animation-range: exit` on this link. Firefox does not implement
 * scroll-driven animations today, which would leave it hidden or visible
 * for good depending on the fill; once it ships them, switch to that and
 * drop the route check, since a page with no hero has no timeline and the
 * link simply keeps its base style.
 *
 * `visibility` rides along with the opacity so the invisible link is not a
 * tab stop at the top of the page. Transitioned together, it flips to
 * visible at the start of the fade-in and to hidden at the end of the
 * fade-out — the discrete interpolation of `visibility` gives exactly that.
 */
const HOME_LOGO = cn(
  "invisible opacity-0 transition-[opacity,visibility] duration-fast ease-standard",
  "[[data-scrolled]_&]:visible [[data-scrolled]_&]:opacity-100",
);

export function SiteHeader() {
  const home = routeKey(usePathname()) === "/";
  return (
    <AppBar.Root
      position="sticky"
      variant="frosted"
      elevateOnScroll
      scrollThreshold={40}
      /* The one knob set here is the stacking level. The bar's default band
       * is 10, and a sticky AppBar in a demo on the page sits in the same
       * band later in the DOM, so scrolled past a demo it would paint over
       * the site's own bar. A knob rather than a `z-*` utility because it is
       * the bar's declared property — see *Styling the docs site* in
       * AGENTS.md. */
      style={{ "--forte-app-bar-z-index": 20 } as React.CSSProperties}
    >
      {/* The page list's drawer trigger leads the bar, ahead of the wordmark,
        * because that is where a reader's thumb already goes looking for it.
        * It shows itself only below `--breakpoint-nav` — see
        * `shell-drawers.tsx`. The wordmark sits beside it in the leading slot
        * rather than in `AppBar.Title`: it is the product mark, not the
        * screen's name, and a title slot would hold the hidden trigger's gap
        * open on every desktop width. */}
      <AppBar.Leading>
        <NavDrawer />
        {/* The logo carries the link's name — it is `role="img"` with an
          * `aria-label` — so the link needs no text of its own. `flex` on the
          * anchor is what keeps an inline SVG from sitting on the text
          * baseline and adding descender space under it. */}
        <Link className={cn("flex shrink-0", home && HOME_LOGO)} href="/">
          <Logo />
        </Link>
      </AppBar.Leading>
      <AppBar.Trailing>
        {/* The library version, as a pill that links to its GitHub release.
          * The number is the one baked in at build time from the library's
          * own manifest — see `lib/version.ts`. A `Badge` and not a `Button`
          * because it is a label first and a link second: it should read as
          * a status beside the controls, not as a fourth control. `neutral`
          * so it does not compete with the accent on the mark beside it.
          *
          * Hidden below the nav breakpoint. On a phone the bar already
          * holds the drawer trigger, the wordmark and three icon buttons,
          * and a fourth item is the one that pushes the wordmark off; the
          * home page hero shows the same number, and a reader on a phone
          * has it a scroll away. */}
        <Badge
          tone="neutral"
          variant="outline"
          shape="pill"
          className="max-nav:hidden font-mono"
          title={`@forte-ui/react ${LIBRARY_VERSION} on npm`}
          render={<a href={PACKAGE_URL} target="_blank" rel="noreferrer" />}
        >
          v{LIBRARY_VERSION}
        </Badge>
        {/* A link, rendered as a button, so the three controls on this side
          * share one shape — the alternative is a bare `<a>` whose icon sits
          * at a different optical size and hovers differently from the two
          * beside it. `render` swaps the ELEMENT and keeps the styling, which
          * is the whole point of the prop; `aria-label` carries the name the
          * glyph dropped.
          *
          * `nativeButton={false}` tells Base UI the element is not a
          * `<button>`, and `role="link"` then puts back the semantics Base
          * UI's button emulation would otherwise take away. This really is a
          * link — it navigates, and it opens in a new tab from the context
          * menu — so it must be announced as one.
          *
          * The mark is Simple Icons' rather than a lucide one: lucide removed
          * its brand icons, and a brand belongs to its owner — an
          * approximation of the Octocat is worse than the real one. */}
        <Button
          variant="ghost"
          iconOnly
          nativeButton={false}
          role="link"
          aria-label="forte-ui on GitHub"
          title="GitHub"
          render={
            <a href="https://github.com/arsen/forte-ui" target="_blank" rel="noreferrer" />
          }
        >
          <SiGithub className={ICON} aria-hidden="true" />
        </Button>
        <ThemeDrawer />
        {/* Trailing, on the same side as the column it replaces — and only
          * where that column exists. The section rail is part of the docs
          * shell, and the home page is the one route outside it, so the
          * drawer that stands in for the rail has no business there either.
          * Without the check it appeared anyway, a beat after load: the home
          * page's `<h2 id>`s are there for `aria-labelledby`, not as a table
          * of contents, but `useTocHeadings` reads them off the DOM on mount
          * all the same and the button popped in over a page that had
          * rendered without one. */}
        {!home && <TocDrawer />}
      </AppBar.Trailing>
    </AppBar.Root>
  );
}
