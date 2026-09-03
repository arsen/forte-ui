import type { Metadata } from "next";
// Import order is load-bearing. `@layer` fixes an order at first appearance,
// so theme.css must come first (it declares the six `forte.*` layers) and
// globals.css second (it declares `docs, theme, base, components, utilities`,
// which is what puts Tailwind's utilities last and lets them win over the
// site's own base rules). tailwind.css only fills layers those two already
// positioned.
import "@forte-ui/react/theme.css";
// Opt into the library's blanket reset — box-sizing, and the platform tap
// highlight the site's own chrome would otherwise flash on touch. Inert
// without `forte-reset` on <html> below. After theme.css because that is what
// declares `forte.reset` for it to land in.
import "@forte-ui/react/styles/reset.css";
import "./globals.css";
import "./tailwind.css";
import { TooltipProvider } from "@/components/tooltip-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Analytics } from "@/components/analytics";
import { SITE_NAME, SITE_TAGLINE, SITE_URL, X_HANDLE } from "@/lib/site";

/**
 * The site's metadata, and the shape of it that makes every page's share card
 * correct without touching a single `page.mdx`.
 *
 * ---------------------------------------------------------------------------
 * Why `openGraph` carries no title and no description
 * ---------------------------------------------------------------------------
 * That omission is the whole mechanism, and filling either field in would
 * quietly break sixty-five pages.
 *
 * Next merges metadata down the tree, but `openGraph` is REPLACED rather than
 * merged: a page that declares one gets only its own, and a page that declares
 * none inherits this object entire. Every route here is the second kind — the
 * MDX pages export `title` and `description` and nothing else. So an
 * `openGraph.title` written here would win on all of them, and `/components/dialog/`
 * would share as "Forte UI" with the site's own blurb under it.
 *
 * Leaving both unset hands the job to `postProcessMetadata`, which runs
 * `inheritFromMetadata(openGraph, metadata)` at the very end of resolution and
 * fills them from the page's OWN resolved title and description — resolved,
 * so the `%s · Forte UI` template above has already been applied. The result
 * is that each page's `og:title` is its real title and its `og:description` is
 * the sentence its author wrote, for free.
 *
 * `twitter` is the same trick one level on: Next auto-fills its title,
 * description and images from the resolved `openGraph`, so this block only has
 * to carry what has no Open Graph equivalent — the card type and the account.
 *
 * ---------------------------------------------------------------------------
 * `metadataBase`
 * ---------------------------------------------------------------------------
 * Required, not optional. A crawler fetching `og:image` has no page to resolve
 * a relative URL against, so Next drops the tag rather than emit one — which
 * is silent, and looks exactly like having no card at all.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_TAGLINE,
  applicationName: SITE_NAME,
  // The name the site already puts on itself, in the footer's credit line and
  // in the X account's own label — not a personal one. These tags are read by
  // aggregators and shown next to the card, so an author here who appears
  // nowhere on the page would be the only place the project is called that.
  authors: [{ name: "DoForTech", url: "https://dofortech.com" }],
  creator: "DoForTech",
  publisher: "DoForTech",
  // `"./"` rather than an absolute URL: the resolver reads it against the
  // route being rendered, so one declaration gives all sixty-six pages their
  // own canonical instead of pointing every one of them at the home page.
  alternates: { canonical: "./" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    url: "./",
  },
  twitter: {
    card: "summary_large_image",
    site: X_HANDLE,
    creator: X_HANDLE,
  },
};

// Runs before first paint so the page never flashes the wrong theme. Kept
// deliberately tiny and inlined — an external script would defeat the purpose.
// Two things are restored: the light/dark mode, and whatever the Theme Studio
// was last set to — the studio always themes the whole site. It stores its
// resolved variables alongside the config precisely so this stays a dumb replay
// with no color maths in the critical path.
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
// storage is user-editable, so only Google Fonts URLs are honored.
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
      className="forte-reset scroll-smooth scroll-pt-(--forte-app-bar-h-md) [-webkit-text-size-adjust:100%]"
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
            {/* The credit line and the project's three outbound links, on
              * every route. Here rather than in the `(docs)` layout for the
              * same reason as the bar above: the home page is outside that
              * group, and it is the route a first-time reader lands on. */}
            <SiteFooter />
          </div>
          {/* Page-view tracking. Inert without a measurement id in the env —
            * see `components/analytics.tsx` and `.env.example`. */}
          <Analytics />
        </TooltipProvider>
      </body>
    </html>
  );
}
