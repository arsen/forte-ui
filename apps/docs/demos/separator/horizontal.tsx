"use client";

import { Separator } from "@dofortech/pretty-ui";

export default function SeparatorHorizontal() {
  return (
    <div className="flex w-full max-w-[30rem] flex-col gap-4">
      <section>
        <h3 className="m-0 text-3">Billing</h3>
        <p className="m-0 mt-1 text-foreground-muted">
          Visa ending 4242 · renews 1 September
        </p>
      </section>

      <Separator />

      <section>
        <h3 className="m-0 text-3">Notifications</h3>
        <p className="m-0 mt-1 text-foreground-muted">
          Email only · digest at 09:00
        </p>
      </section>
    </div>
  );
}
