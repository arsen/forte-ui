"use client";

import { Alert, Button } from "@dofortech/pretty-ui";

export default function AlertAction() {
  return (
    <div className="grid w-full gap-3">
      {/* The action is a slot, not a button: whatever goes in keeps its own
        * variant, tone, size and loading state. It sits against the
        * inline-end edge, centred on the whole message. */}
      <Alert.Root tone="info">
        <Alert.Icon />
        <Alert.Title>Dark mode is now available</Alert.Title>
        <Alert.Description>Turn it on under Appearance to try it.</Alert.Description>
        <Alert.Action>
          <Button size="sm" variant="outline">
            Enable
          </Button>
        </Alert.Action>
      </Alert.Root>

      {/* Two controls fit as well. They sit in a flex row with the control
        * gap between them, so the pair reads as one decision. */}
      <Alert.Root tone="danger">
        <Alert.Icon />
        <Alert.Title>Payment failed</Alert.Title>
        <Alert.Description>We will retry once more in 24 hours.</Alert.Description>
        <Alert.Action>
          <Button size="sm" variant="ghost" tone="danger">
            Dismiss
          </Button>
          <Button size="sm" variant="solid" tone="danger">
            Update card
          </Button>
        </Alert.Action>
      </Alert.Root>
    </div>
  );
}
