"use client";

import { Pagination, type PaginationTone } from "@forte-ui/react";

const TONES: PaginationTone[] = ["primary", "secondary", "neutral"];

/* Only the current page draws from the tone; the rest of the strip is
 * neutral in all three, so changing the tone changes one cell. `neutral`
 * swaps the brand fill for a gray one with a stronger border — the border
 * is what keeps "here" apart from "hovered" once both are gray. */
export default function PaginationTones() {
  return (
    <div className="grid gap-5">
      {TONES.map((tone) => (
        <div key={tone} className="grid gap-2">
          <span className="text-1 font-medium text-foreground-muted">{tone}</span>
          <Pagination.Root tone={tone} variant="outline" aria-label={`Pagination, ${tone}`}>
            <Pagination.List>
              <Pagination.Item>
                <Pagination.Previous href="#" />
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.Link href="#">1</Pagination.Link>
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.Link href="#" current>
                  2
                </Pagination.Link>
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.Link href="#">3</Pagination.Link>
              </Pagination.Item>
              <Pagination.Item>
                <Pagination.Next href="#" />
              </Pagination.Item>
            </Pagination.List>
          </Pagination.Root>
        </div>
      ))}
    </div>
  );
}
