"use client";

import { Button } from "@forte-ui/react";

export default function ButtonAsLink() {
  return (
    <Button render={<a href="/theme" />} nativeButton={false} role="link">
      Open Theme Studio
    </Button>
  );
}
