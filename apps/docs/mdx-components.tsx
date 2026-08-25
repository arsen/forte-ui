import type { MDXComponents } from "mdx/types";

/**
 * Next looks for this file by convention to resolve MDX element mappings.
 * Returning the defaults unchanged is enough — component overrides are applied
 * per-page via imports, and no MDXProvider is used (a context provider cannot
 * run in a server component).
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
