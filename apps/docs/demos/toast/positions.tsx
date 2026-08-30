"use client";

import * as React from "react";
import { Button, Select, Toast, useToast, type ToastPosition } from "@forte-ui/react";

const POSITIONS: Record<ToastPosition, string> = {
  "top-start": "Top start",
  top: "Top centre",
  "top-end": "Top end",
  "bottom-start": "Bottom start",
  bottom: "Bottom centre",
  "bottom-end": "Bottom end (default)",
};

function Trigger({ position }: { position: ToastPosition }) {
  const toast = useToast();

  return (
    <Button variant="outline" onClick={() => toast.info(POSITIONS[position])}>
      Show a toast
    </Button>
  );
}

export default function ToastPositions() {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null);
  const [position, setPosition] = React.useState<ToastPosition>("bottom-end");

  return (
    <div ref={setStage} className="relative min-h-[19rem] w-full">
      <Toast.Provider container={stage} position={position}>
        {/* Centred in the box so a top-anchored stack and a bottom-anchored
          * one both have room to land without covering the controls. */}
        <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-3">
          <Select.Root
            items={POSITIONS}
            value={position}
            onValueChange={(next) => setPosition(next as ToastPosition)}
          >
            <Select.Trigger aria-label="Toast position">
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Popup>
              {Object.entries(POSITIONS).map(([value, label]) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Root>
          <Trigger position={position} />
        </div>
      </Toast.Provider>
    </div>
  );
}
