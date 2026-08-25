import Link from "next/link";
import { Button } from "@dofortech/pretty-ui";
import { HeroThemer } from "@/components/home/hero-themer";
import { CodeBlock } from "@/components/demo/code-block";
import { Showcase } from "@/components/home/showcase";
import styles from "./page.module.css";

const THEME_SNIPPET = `:root {
  --pui-accent-seed: #6d43d4;
}`;

const USAGE_SNIPPET = `import "@dofortech/pretty-ui/theme.css";
import { Button, Dialog } from "@dofortech/pretty-ui";

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

export default function HomePage() {
  return (
    <div>
      <section className={styles.hero}>
        <h1 className={styles.title}>
          A component library that
          <br />
          <span className={styles.gradient}>takes its own advice.</span>
        </h1>
        <p className={styles.lead}>
          Accessible React components built on Base UI, with a design system
          that rebuilds itself around one colour. Every accessibility claim on
          this site is one we measured — and two of them started as bugs we
          found in our own code.
        </p>
        <div className={styles.actions}>
          <Button size="lg" nativeButton={false} render={<Link href="/components/button">Browse components</Link>} />
          <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/theme">Open Theme Studio</Link>} />
        </div>
        <div className={styles.themer}>
          <HeroThemer />
        </div>
      </section>

      <section className={`${styles.section} reveal`}>
        <div className={styles.split}>
          <div>
            <h2 className={styles.h2}>Change one line. Change everything.</h2>
            <p className={styles.body}>
              There is no palette to generate, no build step, and no JavaScript.
              Relative colour syntax derives the whole ramp from your seed, and
              a fitted lightness threshold picks black or white text so the
              contrast holds up whatever you choose.
            </p>
            <CodeBlock code={THEME_SNIPPET} lang="css" />
          </div>
          <div className={styles.ramps}>
            <Ramp name="accent" label="Accent" />
            <Ramp name="secondary" label="Secondary" />
            <Ramp name="gray" label="Neutrals, tinted toward your brand" />
          </div>
        </div>
      </section>

      <section className={`${styles.section} reveal`}>
        <h2 className={styles.h2}>Real components, right here</h2>
        <p className={styles.body}>
          Everything below is the actual library. Try it with a keyboard — every
          control is reachable, and the focus ring stays visible on any
          background.
        </p>
        <Showcase />
      </section>

      <section className={`${styles.section} reveal`}>
        <h2 className={styles.h2}>What you get</h2>
        <div className={styles.grid}>
          {FEATURES.map((f) => (
            <div key={f.title} className={styles.card}>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardBody}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.section} reveal`}>
        <h2 className={styles.h2}>Get started</h2>
        <CodeBlock code="npm install @dofortech/pretty-ui" lang="bash" />
        <CodeBlock code={USAGE_SNIPPET} lang="tsx" />
      </section>
    </div>
  );
}

function Ramp({ name, label }: { name: string; label: string }) {
  return (
    <div className={styles.rampBlock}>
      <p className={styles.rampLabel}>{label}</p>
      <div className={styles.ramp} role="img" aria-label={`${label}: twelve steps`}>
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} style={{ background: `var(--pui-${name}-${i + 1})` }} />
        ))}
      </div>
    </div>
  );
}
