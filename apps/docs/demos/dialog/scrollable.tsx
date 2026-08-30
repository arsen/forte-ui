"use client";

import * as React from "react";
import { Button, Dialog } from "@forte-ui/react";

const CLAUSES = [
  "1. Accounts. You are responsible for everything that happens under your account, including anything done by teammates you invite. Keep your credentials to yourself, and tell us within 24 hours if you think someone else has them.",
  "2. Acceptable use. Do not use the service to distribute malware, to send unsolicited bulk email, or to store content you have no right to store. We may suspend a project that is actively harming other customers before we contact you about it.",
  "3. Your content. Everything you upload stays yours. You grant us only the permissions we need to run the service: storing your files, moving them between regions, and showing them back to the people you share them with.",
  "4. Billing. Paid plans renew on the anniversary of the day you started them. Cancel at any point before renewal and you keep access until the end of the period you have already paid for.",
  "5. Availability. We target 99.9% monthly uptime and publish every incident on the status page. Scheduled maintenance is announced at least 72 hours ahead and does not count against that target.",
  "6. Support. Business plans get a response within one working day. Every plan can reach us at support@example.com, and we answer in the order questions arrive.",
  "7. Termination. You can delete your account whenever you like. We close an account without notice only for repeated violations of clause 2, and we keep backups for 30 days afterwards so a mistake can be undone.",
  "8. Changes to these terms. When a change affects your rights, we email every account owner 30 days before it takes effect. Continuing to use the service after that date means you accept the new version.",
  "9. Fees and taxes. Prices exclude VAT and any local sales tax, which we add at checkout from the billing address on file. Tell us if your tax status changes and we will reissue the current invoice.",
  "10. Data location. Projects are created in the region you pick and stay there. Backups replicate to a second region on the same continent, and nothing leaves that continent without your written instruction.",
  "11. Security. We encrypt data in transit and at rest, review access quarterly, and publish a summary of every third-party audit. Report a vulnerability to security@example.com and we confirm receipt within one working day.",
  "12. Subprocessors. The current list is published on our trust page. We announce an addition 30 days before it takes effect, and you may object in writing during that window.",
  "13. Fair use. Plans include generous limits rather than hard ones. If a project runs far beyond its plan for a sustained period we will contact you to agree a fit, and we will never throttle you without warning.",
  "14. Beta features. Anything marked beta may change or be withdrawn at short notice and sits outside the availability target in clause 5. Do not build a production dependency on one without talking to us first.",
  "15. Liability. Neither side is liable for indirect or consequential loss, and our total liability in any twelve-month period is capped at the fees you paid us during that period.",
  "16. Governing law. These terms are governed by the law of the place our company is registered, and both sides agree to attempt mediation before starting proceedings.",
];

export default function DialogScrollable() {
  const popupRef = React.useRef<HTMLDivElement>(null);

  return (
    <Dialog.Root>
      <Dialog.Trigger render={<Button variant="outline" />}>
        Read the terms
      </Dialog.Trigger>
      {/* Focus the popup rather than the first tabbable element inside it.
          That default is right for a dialog that fits on screen, and wrong for
          this one: the first tabbable element here is Decline, sixteen clauses
          down, and the browser scrolls whatever it focuses into view — so the
          terms would open at the end of the terms. Focusing the popup leaves
          the viewport where it starts, and still announces the title and
          description. Any dialog long enough to scroll wants this. */}
      <Dialog.Popup ref={popupRef} initialFocus={popupRef}>
        <Dialog.Title>Terms of service</Dialog.Title>
        <Dialog.Description>Last updated 1 August 2026.</Dialog.Description>
        {CLAUSES.map((text) => (
          <p key={text} className="m-0">
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
