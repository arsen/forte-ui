"use client";

import { Alert } from "@forte-ui/react";

export default function AlertParts() {
  return (
    <div className="grid w-full gap-3">
      {/* Title only. The icon centers on the title's line box, so a one-line
        * alert is exactly one line tall. */}
      <Alert.Root tone="info">
        <Alert.Icon />
        <Alert.Title>Your export is ready to download</Alert.Title>
      </Alert.Root>

      {/* Description only — no title. Auto-placement puts it on the first row
        * rather than leaving an empty one above it. */}
      <Alert.Root tone="neutral">
        <Alert.Description>
          Rows added after the export started are not included.
        </Alert.Description>
      </Alert.Root>

      {/* No icon at all: the icon column is `auto`, so with nothing in it the
        * track is zero wide and the margin that would have followed it does
        * not exist either. The text starts at the padding edge. */}
      <Alert.Root tone="danger">
        <Alert.Title>Three fields need attention</Alert.Title>
        <Alert.Description>
          <ul className="my-0 ps-5">
            <li>Email address is not valid</li>
            <li>Password is under 12 characters</li>
            <li>Country is required</li>
          </ul>
        </Alert.Description>
      </Alert.Root>
    </div>
  );
}
