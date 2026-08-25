/**
 * MDX code-block highlighting, sharing the one highlighter instance from
 * lib/highlighter.ts rather than creating a second one per compile.
 *
 * Referenced by ABSOLUTE path from next.config.ts: @next/mdx resolves plugin
 * strings relative to its own package, so a relative path silently fails to
 * resolve.
 */
import rehypeShikiFromHighlighter from "@shikijs/rehype/core";
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerMetaHighlight,
} from "@shikijs/transformers";
import { highlighter, shikiOptions } from "../lib/shiki.mjs";

export default function rehypeShiki(options = {}) {
  return rehypeShikiFromHighlighter(highlighter, {
    ...shikiOptions,
    // Notation comments (`// [!code ++]`) are stripped from the rendered text,
    // which is exactly what copy-to-clipboard wants — it reads textContent.
    transformers: [
      transformerNotationDiff(),
      transformerNotationHighlight(),
      transformerMetaHighlight(),
    ],
    ...options,
  });
}
