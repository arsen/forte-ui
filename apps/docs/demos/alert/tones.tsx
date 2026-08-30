"use client";

import { Alert } from "@dofortech/forte-ui";

const TONES = [
  ["neutral", "Scheduled maintenance", "The API will be read-only on Sunday from 02:00 UTC."],
  ["info", "Dark mode is available", "Turn it on under Appearance in your profile settings."],
  ["success", "Deploy finished", "Version 4.2 is serving traffic in every region."],
  ["warning", "Storage is nearly full", "You have used 94% of 10 GB. Older exports will stop."],
  ["danger", "Payment failed", "Your card was declined. Update it to keep your subscription."],
  ["primary", "You are on the beta channel", "Builds here can change without notice."],
  ["secondary", "Two people are editing", "Their changes will merge when they save."],
] as const;

export default function AlertTones() {
  return (
    <div className="grid w-full gap-3">
      {TONES.map(([tone, title, body]) => (
        <Alert.Root key={tone} tone={tone}>
          {/* Renders nothing on neutral, primary and secondary — those are
            * emphasis rather than status, and there is no glyph that means
            * "slightly louder paragraph". The icon column collapses instead
            * of leaving a hole, so the same JSX serves all seven. */}
          <Alert.Icon />
          <Alert.Title>{title}</Alert.Title>
          <Alert.Description>{body}</Alert.Description>
        </Alert.Root>
      ))}
    </div>
  );
}
