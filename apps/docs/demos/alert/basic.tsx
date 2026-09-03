"use client";

import { Alert } from "@forte-ui/react";

export default function AlertBasic() {
  return (
    /* `w-full` because the demo frame centers its children: an alert is a
      * block in the page, and one shrink-wrapped to its text would not be the
      * component under discussion. */
    <div className="grid w-full gap-3">
      {/* `<Alert.Icon />` with no children draws the standard glyph for the
        * tone — a tick for success, a cross for danger, a triangle for
        * warning, an "i" for info. Four shapes, not one shape in four
        * colors. */}
      <Alert.Root tone="success">
        <Alert.Icon />
        <Alert.Title>Account updated</Alert.Title>
        <Alert.Description>
          Your profile has been saved. The change is live everywhere.
        </Alert.Description>
      </Alert.Root>

      <Alert.Root tone="danger">
        <Alert.Icon />
        <Alert.Title>Payment failed</Alert.Title>
        <Alert.Description>
          Your card was declined. Check the details and try again.
        </Alert.Description>
      </Alert.Root>
    </div>
  );
}
