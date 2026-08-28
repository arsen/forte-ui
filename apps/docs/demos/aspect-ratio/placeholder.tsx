"use client";

import * as React from "react";
import { AspectRatio, Button } from "@dofortech/pretty-ui";

/**
 * What the box is actually for.
 *
 * Load the image and nothing below it moves: the frame already occupies the
 * space the picture is about to fill. Take the frame away and the paragraph
 * jumps down by the height of the image at the moment it decodes — the layout
 * shift every Core Web Vitals report is complaining about.
 */
export default function AspectRatioPlaceholder() {
  const [loaded, setLoaded] = React.useState(false);

  /* Cache-busting so the button can be pressed twice and still show the wait.
   * Not part of the pattern — only of the demo. */
  const src = loaded ? `/media/harbour.svg?v=${Number(loaded)}` : null;

  return (
    <div className="grid w-full max-w-md gap-4">
      <Button
        variant="outline"
        className="justify-self-start"
        onClick={() => setLoaded((v) => !v)}
      >
        {loaded ? "Clear the image" : "Load the image"}
      </Button>

      <AspectRatio ratio="video" variant="filled">
        {src ? <img src={src} alt="A harbour at dusk, seen from the water" /> : null}
      </AspectRatio>

      <p className="text-2 text-foreground-muted">
        This paragraph does not move.
      </p>
    </div>
  );
}
