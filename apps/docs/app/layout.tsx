import type { Metadata } from "next";
// Import order is load-bearing. `@layer` fixes an order at first appearance,
// so theme.css must come first (it declares the six `pretty-ui.*` layers) and
// globals.css second (it declares `docs, theme, base, components, utilities`,
// which is what puts Tailwind's utilities last and lets them win over the
// site's own base rules). tailwind.css only fills layers those two already
// positioned.
import "@dofortech/pretty-ui/theme.css";
import "./globals.css";
import "./tailwind.css";
import { Button } from "@dofortech/pretty-ui";
import { SiGithub } from "react-icons/si";
import { TooltipProvider } from "@/components/tooltip-provider";
import { ICON } from "@/components/styles";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sidebar } from "@/components/sidebar";
import { Toc } from "@/components/toc";
import { NavDrawer, TocDrawer } from "@/components/shell-drawers";

export const metadata: Metadata = {
  title: { default: "pretty-ui", template: "%s · pretty-ui" },
  description:
    "An accessible React component library built on Base UI. One CSS variable re-themes the entire system, motion respects every user preference, and nothing ships a runtime.",
};

// Runs before first paint so the page never flashes the wrong theme. Kept
// deliberately tiny and inlined — an external script would defeat the purpose.
// Two things are restored: the light/dark mode, and whatever the Theme Studio
// was last set to — the studio always themes the whole site. It stores its
// resolved variables alongside the config precisely so this stays a dumb replay
// with no colour maths in the critical path.
//
// `data-theme` is always written, resolved against the OS when nothing is
// stored, rather than left off to let the media query decide. It is what the
// header toggle reads to label itself and what it flips, so an unset attribute
// would mean neither the button nor the first click knows which way round the
// page currently is.
const noFlashScript = `(function(){try{var r=document.documentElement;var t=localStorage.getItem('pui-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}r.setAttribute('data-theme',t);var s=JSON.parse(localStorage.getItem('pui-studio')||'null');if(s&&s.root){for(var k in s.root.vars){r.style.setProperty(k,s.root.vars[k]);}for(var d in s.root.data){r.setAttribute('data-pui-'+d,s.root.data[d]);}}}catch(e){}})();`;

// Visible only on focus. WCAG SC 2.4.1 Bypass Blocks — without it a keyboard
// user tabs through the entire sidebar on every page load.
const SKIP_LINK =
  "absolute top-2 left-2 z-[100] -translate-y-[200%] rounded-control bg-primary px-3 py-2 text-2 font-medium text-on-primary focus-visible:translate-y-0";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      // `scroll-pt-anchor` keeps an anchored heading clear of the sticky header
      // (WCAG SC 2.4.11). Smooth scroll is opt-in per user preference — the
      // library's a11y.css already forces `scroll-behavior: auto` under
      // prefers-reduced-motion, so it needs no guard here.
      className="scroll-smooth scroll-pt-anchor [-webkit-text-size-adjust:100%]"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="m-0 min-h-dvh bg-background font-sans text-3 leading-normal text-foreground antialiased [text-rendering:optimizeLegibility]">
        {/* A shared provider means a row of icon buttons opens instantly after
          * the first tooltip, instead of re-waiting the delay on each one. */}
        <TooltipProvider>
          <a className={SKIP_LINK} href="#main">Skip to content</a>
          <div className="grid min-h-dvh grid-rows-[auto_1fr]">
            <header
              className={[
                "sticky top-0 z-20 flex h-header items-center justify-between gap-4 px-5",
                "border-b border-border-muted bg-background/78",
                // Translucency plus blur, but only where the browser can blur
                // and only for a reader who has not asked for less
                // transparency — see the `frosted` variant in tailwind.css.
                "frosted:backdrop-blur-md frosted:backdrop-saturate-180",
              ].join(" ")}
            >
              {/* The page list's drawer trigger leads the header, ahead of the
                * wordmark, because that is where a reader's thumb already goes
                * looking for it. It shows itself only below `--breakpoint-nav`
                * — see `shell-drawers.tsx`. */}
              <div className="inline-flex items-center gap-2">
                <NavDrawer />
                <a
                  className="inline-flex items-center gap-2 text-4 font-bold tracking-tight whitespace-nowrap"
                  href="/"
                >
                  {/* Decorative: hidden in forced-colors, where a gradient becomes
                    * a meaningless flat system-coloured block. */}
                  <span
                    className="size-5 rounded-3 bg-[linear-gradient(135deg,var(--pui-accent-9),var(--pui-secondary-9))] pui-hc-decorative"
                    aria-hidden="true"
                  />
                  pretty-ui
                </a>
              </div>
              <div className="inline-flex items-center gap-2">
                {/* A link, rendered as a button, so the three controls on this
                  * side share one shape — the alternative is a bare `<a>` whose
                  * icon sits at a different optical size and hovers
                  * differently from the two beside it. `render` swaps the
                  * ELEMENT and keeps the styling, which is the whole point of
                  * the prop; `aria-label` carries the name the glyph dropped.
                  *
                  * `nativeButton={false}` tells Base UI the element is not a
                  * `<button>`, and `role="link"` then puts back the semantics
                  * Base UI's button emulation would otherwise take away. This
                  * really is a link — it navigates, and it opens in a new tab
                  * from the context menu — so it must be announced as one.
                  *
                  * The mark is Simple Icons' rather than a lucide one: lucide
                  * removed its brand icons, and a brand belongs to its owner —
                  * an approximation of the Octocat is worse than the real
                  * one. */}
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  nativeButton={false}
                  role="link"
                  aria-label="pretty-ui on GitHub"
                  title="GitHub"
                  render={
                    <a
                      href="https://github.com/dofortech/pretty-ui"
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                >
                  <SiGithub className={ICON} aria-hidden="true" />
                </Button>
                <ThemeToggle />
                {/* Trailing, on the same side as the column it replaces. */}
                <TocDrawer />
              </div>
            </header>
            {/* The cap is on the PAGE COLUMN, not on the grid, and the two are
              * not interchangeable. A `max-width` on the grid is spent by the
              * two fixed rails first — at 72rem it leaves the page 38rem, less
              * than a five-column prop table needs — so the cap
              * that reads as "72rem of page" has to be written as the column's
              * own maximum. The rails then sit against it at every width and no
              * empty gutter opens up between the page and the section rail.
              *
              * `justify-center`, not `mx-auto`: the grid is `w-full` and has no
              * maximum of its own, so what needs centring is the column set
              * inside it, which is `justify-content` rather than a margin.
              *
              * Nothing else caps the reading measure any more, so this cap IS
              * the line length: prose, tables, demos and code blocks all run to
              * the same right edge, and `mdx-components.tsx` adds no second
              * maximum of its own. Widen this and the paragraphs widen too. */}
            <div className="grid w-full justify-center grid-cols-[15rem_minmax(0,var(--container-5xl))_14rem] gap-6 px-4 max-toc:grid-cols-[15rem_minmax(0,var(--container-6xl))] max-nav:grid-cols-[minmax(0,var(--container-6xl))]">
              <Sidebar />
              <main className="min-w-0 pt-7 pb-8" id="main">{children}</main>
              {/* The section rail. It renders nothing on a page with fewer than
                * two headings, and the track is a fixed width either way, so
                * the centre column does not shift between pages. */}
              <Toc />
            </div>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
