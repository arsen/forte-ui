"use client";

import { Button, Dialog } from "@dofortech/pretty-ui";

const CLAUSES = [
  "1. Accounts. You are responsible for everything that happens under your account, including anything done by teammates you invite. Keep your credentials to yourself, and tell us within 24 hours if you think someone else has them.",
  "2. Acceptable use. Do not use the service to distribute malware, to send unsolicited bulk email, or to store content you have no right to store. We may suspend a project that is actively harming other customers before we contact you about it.",
  "3. Your content. Everything you upload stays yours. You grant us only the permissions we need to run the service: storing your files, moving them between regions, and showing them back to the people you share them with.",
  "4. Billing. Paid plans renew on the anniversary of the day you started them. Cancel at any point before renewal and you keep access until the end of the period you have already paid for.",
  "5. Availability. We target 99.9% monthly uptime and publish every incident on the status page. Scheduled maintenance is announced at least 72 hours ahead and does not count against that target.",
  "6. Support. Business plans get a response within one working day. Every plan can reach us at support@example.com, and we answer in the order questions arrive.",
  "7. Termination. You can delete your account whenever you like. We close an account without notice only for repeated violations of clause 2, and we keep backups for 30 days afterwards so a mistake can be undone.",
  "8. Changes to these terms. When a change affects your rights, we email every account owner 30 days before it takes effect. Continuing to use the service after that date means you accept the new version.",
];

const clause = { margin: 0 } as const;

export default function DialogScrollable() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="outline" />}>
        Read the terms
      </Dialog.Trigger>
      <Dialog.Popup>
        <Dialog.Title>Terms of service</Dialog.Title>
        <Dialog.Description>Last updated 1 August 2026.</Dialog.Description>
        {CLAUSES.map((text) => (
          <p key={text} style={clause}>
            {text}
          </p>
        ))}
        <Dialog.Footer>
          <Dialog.Close render={<Button variant="soft" tone="neutral" />}>
            Decline
          </Dialog.Close>
          <Dialog.Close render={<Button />}>Accept</Dialog.Close>
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
