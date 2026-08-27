"use client";

import * as React from "react";
import { Button } from "@dofortech/pretty-ui";

// Knobs are custom properties, and they belong on the component's own
// element — in an app you would set them in a class; a demo has only `style`.
const LIFTED = {
  "--pui-button-radius": "var(--pui-radius-2)",
  "--pui-button-hover-lift": "2px",
} as React.CSSProperties;

export default function ComponentKnobs() {
  return (
    <>
      <Button>Default</Button>
      <Button style={LIFTED}>Sharper, lifts on hover</Button>
    </>
  );
}
