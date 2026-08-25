"use client";

import * as React from "react";
import { Button } from "@dofortech/pretty-ui";

/**
 * Copies the code from the nearest <pre>'s textContent.
 *
 * Reading the DOM rather than taking the source as a prop is deliberate: it
 * costs no extra bytes in the RSC payload, and Shiki's transformers have
 * already stripped notation comments like `// [!code ++]` from the text, so
 * what lands on the clipboard is exactly what a reader would type.
 */
export function CopyButton({ className }: { className?: string }) {
  const ref = React.useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    const pre = ref.current?.closest("figure, [data-code-root]")?.querySelector("pre");
    if (!pre) return;
    try {
      await navigator.clipboard.writeText(pre.textContent ?? "");
      setCopied(true);
    } catch {
      // Clipboard access can be denied by permissions policy or a non-secure
      // context. Failing silently is better than throwing at the user, and the
      // label simply never changes.
    }
  }

  return (
    <Button
      ref={ref}
      className={className}
      variant="soft"
      tone="neutral"
      size="sm"
      iconOnly
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy code"}
    >
      <span aria-hidden="true">{copied ? <CheckIcon /> : <CopyIcon />}</span>
      {/* aria-label alone does not re-announce on change for all screen
        * readers, so the state change is also pushed through a live region. */}
      <span className="pui-visually-hidden" role="status" aria-live="polite">
        {copied ? "Copied to clipboard" : ""}
      </span>
    </Button>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: "block" }}>
      <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
      <path d="M10.5 3.5v-.5a1.5 1.5 0 0 0-1.5-1.5H4a1.5 1.5 0 0 0-1.5 1.5v5A1.5 1.5 0 0 0 4 9.5h.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "block" }}>
      <path d="m3 8.5 3.5 3.5L13 5" />
    </svg>
  );
}
