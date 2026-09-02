import type { MDXComponents } from "mdx/types";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";
import { PROSE_H1, TABLE, TABLE_CELL, TABLE_HEAD, TABLE_WRAP } from "@/components/styles";

/**
 * Next looks for this file by convention to resolve MDX element mappings.
 *
 * ---------------------------------------------------------------------------
 * Why the prose typography lives here
 * ---------------------------------------------------------------------------
 * MDX emits bare `<h2>`, `<p>`, `<ul>` and `<table>` with no classes, so the
 * site used to style them with descendant selectors under a `.prose` wrapper.
 * That works, but it reaches THROUGH a demo: `.prose p` also matched the
 * `<p>` a `Field.Description` renders, and undoing that needed a
 * `margin: revert-layer` rule aimed at the demo frame — a rule that only ever
 * made sense in terms of cascade layers, and that a reader of the demo could
 * not see.
 *
 * Mapping the elements instead puts the class on the element MDX itself
 * produced, and nothing else. A `<p>` inside a demo is authored in the demo's
 * own file, is never an MDX element, and so is never touched. The exception
 * proves it useful: markdown written inside `<Callout>` still goes through MDX,
 * so it still gets the typography, which is what a callout wants.
 *
 * ---------------------------------------------------------------------------
 * Where the measure went
 * ---------------------------------------------------------------------------
 * Nowhere. Running text used to stop at 48rem while the demo frames, prop
 * tables and code blocks directly above and below it spanned the whole column,
 * and side by side that reads as a fault rather than as a reading aid: a
 * paragraph broke off a couple of hundred pixels short of the demo under it,
 * with nothing in the layout to explain the ragged edge. Everything on a page
 * shares one right edge now.
 *
 * That leaves exactly one thing setting the line length: the page column's own
 * cap in `app/layout.tsx`. Change it there — a second cap here is what let the
 * two disagree in the first place.
 */

type El<T extends keyof React.JSX.IntrinsicElements> = ComponentPropsWithoutRef<T>;

/* The root's `scroll-padding-top` already clears the sticky app bar when a
 * #fragment lands on a heading (WCAG SC 2.4.11); the `scroll-mt-6` here is
 * only the breathing room under it — the two ADD. It is also what the section
 * rail reads back to decide which heading is current, so the two can never
 * disagree about where a section starts — see `components/toc.tsx`. */
const HEADING = "scroll-mt-6 font-semibold";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,

    h1: ({ className, ...props }: El<"h1">) => (
      <h1 className={cn(PROSE_H1, "mb-3", className)} {...props} />
    ),
    h2: ({ className, ...props }: El<"h2">) => (
      <h2 className={cn(HEADING, "mt-8 mb-3 text-6 tracking-tight", className)} {...props} />
    ),
    h3: ({ className, ...props }: El<"h3">) => (
      <h3 className={cn(HEADING, "mt-6 mb-2 text-4", className)} {...props} />
    ),
    h4: ({ className, ...props }: El<"h4">) => (
      <h4 className={cn(HEADING, "mt-5 mb-2 text-3", className)} {...props} />
    ),

    /* No width cap — see the header. `text-pretty` is doing the work a measure
     * used to: over a wide column it is the last line breaking short that makes
     * a paragraph look unfinished, and that is the break it fixes. */
    p: ({ className, ...props }: El<"p">) => (
      <p className={cn("mb-4 text-pretty", className)} {...props} />
    ),

    /* No `list-style` on purpose. Without Preflight the UA markers are intact,
     * and the UA alternates them by depth — the checkbox page nests one list,
     * and a `list-disc` here would flatten level two back to a solid bullet. */
    ul: ({ className, ...props }: El<"ul">) => (
      <ul className={cn("mb-4 ps-5", className)} {...props} />
    ),
    ol: ({ className, ...props }: El<"ol">) => (
      <ol className={cn("mb-4 ps-5", className)} {...props} />
    ),
    li: ({ className, ...props }: El<"li">) => (
      <li className={cn("mb-1", className)} {...props} />
    ),

    a: ({ className, ...props }: El<"a">) => (
      <a
        className={cn(
          "text-primary-text underline decoration-1 underline-offset-[0.2em]",
          className,
        )}
        {...props}
      />
    ),

    /* No `kbd` mapping, and not for lack of trying: a key cap in prose is the
     * library's own `<Kbd>`, but a lowercase element written as literal JSX —
     * which is the only way MDX ever produces a `kbd`, there being no markdown
     * syntax for one — is NOT routed through this mapping. The pages import
     * the component and say what they mean instead. */

    /* Inline code, and then not.
     *
     * Shiki's highlighted output is hast too, so its `<code>` is mapped through
     * here exactly like an inline backtick span — and the chip styling would
     * paint a rounded panel background behind every code block. `[pre_&]:`
     * hands the properties back the moment the element has a `<pre>` above it;
     * `pre.shiki` in globals.css then supplies the type it should inherit. */
    code: ({ className, ...props }: El<"code">) => (
      <code
        className={cn(
          "rounded-2 bg-panel-active px-[0.35em] py-[0.1em] font-mono text-[0.875em]",
          "[pre_&]:rounded-none [pre_&]:bg-transparent [pre_&]:p-0 [pre_&]:font-[inherit] [pre_&]:text-[inherit]",
          className,
        )}
        {...props}
      />
    ),

    /* A fenced block, given the same anatomy `CodeBlock` builds by hand: a
     * surface, then a scroll container, then Shiki's <pre> inside it. The
     * scroll has to sit OUTSIDE the padded <pre>, or a highlighted line — which
     * bleeds into that padding with a negative margin — clips instead of
     * reaching the edge. The `shiki` class arrives on `props.className` and
     * `pre.shiki` in globals.css styles what no class here can reach. */
    pre: ({ className, ...props }: El<"pre">) => (
      <div className="my-4 overflow-hidden rounded-surface border border-border-muted bg-panel">
        <div className="overflow-x-auto">
          <pre className={className} {...props} />
        </div>
      </div>
    ),

    /* Markdown tables, sharing the look with the prop and keyboard tables — see
     * `components/styles.ts` for why that is one list of strings and not
     * three copies. */
    table: ({ className, ...props }: El<"table">) => (
      <div className={TABLE_WRAP}>
        <table className={cn(TABLE, className)} {...props} />
      </div>
    ),
    th: ({ className, ...props }: El<"th">) => (
      <th className={cn(TABLE_HEAD, "whitespace-nowrap", className)} {...props} />
    ),
    /* The descendant variants beat the `code` mapping above on specificity, so
     * a code span in a table cell drops to the smaller, coloured form rather
     * than carrying the inline chip's own size. */
    td: ({ className, ...props }: El<"td">) => (
      <td
        className={cn(TABLE_CELL, "[&_code]:text-[0.85em] [&_code]:text-primary-text", className)}
        {...props}
      />
    ),
  };
}
