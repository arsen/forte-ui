import { ImageResponse } from "next/og";
import { LOGO } from "@/components/logo";
import { OG } from "@/lib/og-palette";
import { SITE_URL } from "@/lib/site";

/**
 * The share card every route's `opengraph-image.tsx` renders.
 *
 * ---------------------------------------------------------------------------
 * What draws this, and what it cannot do
 * ---------------------------------------------------------------------------
 * `next/og` runs satori: a React element tree in, an SVG out, rasterized by
 * resvg. It is not a browser and does not pretend to be one. Layout is Yoga,
 * so FLEXBOX ONLY — `display: grid` silently lays nothing out — and styling is
 * the inline `style` prop, so there is no stylesheet, no cascade, no
 * `var(--forte-…)` and no `oklch(from …)`.
 *
 * Two consequences shape everything below:
 *
 *   1. The library's own components cannot appear here. `<Button />` arrives
 *      as an unstyled `<button>`, because its CSS Module is a file satori
 *      never reads. Hand-drawing a Button out of divs and literal hex was the
 *      obvious workaround and is the wrong one: it looks right on the day it
 *      is written and silently stops matching the real component the next time
 *      anyone touches it, which is worse than not showing a component at all.
 *      So this card is type, the mark, and the brand gradient — every pixel of
 *      it derived from something that IS the source of truth.
 *
 *   2. Every element in the tree needs `display: flex` the moment it has more
 *      than one child. Satori throws on a multi-child element with the default
 *      `display: block`, and the error surfaces as a failed build with a stack
 *      inside the bundled renderer, so the cause is not obvious from the
 *      message. The explicit `display: "flex"` on the wrappers below is not
 *      redundant.
 *
 * ---------------------------------------------------------------------------
 * Type weight
 * ---------------------------------------------------------------------------
 * `next/og` bundles exactly one face — Geist Regular — and satori does not
 * synthesize a bold from it: `fontWeight: 700` renders identical to 400. So
 * the hierarchy here is built from SIZE and COLOR alone, which is why the
 * title is 68px against 30px body rather than the smaller-but-bolder pairing
 * the site itself uses. Shipping a bold face would mean a binary in the repo
 * and a second thing to keep in step with the site's font stack, which is
 * itself the system UI stack and therefore not a file we could match anyway.
 *
 * ---------------------------------------------------------------------------
 * `export const dynamic = "force-static"`, in every route that calls this
 * ---------------------------------------------------------------------------
 * Required, and the build fails without it — but not for the reason the error
 * gives. An `opengraph-image` compiles to a route handler, and under
 * `output: "export"` Next refuses to collect page data for any route handler
 * that has not declared itself static, in a message naming `dynamic` and
 * `revalidate` that reads as though the image were request-dependent. It is
 * not: the export phase never bails on a metadata route, it is the collection
 * phase in front of it that wants the intent stated. It cannot be re-exported
 * from here either — route segment config is read off the route module — so
 * each card repeats the line.
 */

/** The size every platform crops from: 1.91:1, the OG spec's own ratio. */
export const size = { width: 1200, height: 630 };

export const contentType = "image/png";

/**
 * The mark and wordmark, as a data URI.
 *
 * An `<img>` rather than an inline `<svg>` element tree: satori hands a data
 * URI straight to resvg, which is a complete SVG renderer and draws the
 * gradient exactly, while satori's own SVG handling covers a subset and is the
 * riskier of the two paths for the one graphic that has to be right.
 *
 * The colors are the reason this is built here rather than imported as a file:
 * `public/brand/forte-ui.svg` bakes a wordmark color for a LIGHT page, and
 * this card is dark.
 */
function logoDataUri(): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOGO.width} ${LOGO.height}">` +
    `<defs><linearGradient id="m" x1="0" y1="0" x2="36" y2="48" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0" stop-color="${OG.accent}"/>` +
    `<stop offset="1" stop-color="${OG.secondary}"/>` +
    `</linearGradient></defs>` +
    `<path d="${LOGO.mark}" fill="url(#m)"/>` +
    // White, as in the component: the dots are the mark's highlight and the
    // one color that reads on both ends of the gradient.
    `<path d="${LOGO.dots}" fill="#fff"/>` +
    `<path d="${LOGO.word}" fill="${OG.foreground}"/>` +
    `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/**
 * The mark alone, in one flat color, for the watermark.
 *
 * Flat rather than the gradient: at 10% opacity a two-stop gradient reads as
 * a single muddy tone anyway, and the accent alone keeps the shape legible as
 * a shape. It is the same path the logo above uses, so this is not a second
 * drawing — see the note on `LOGO`.
 */
function markDataUri(): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48">` +
    `<path d="${LOGO.mark}" fill="${OG.accent}"/>` +
    `</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export interface OgCardProps {
  /**
   * The small line above the title — a section name, or the component's
   * `@category`. Optional: the site card has nothing to sit above "Forte UI"
   * that is not just the name again.
   */
  eyebrow?: string;
  /** The headline. One or two words on a section card, a name on a component's. */
  title: string;
  /**
   * The sentence under it. Kept to roughly 140 characters at the call site:
   * past three lines the card starts to look like a paragraph someone
   * screenshotted, and X crops the image's bottom edge on some layouts.
   */
  body: string;
}

/**
 * The card itself. Returns an `ImageResponse`, so a route file is the two
 * lines that name the page and hand it here — see `app/opengraph-image.tsx`.
 */
export function ogCard({ eyebrow, title, body }: OgCardProps): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: OG.background,
          color: OG.foreground,
        }}
      >
        {/* The brand gradient as a rule across the top. It is the one element
          * carrying the library's actual pitch — accent to secondary, the two
          * seeds every other color derives from — and a full-bleed bar reads
          * at thumbnail size in a feed where a logo alone does not. */}
        <div
          style={{
            height: 10,
            width: "100%",
            background: `linear-gradient(90deg, ${OG.accent}, ${OG.secondary})`,
          }}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            padding: "0 76px",
            // The watermark below is deliberately wider than the space left
            // for it, so it runs off the right edge instead of sitting in the
            // margin like a sticker. This is what clips it.
            overflow: "hidden",
          }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- satori
              * renders `<img>`; `next/image` is a React component it cannot
              * run, and the site is a static export with the loader off. */}
            <img src={logoDataUri()} width={188} height={42} alt="" />

            {eyebrow ? (
              <div
                style={{
                  marginTop: 44,
                  fontSize: 25,
                  // Loose, because it is set in caps at a small size, where
                  // default tracking closes letters up into a block.
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  // Step 11, not the seed. See the note on `accentText` — the
                  // seed measures 3.53:1 here and fails AA.
                  color: OG.accentText,
                }}
              >
                {eyebrow}
              </div>
            ) : null}

            <div
              style={{
                // Without an eyebrow the title carries the whole step down
                // from the logo; a single fixed margin would leave the site
                // card and the section cards sitting at different heights.
                marginTop: eyebrow ? 16 : 46,
                fontSize: 68,
                lineHeight: 1.12,
              }}
            >
              {title}
            </div>

            <div
              style={{
                marginTop: 24,
                fontSize: 30,
                lineHeight: 1.45,
                color: OG.muted,
                // Shorter than the column it sits in. A share card is read at
                // a glance and in a feed at half size, so it wants a tighter
                // measure than a page does.
                maxWidth: 780,
              }}
            >
              {body}
            </div>
          </div>

          {/* The mark, oversized and running off the edge. It fills the right
            * third — which every one of these cards leaves empty, because the
            * text is set to a measure — with the one graphic that is unarguably
            * the brand, rather than with a drawing of a component that would
            * be a guess at what the library looks like. Low enough in the
            * stack that it never competes with the type: at this opacity it
            * measures under 1.2:1 against the ground.
            *
            * eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={markDataUri()}
            width={264}
            height={352}
            alt=""
            style={{ opacity: 0.1, marginRight: -76, marginLeft: 32 }}
          />
        </div>

        {/* The address, on its own band. A card is very often seen before the
          * link under it — in a Discord embed the domain is small grey text
          * above the title, and a screenshot of a card has no link at all — so
          * the card says where it goes, and what to install once you are there. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "26px 76px",
            borderTop: `1px solid ${OG.border}`,
            background: OG.panel,
            fontSize: 24,
            color: OG.muted,
          }}
        >
          <div>{SITE_URL.replace("https://", "")}</div>
          <div>@forte-ui/react</div>
        </div>
      </div>
    ),
    size,
  );
}
