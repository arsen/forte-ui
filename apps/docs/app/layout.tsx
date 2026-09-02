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
            {/* The docs shell — sidebar, page column, section rail — is the
              * `(docs)` route group's layout, not this one's: the home page
              * is the one route with no columns, and it runs the full width
              * under the same bar. */}
            {children}
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
