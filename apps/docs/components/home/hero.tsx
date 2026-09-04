import Link from "next/link";
import { Badge, Button } from "@forte-ui/react";
import { Logo } from "../logo";
import { HeroThemer } from "./hero-themer";
import { LEAD } from "../styles";
import { LIBRARY_VERSION, PACKAGE_URL } from "@/lib/version";
import { cn } from "@/lib/cn";

/**
 * The home page hero: the logo, large and centered, and the palette row that
 * recolors it.
 *
 * The logo is the point. Its gradients read the live `--forte-accent-9` /
 * `--forte-secondary-9` tokens, so the swatches under it re-theme the mark
 * on the spot — and the change is a cross-fade rather than a cut, a view
 * transition `hero-themer.tsx` starts around the write. That is the
 * library's whole pitch in one interaction, which is why the palette row
 * sits in the hero and not further down the page.
 *
 * The glow behind the mark is a radial gradient of the accent at low
 * opacity, mixed with `color-mix()` so it follows the seed too. It is a
 * pseudo-element on a wrapper rather than a shadow on the SVG: a filter on
 * an element with two gradients repaints both whenever the seed moves, and
 * a blurred backdrop is what a drop shadow on a thin F would never produce
 * anyway. Under forced colors the gradient is stripped and nothing is left
 * behind, which is right — it carries no information.
 */
export function Hero() {
  return (
    <section className="mx-auto flex w-full max-w-hero flex-col items-center px-4 pt-8 pb-7 text-center max-split:pt-7">
      <div
        className={cn(
          "relative isolate mb-6 w-[min(100%,34rem)] motion-safe:animate-enter",
          "before:absolute before:inset-[-30%_-20%] before:-z-10 before:rounded-pill",
          "before:bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--forte-accent-9)_18%,transparent),transparent)]",
        )}
      >
        <Logo className="h-auto w-full" />
      </div>
      {/* The version, between the mark and the headline, linking to the
        * package on npm. It is the same constant the app bar prints — one
        * import, `lib/version.ts` — and the reason the bar can hide its copy
        * on a phone: this one is a scroll away on every screen. `neutral`
        * and `soft`, so it sits under the logo as a caption rather than
        * competing with the accent gradient in the headline below it. */}
      <Badge
        tone="neutral"
        shape="pill"
        className="mb-4 font-mono"
        render={<a href={PACKAGE_URL} target="_blank" rel="noreferrer" />}
      >
        v{LIBRARY_VERSION}
      </Badge>
      <h1 className="mb-4 text-[clamp(1.75rem,1rem_+_2.6vw,2.75rem)] leading-[1.1] font-bold tracking-[-0.03em] text-balance">
        {/* A non-breaking hyphen: on a phone the line broke inside "re-theme". */}
        Accessible React components that re‑theme from{" "}
        <span
          className={cn(
            "text-primary-text",
            "gradient-text:bg-[linear-gradient(100deg,var(--forte-accent-11),var(--forte-secondary-9)_70%)]",
            "gradient-text:[-webkit-background-clip:text] gradient-text:bg-clip-text",
            "gradient-text:text-transparent",
          )}
        >
          one variable.
        </span>
      </h1>
      <p className={cn(LEAD, "mb-5 max-w-2xl")}>
        Built on Base UI, styled from a token system that derives its whole
        palette from a single seed color — in pure CSS, with contrast that is
        measured rather than promised, and nothing added to your bundle.
      </p>
      <div className="mb-6 flex flex-wrap justify-center gap-3">
        <Button size="lg" nativeButton={false} render={<Link href="/getting-started/introduction/">Get started</Link>} />
        <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/components/">Browse components</Link>} />
        <Button size="lg" variant="ghost" nativeButton={false} render={<Link href="/theme/">Open Theme Studio</Link>} />
      </div>
      <HeroThemer />
    </section>
  );
}
