"use client";

import { ScrollArea } from "@dofortech/forte-ui";

const LOG = `12:04:01.229  info   build    resolved 1,284 modules in 3.1s
12:04:01.884  info   build    tokens.color.css regenerated from ramp.mjs (12 steps x 3 ramps)
12:04:02.117  warn   a11y     contrast 4.51:1 for accent-9 on background — within 0.01 of the AA floor
12:04:02.940  info   bundle   dist/index.js 41.2 kB (gzip 12.8 kB), no runtime dependencies
12:04:03.006  info   bundle   dist/styles/theme.css 18.9 kB (gzip 4.4 kB)
12:04:03.771  info   test     check-contrast --fine swept 119,108 in-gamut seeds, worst pair 4.50:1
12:04:04.402  error  deploy   preview environment eu-west-1 refused the upload: 413 payload too large
12:04:04.418  info   deploy   retrying against eu-central-1 with chunked transfer encoding
12:04:07.883  info   deploy   preview is live at forte-ui-git-scroll-area.example.dev in 3.4s
12:04:07.901  info   done     6 tasks, 2 cached, 9.72s total`;

export default function ScrollAreaBothAxes() {
  return (
    <ScrollArea.Root className="h-[9rem] w-full max-w-[34rem]">
      <ScrollArea.Viewport aria-label="Build log">
        <ScrollArea.Content>
          <pre className="m-0 font-mono text-1 leading-normal text-foreground-muted">
            {LOG}
          </pre>
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
}
