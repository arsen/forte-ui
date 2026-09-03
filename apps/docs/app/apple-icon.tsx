import { ImageResponse } from "next/og";
import { LOGO } from "@/components/logo";
import { OG } from "@/lib/og-palette";

/**
 * The iOS home-screen icon.
 *
 * `app/icon.svg` already covers browser tabs, but Safari does not use it when
 * a page is added to the home screen: with no `apple-touch-icon` iOS renders a
 * SCREENSHOT of the page as the tile, which for this site is a wall of grey
 * text. Generated here rather than checked in as a PNG so the drawing stays
 * the one in `logo.tsx` — see the note on `LOGO`.
 *
 * The treatment is inverted from the favicon on purpose. The favicon is the
 * gradient mark on nothing, which works against a browser's own chrome; a home
 * screen tile is opaque and gets rounded by the OS, so transparency there
 * becomes a black square. Painting the gradient as the TILE and the mark in
 * white keeps the brand colors at a size where a gradient inside a 36-unit
 * glyph would have been a single muddy tone anyway.
 */
export const dynamic = "force-static";

/** Apple's expected size; iOS scales this one down for every smaller slot. */
export const size = { width: 180, height: 180 };

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${OG.accent}, ${OG.secondary})`,
        }}
      >
        {/* The mark alone — the wordmark is illegible at this size. The
          * viewBox is the mark's own 36×48 box, and the height here leaves a
          * margin wide enough that iOS's corner rounding cannot clip an arm. */}
        <svg viewBox="0 0 36 48" width={81} height={108}>
          <path d={LOGO.mark} fill="#fff" />
          {/* The dots are a highlight punched out of the mark, so on a white
            * mark they have to become the tile again rather than stay white —
            * `#fff` here would erase them. */}
          <path d={LOGO.dots} fill={OG.accent} />
        </svg>
      </div>
    ),
    size,
  );
}
