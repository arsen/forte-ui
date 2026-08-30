"use client";

import { Button, Popover } from "@dofortech/forte-ui";

type Env = { id: string; name: string; region: string; lines: string[] };

const ENVIRONMENTS: Env[] = [
  {
    id: "env-preview",
    name: "Preview",
    region: "eu-west-1",
    lines: ["Rebuilt on every push", "Torn down after 7 idle days"],
  },
  {
    id: "env-staging",
    name: "Staging",
    region: "eu-central-1",
    lines: [
      "Mirrors production data, anonymised",
      "Deploys from main",
      "Two replicas behind the edge cache",
    ],
  },
  {
    id: "env-production",
    name: "Production",
    region: "us-east-1 · eu-central-1",
    lines: ["Deploys on a tagged release"],
  },
];

export default function PopoverViewport() {
  return (
    <Popover.Root<Env>>
      {({ payload }) => (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {ENVIRONMENTS.map((env) => (
              <Popover.Trigger
                key={env.id}
                payload={env}
                render={<Button variant="outline" tone="neutral" size="sm" />}
              >
                {env.name}
              </Popover.Trigger>
            ))}
          </div>

          <Popover.Popup size="sm">
            {/* The Arrow stays OUTSIDE the viewport. The viewport clips, so
              * that it can slide one panel out while the other slides in —
              * and the arrow lives past the popup's edge, where the clip
              * would eat it. */}
            <Popover.Arrow />
            {/* Without this wrapper the content would still swap correctly; it
              * would just cut. The viewport keeps a clone of the outgoing
              * panel mounted for the length of the transition, slides the two
              * past each other in the direction the new trigger lies, and
              * resizes the popup to follow — which is why the three panels
              * here are deliberately different heights. */}
            <Popover.Viewport>
              {payload ? (
                <>
                  <Popover.Title>{payload.name}</Popover.Title>
                  <Popover.Description>{payload.region}</Popover.Description>
                  <ul className="m-0 flex list-disc flex-col gap-1 ps-5">
                    {payload.lines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </Popover.Viewport>
          </Popover.Popup>
        </>
      )}
    </Popover.Root>
  );
}
