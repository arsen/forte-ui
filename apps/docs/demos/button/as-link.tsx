"use client";

import { Button } from "@dofortech/pretty-ui";

export default function ButtonAsLink() {
  return (
    <Button render={<a href="/theme" />} nativeButton={false} role="link">
      Open Theme Studio
    </Button>
  );
}
