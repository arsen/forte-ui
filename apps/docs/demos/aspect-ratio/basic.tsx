"use client";

import { AspectRatio } from "@dofortech/pretty-ui";

export default function AspectRatioBasic() {
  return (
    <div className="w-full max-w-md">
      {/* The box is 16:9 before the image has downloaded a single byte, so the
        * text under it never moves. That is the whole reason this component
        * exists — everything else it does is convenience. */}
      <AspectRatio ratio="video" variant="filled">
        <img src="/media/harbour.svg" alt="A harbour at dusk, seen from the water" />
      </AspectRatio>
      <p className="mt-3 text-2 text-foreground-muted">
        Cais do Sodré, 19:40
      </p>
    </div>
  );
}
