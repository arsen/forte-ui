"use client";

import * as React from "react";
import { AppBar, Button } from "@forte-ui/react";
import { SiGithub } from "react-icons/si";
import { ICON } from "./styles";
import { Logo } from "./logo";
import { ThemeDrawer } from "./theme-drawer";
import { NavDrawer, TocDrawer } from "./shell-drawers";
import Link from "next/link";

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
export function SiteHeader() {
  return (
    <AppBar.Root
      position="sticky"
      variant="frosted"
      elevateOnScroll
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
        <Link className="flex shrink-0" href="/">
          <Logo />
        </Link>
      </AppBar.Leading>
      <AppBar.Trailing>
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
        {/* Trailing, on the same side as the column it replaces. */}
        <TocDrawer />
      </AppBar.Trailing>
    </AppBar.Root>
  );
}
