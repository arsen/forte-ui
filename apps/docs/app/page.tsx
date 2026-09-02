import Link from "next/link";
// The flat part names, not the `Card` namespace: this page is a Server
// Component, and dereferencing `Card.Root` across the client boundary yields
// `undefined` — the object arrives as an opaque client reference.
import { Button, CardRoot, CardHeader, CardTitle, CardDescription } from "@forte-ui/react";
import { Hero } from "@/components/home/hero";
import { EntryCards } from "@/components/home/entry-cards";
import { Showcase } from "@/components/home/showcase";
import { CodeBlock } from "@/components/demo/code-block";
import { cn } from "@/lib/cn";

/**
 * The home page — the one route outside the docs shell.
 *
 * It renders its own `<main>` because the shell that would normally provide
 * one is the `(docs)` group's layout, which this page is not under. The `id`
 * is the skip link's target and has to be here for the same reason.
 *
 * Every section below the hero is a link out: the entry cards to the
 * guides, the closing block to the install steps. The page is a front door,
 * not a second copy of the Introduction — the prose about WHY the library is
 * shaped the way it is lives there. There is deliberately no component
 * index: fifty-odd tiles is a sidebar laid flat, and the sidebar is one
 * click away on every page the cards lead to.
 */

const FEATURES = [
  {
    title: "One variable, whole system",
    body: "Set a seed colour and twelve accent steps, brand-tinted neutrals, and a readable text colour derive themselves — in both light and dark mode, in pure CSS.",
  },
  {
    title: "Contrast that is measured",
    body: "The ramp is verified against 119,108 in-gamut seeds. Text on a solid fill never drops below 4.5:1, whichever brand colour you pick.",
  },
  {
    title: "Motion that listens",
    body: "Reduced motion is handled once, in the token layer. Movement stops, fades stay, and state that was carried by movement gets a second cue.",
  },
  {
    title: "Built on Base UI",
    body: "Keyboard behaviour, focus management and ARIA come from primitives that are tested across browsers, platforms and screen readers.",
  },
  {
    title: "Yours to override",
    body: "Everything ships inside a cascade layer, so your CSS and your utility classes win without a single !important.",
  },
  {
    title: "No runtime",
    body: "No animation library, no CSS-in-JS, no theme provider. The components render, the browser does the rest.",
  },
];

/* Scroll reveal, progressive enhancement only: the base state is fully VISIBLE
 * and the keyframe is additive, so where scroll-driven animations are missing
 * (Firefox today) or motion is reduced, the section simply appears. Content
 * must never be gated behind an animation that may not run. */
const REVEAL = [
  "motion-safe:scroll-driven:animate-reveal",
  "motion-safe:scroll-driven:[animation-timeline:view()]",
  "motion-safe:scroll-driven:[animation-range:entry_0%_entry_60%]",
].join(" ");

/* The width every section below the hero shares. It is the docs pages' widest
 * column stop, so a reader crossing from the gallery to a component page sees
 * the content stay put rather than jump inward. */
const BAND = "mx-auto w-full max-w-6xl px-4";
const SECTION = cn(BAND, "border-t border-border-muted py-8");
const H2 = "mb-3 text-6 font-semibold tracking-tight";
const BODY = "mb-5 max-w-2xl text-foreground-muted text-pretty";

export default function HomePage() {
  return (
    <main id="main" className="min-w-0 flex-1">
      <Hero />

      <section className={cn(SECTION, REVEAL)} aria-labelledby="start">
        {/* Centred, like the hero above it, so the page turns from the
          * centred landing into the left-aligned sections one row later
          * than the first border line — the cards under it are a symmetric
          * grid, and a left-set heading over them reads as misaligned. */}
        <h2 id="start" className={cn(H2, "text-center")}>Start here</h2>
        <p className={cn(BODY, "mx-auto text-center")}>
          Two guides, one for each bundler, and the studio for when you would
          rather see the theme than read about it.
        </p>
        <EntryCards />
      </section>

      <section className={cn(SECTION, REVEAL)} aria-labelledby="showcase">
        <h2 id="showcase" className={H2}>Real components, right here</h2>
        <p className={BODY}>
          Everything below is the actual library. Try it with a keyboard — every
          control is reachable, and the focus ring stays visible on any
          background.
        </p>
        <Showcase />
      </section>

      <section className={cn(SECTION, REVEAL)} aria-labelledby="features">
        <h2 id="features" className={H2}>What you get</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-4">
          {FEATURES.map((f) => (
            <CardRoot key={f.title}>
              <CardHeader>
                <CardTitle>
                  <h3>{f.title}</h3>
                </CardTitle>
                <CardDescription className="text-pretty">{f.body}</CardDescription>
              </CardHeader>
            </CardRoot>
          ))}
        </div>
      </section>

      <section className={cn(SECTION, REVEAL)} aria-labelledby="install">
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-6 max-split:grid-cols-[minmax(0,1fr)]">
          <div>
            <h2 id="install" className={H2}>Ready when you are</h2>
            <p className={BODY}>
              One package, one stylesheet import, no provider. Pick the guide
              for your bundler and you will be rendering a themed component in
              a few minutes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button nativeButton={false} render={<Link href="/getting-started/nextjs/">Next.js guide</Link>} />
              <Button variant="outline" nativeButton={false} render={<Link href="/getting-started/vite/">Vite guide</Link>} />
            </div>
          </div>
          <CodeBlock code="npm install @forte-ui/react" lang="bash" />
        </div>
      </section>
    </main>
  );
}
