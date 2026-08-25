// Server-side entry point for app code. The implementation lives in shiki.mjs
// because the MDX rehype plugin must import it as plain ESM too.
import "server-only";

export { highlighter, shikiOptions, highlight } from "./shiki.mjs";
