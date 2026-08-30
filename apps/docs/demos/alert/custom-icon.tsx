"use client";

import { Alert } from "@forte-ui/react";
import { PartyPopper, Rocket } from "lucide-react";

/* `size-4` is `--forte-space-4`, so the glyph follows the space scale like every
 * other measure on the page. `Alert.Icon` sizes a bare `svg` child for you —
 * this is here because lucide takes a class rather than inheriting one. */
const ICON = "size-4 shrink-0";

export default function AlertCustomIcon() {
  return (
    <div className="grid w-full gap-3">
      <Alert.Root tone="primary">
        <Alert.Icon>
          <Rocket className={ICON} aria-hidden />
        </Alert.Icon>
        <Alert.Title>You are on the beta channel</Alert.Title>
        <Alert.Description>Builds here can change without notice.</Alert.Description>
      </Alert.Root>

      {/* A custom glyph replaces the tone's standard one rather than sitting
        * beside it, so a success alert can celebrate without losing its
        * colour. Keep it `aria-hidden`: the text already says what happened. */}
      <Alert.Root tone="success">
        <Alert.Icon>
          <PartyPopper className={ICON} aria-hidden />
        </Alert.Icon>
        <Alert.Title>Your first deploy is live</Alert.Title>
        <Alert.Description>It took 41 seconds, end to end.</Alert.Description>
      </Alert.Root>
    </div>
  );
}
