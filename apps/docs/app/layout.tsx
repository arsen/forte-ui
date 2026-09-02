import type { Metadata } from "next";
// Import order is load-bearing. `@layer` fixes an order at first appearance,
// so theme.css must come first (it declares the six `forte.*` layers) and
// globals.css second (it declares `docs, theme, base, components, utilities`,
// which is what puts Tailwind's utilities last and lets them win over the
// site's own base rules). tailwind.css only fills layers those two already
// positioned.
import "@forte-ui/react/theme.css";
import "./globals.css";
import "./tailwind.css";
import { TooltipProvider } from "@/components/tooltip-provider";
import { SiteHeader } from "@/components/site-header";
import { Sidebar } from "@/components/sidebar";
import { Toc } from "@/components/toc";

export const metadata: Metadata = {
  title: { default: "Forte UI", template: "%s · Forte UI" },
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
// app bar's theme control reads to label itself and what it flips, so an
// unset attribute would mean neither the button nor the first click knows
// which way round the page currently is.
// A scheme the studio has PINNED outranks both the stored choice and the OS:
// it is part of the theme being designed, so a "light only" theme has to come
// back light on a dark-mode machine. That is why the studio record is parsed
// first — and in its own `try`, so a corrupt record still leaves the page
// with a mode rather than none.
// The font links are replayed here too — a stored `--forte-font-sans` without
// its stylesheet would silently fall back to the system stack on every page
// except the studio's. Unlike a var value, a link can fetch from anywhere, and
// storage is user-editable, so only Google Fonts URLs are honoured.
const noFlashScript = `(function(){try{var r=document.documentElement;var s=null;try{s=JSON.parse(localStorage.getItem('forte-studio')||'null');}catch(e){}var c=s&&s.config&&s.config.scheme;var t=(c==='light'||c==='dark')?c:localStorage.getItem('forte-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}r.setAttribute('data-theme',t);if(s&&s.root){for(var k in s.root.vars){r.style.setProperty(k,s.root.vars[k]);}for(var d in s.root.data){r.setAttribute('data-forte-'+d,s.root.data[d]);}var f=s.root.fonts;if(f&&f.length){for(var i=0;i<f.length;i++){if(typeof f[i]==='string'&&f[i].indexOf('https://fonts.googleapis.com/')===0){var l=document.createElement('link');l.rel='stylesheet';l.href=f[i];document.head.appendChild(l);}}}}}catch(e){}})();`;

// Visible only on focus. WCAG SC 2.4.1 Bypass Blocks — without it a keyboard
// user tabs through the entire sidebar on every page load.
const SKIP_LINK =
  "absolute top-2 left-2 z-[100] -translate-y-[200%] rounded-control bg-primary px-3 py-2 text-2 font-medium text-on-primary focus-visible:translate-y-0";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      // The scroll padding is the app bar's own height token, so an anchored
      // heading lands clear of the sticky bar (WCAG SC 2.4.11); the breathing
      // room under it is the heading's own `scroll-mt` in
      // `mdx-components.tsx`. Smooth scroll is opt-in per user preference —
      // the library's a11y.css already forces `scroll-behavior: auto` under
      // prefers-reduced-motion, so it needs no guard here.
      className="scroll-smooth scroll-pt-(--forte-app-bar-h-md) [-webkit-text-size-adjust:100%]"
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="m-0 min-h-dvh bg-background font-sans text-3 leading-normal text-foreground antialiased [text-rendering:optimizeLegibility]">
        {/* A shared provider means a row of icon buttons opens instantly after
          * the first tooltip, instead of re-waiting the delay on each one. */}
        <TooltipProvider>
          <a className={SKIP_LINK} href="#main">Skip to content</a>
          {/* A flex column, not a `grid-rows-[auto_1fr]`: a sticky AppBar
            * renders a 1px scroll sentinel as its own previous sibling, and in
            * a two-row grid that sentinel would take the `auto` row and push
            * the page into the `1fr`. */}
          <div className="flex min-h-dvh flex-col">
            {/* The library's AppBar, in a client component of its own — see
              * `site-header.tsx` for why it cannot be written here. */}
            <SiteHeader />
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
            <div className="grid w-full flex-1 justify-center grid-cols-[15rem_minmax(0,var(--container-5xl))_14rem] gap-6 px-4 max-toc:grid-cols-[15rem_minmax(0,var(--container-6xl))] max-nav:grid-cols-[minmax(0,var(--container-6xl))]">
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
