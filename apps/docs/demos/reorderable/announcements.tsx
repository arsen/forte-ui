"use client";

import * as React from "react";
import { Reorderable, type ReorderableMessages } from "@forte-ui/react";

const FLIGHTS = [
  { id: "lis", name: "Lisbon" },
  { id: "osl", name: "Oslo" },
  { id: "tbs", name: "Tbilisi" },
  { id: "yul", name: "Montréal" },
];

export default function ReorderableAnnouncements() {
  const [flights, setFlights] = React.useState(FLIGHTS);
  const [heard, setHeard] = React.useState<string[]>([]);

  /* Every string the list speaks goes through `messages` — this is where a
   * translation goes. These are the English defaults reworded slightly, and
   * each one is also written to the transcript below, so the demo shows
   * what a screen reader announces while you use the keyboard: Tab to a
   * grip, Space to pick up, the arrow keys to move, Space to drop, Escape to
   * cancel. */
  const messages = React.useMemo<Partial<ReorderableMessages>>(() => {
    const say = (text: string) => {
      setHeard((lines) => [...lines.slice(-4), text]);
      return text;
    };
    return {
      handle: (label) => `Move ${label}`,
      pickedUp: ({ label, position, total }) => say(`Picked up ${label}, stop ${position} of ${total}.`),
      moved: ({ label, position, total }) => say(`${label}, stop ${position} of ${total}.`),
      dropped: ({ label, position, total }) => say(`${label} dropped at stop ${position} of ${total}.`),
      canceled: ({ label, from, total }) => say(`Canceled. ${label} is back at stop ${from} of ${total}.`),
    };
  }, []);

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Reorderable.Root
        aria-label="Itinerary"
        value={flights.map((flight) => flight.id)}
        onValueChange={(order) => {
          const byId = new Map(flights.map((flight) => [flight.id, flight]));
          setFlights(order.map((id) => byId.get(id)!));
        }}
        messages={messages}
        className="divide-y divide-border-muted rounded-surface border border-border bg-panel"
      >
        {flights.map((flight) => (
          <Reorderable.Item
            key={flight.id}
            value={flight.id}
            label={flight.name}
            className="flex items-center gap-2 py-1 ps-1 pe-3 text-2"
          >
            <Reorderable.Handle />
            {flight.name}
          </Reorderable.Item>
        ))}
      </Reorderable.Root>
      {/* A copy for sighted readers of the demo. The real announcements go
        * to a live region the list renders itself; this is not one. */}
      <ol aria-hidden="true" className="m-0 min-h-[7.5rem] list-none rounded-surface bg-panel-hover p-3 font-mono text-1 text-foreground-muted">
        {heard.length === 0 ? <li>Announcements appear here.</li> : heard.map((line, i) => <li key={i}>{line}</li>)}
      </ol>
    </div>
  );
}
