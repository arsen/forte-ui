import { highlight } from "@/lib/highlighter";
import { CopyButton } from "./copy-button";

/* Revealed on hover for a calm default, but always present once focused — a
 * keyboard user must never have to hover to reach it — and always present on a
 * touch screen, where there is no hover to reveal it with. */
const COPY =
  "absolute top-2 right-2 opacity-0 transition-opacity duration-fast ease-standard group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100";

export function CodeBlock({
  code,
  lang = "tsx",
  title,
  copyable = true,
}: {
  code: string;
  lang?: string;
  title?: string;
  copyable?: boolean;
}) {
  // Runs on the server: the highlighted markup ships as HTML and no Shiki
  // bytes reach the client. The trade is that this cannot re-highlight on
  // theme change — which is exactly why shikiOptions emits both themes as CSS
  // variables instead of baking one in.
  const html = highlight(code, lang);

  return (
    <figure className="group relative m-0 overflow-hidden rounded-surface border border-border-muted bg-panel">
      {title ? (
        <figcaption className="border-b border-border-muted px-4 py-2 font-mono text-1 text-foreground-muted">
          {title}
        </figcaption>
      ) : null}
      <div className="relative">
        {/* The scroll container is separate from the figure so a wide line
          * scrolls the code rather than the page — and separate from the <pre>
          * so a highlighted line's full-bleed background still reaches the
          * padding edge. Everything inside is Shiki's markup; `pre.shiki` in
          * globals.css is what styles it. */}
        <div className="overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
        {copyable ? <CopyButton className={COPY} /> : null}
      </div>
    </figure>
  );
}
