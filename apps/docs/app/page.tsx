import Link from "next/link";
import { Button } from "@forte-ui/react";
import { HeroThemer } from "@/components/home/hero-themer";
import { CodeBlock } from "@/components/demo/code-block";
import { Showcase } from "@/components/home/showcase";
import { EYEBROW, LEAD } from "@/components/styles";
import { cn } from "@/lib/cn";

const THEME_SNIPPET = `:root {
  --forte-accent-seed: #6d43d4;
}`;

const USAGE_SNIPPET = `import "@forte-ui/react/theme.css";
import { Button, Dialog } from "@forte-ui/react";

export function Example() {
  return <Button tone="danger">Delete</Button>;
}`;

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

const SECTION = "border-t border-border-muted py-8";
const H2 = "mb-3 text-6 font-semibold tracking-tight";
const BODY = "mb-4 max-w-2xl text-foreground-muted text-pretty";

export default function HomePage() {
  return (
    <div>
      <section className="max-w-hero pt-8 pb-7">
        <h1 className="mb-4 text-[clamp(2.25rem,1.2rem_+_3.6vw,3.75rem)] leading-[1.05] font-bold tracking-[-0.03em] text-balance">
          A component library that
          <br />
          <span
            className={cn(
              "text-primary-text",
              "gradient-text:bg-[linear-gradient(100deg,var(--forte-accent-11),var(--forte-secondary-9)_70%)]",
              "gradient-text:[-webkit-background-clip:text] gradient-text:bg-clip-text",
              "gradient-text:text-transparent",
            )}
          >
            takes its own advice.
          </span>
        </h1>
        <p className={cn(LEAD, "mb-5")}>
          Accessible React components built on Base UI, with a design system
          that rebuilds itself around one colour. Every accessibility claim on
          this site is one we measured — and two of them started as bugs we
          found in our own code.
        </p>
        <div className="mb-6 flex flex-wrap gap-3">
          <Button size="lg" nativeButton={false} render={<Link href="/components/button">Browse components</Link>} />
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/theme">Open Theme Studio</Link>} />
        </div>
        <div className="border-t border-border-muted pt-5">
          <HeroThemer />
        </div>
      </section>

      <section className={cn(SECTION, REVEAL)}>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-6 max-split:grid-cols-[minmax(0,1fr)]">
          <div>
            <h2 className={H2}>Change one line. Change everything.</h2>
            <p className={BODY}>
              There is no palette to generate, no build step, and no JavaScript.
              Relative colour syntax derives the whole ramp from your seed, and
              a fitted lightness threshold picks black or white text so the
              contrast holds up whatever you choose.
            </p>
            <CodeBlock code={THEME_SNIPPET} lang="css" />
          </div>
          <div className="grid gap-4">
            <Ramp name="accent" label="Accent" />
            <Ramp name="secondary" label="Secondary" />
            <Ramp name="gray" label="Neutrals, tinted toward your brand" />
          </div>
        </div>
      </section>

      <section className={cn(SECTION, REVEAL)}>
        <h2 className={H2}>Real components, right here</h2>
        <p className={BODY}>
          Everything below is the actual library. Try it with a keyboard — every
          control is reachable, and the focus ring stays visible on any
          background.
        </p>
        <Showcase />
      </section>

      <section className={cn(SECTION, REVEAL)}>
        <h2 className={H2}>What you get</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(15rem,1fr))] gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={cn(
                "rounded-surface border border-border-muted bg-panel p-surface",
                "transition-[border-color,translate] duration-fast ease-standard",
                // `hover:` is already `@media (hover: hover)` in v4, so a touch
                // screen never sticks the lift on the last thing tapped. The
                // travel token collapses to 0px under reduced motion on its own.
                "hover:-translate-y-(--forte-travel-xs) hover:border-primary-border",
              )}
            >
              <h3 className="mb-2 text-3 font-semibold">{f.title}</h3>
              <p className="text-2 leading-[1.6] text-foreground-muted text-pretty">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={cn(SECTION, REVEAL)}>
        <h2 className={H2}>Get started</h2>
        <CodeBlock code="npm install @forte-ui/react" lang="bash" />
        <CodeBlock code={USAGE_SNIPPET} lang="tsx" />
      </section>
    </div>
  );
}

function Ramp({ name, label }: { name: string; label: string }) {
  return (
    <div className="grid gap-2">
      <p className={cn(EYEBROW, "m-0")}>{label}</p>
      <div
        className="grid h-8 grid-cols-12 gap-[2px] overflow-hidden rounded-3"
        role="img"
        aria-label={`${label}: twelve steps`}
      >
        {Array.from({ length: 12 }, (_, i) => (
          // Colour is the entire content of a swatch — keep it in forced-colors.
          <span
            key={i}
            className="block [forced-color-adjust:none]"
            style={{ background: `var(--forte-${name}-${i + 1})` }}
          />
        ))}
      </div>
    </div>
  );
}
