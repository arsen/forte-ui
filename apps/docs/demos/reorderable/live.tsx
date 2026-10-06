"use client";

import * as React from "react";
import { Field, Reorderable, Switch } from "@forte-ui/react";

type Card = { id: string; name: string };

const CARDS: Card[] = [
  { id: "c1", name: "Draft the agenda" },
  { id: "c2", name: "Book the room" },
  { id: "c3", name: "Order lunch" },
  { id: "c4", name: "Send the invites" },
  { id: "c5", name: "Print name tags" },
];

export default function ReorderableLive() {
  const [cards, setCards] = React.useState(CARDS);
  const [collaborators, setCollaborators] = React.useState(false);
  const counter = React.useRef(CARDS.length);

  /* Someone else editing the same list: every couple of seconds a card is
   * added or one is removed. Drag while it happens — the rows around the
   * one you hold make room or close up without a jump, and if the card in
   * your hand is the one removed, the drag simply ends. */
  React.useEffect(() => {
    if (!collaborators) return;
    const timer = window.setInterval(() => {
      const roll = Math.random();
      const at = Math.random();
      counter.current += 1;
      const id = `c${counter.current}`;
      setCards((list) => {
        if ((list.length > 4 && roll < 0.5) || list.length > 8) {
          const index = Math.floor(at * list.length);
          return list.filter((_, i) => i !== index);
        }
        const next = list.slice();
        next.splice(Math.floor(at * (list.length + 1)), 0, { id, name: `New card ${counter.current}` });
        return next;
      });
    }, 2000);
    return () => window.clearInterval(timer);
  }, [collaborators]);

  return (
    <div className="flex w-full max-w-xs flex-col gap-3">
      <Field.Root>
        <Field.Label>
          <Switch checked={collaborators} onCheckedChange={setCollaborators} />
          Simulate collaborators
        </Field.Label>
      </Field.Root>
      <Reorderable.Root
        aria-label="Checklist"
        value={cards.map((card) => card.id)}
        onValueChange={(_, { id, overId, placement }) =>
          /* Applied against the neighbor, not the indexes: by the time the
           * drop lands, the list the indexes were counted in may already be
           * out of date. `overId` and `placement` still say what the reader
           * meant — "after Book the room" — whatever moved meanwhile. */
          setCards((list) => {
            const moving = list.find((card) => card.id === id);
            const rest = list.filter((card) => card.id !== id);
            const at = rest.findIndex((card) => card.id === overId);
            if (!moving || at < 0) return list;
            rest.splice(placement === "after" ? at + 1 : at, 0, moving);
            return rest;
          })
        }
        className="divide-y divide-border-muted rounded-surface border border-border bg-panel"
      >
        {cards.map((card) => (
          <Reorderable.Item
            key={card.id}
            value={card.id}
            label={card.name}
            className="flex items-center gap-2 py-1 ps-1 pe-3 text-2"
          >
            <Reorderable.Handle />
            {card.name}
          </Reorderable.Item>
        ))}
      </Reorderable.Root>
    </div>
  );
}
