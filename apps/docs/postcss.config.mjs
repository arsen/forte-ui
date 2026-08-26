/**
 * Tailwind runs as a PostCSS plugin — that is the only supported integration
 * for Next, and it is what compiles the `@theme` bridge in app/tailwind.css.
 *
 * Nothing else belongs here: the library ships plain modern CSS (relative
 * colour syntax, `light-dark()`, cascade layers) and an autoprefixer-style
 * pass would only lower what the tokens depend on.
 */
const config = {
  plugins: ["@tailwindcss/postcss"],
};

export default config;
