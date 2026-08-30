"use client";

import { Button } from "@dofortech/forte-ui";

export default function ButtonAsLink() {
  return (
    <Button render={<a href="/theme" />} nativeButton={false} role="link">
      Open Theme Studio
    </Button>
  );
}
