"use client";

import { Button, Input, Separator } from "@forte-ui/react";

export default function SeparatorLabeled() {
  return (
    <div className="grid w-full max-w-[20rem] gap-4">
      <Button variant="outline" fullWidth>
        Continue with Google
      </Button>

      {/* The rule splits around its children, and is named by them: a screen
        * reader hears "or, separator" rather than skipping it. */}
      <Separator>or</Separator>

      <Input type="email" placeholder="you@company.com" aria-label="Email" />
      <Button fullWidth>Continue with email</Button>
    </div>
  );
}
