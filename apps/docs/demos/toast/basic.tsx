"use client";

import * as React from "react";
import { Button, Toast, useToast } from "@dofortech/forte-ui";

function Buttons() {
  const toast = useToast();

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button variant="outline" onClick={() => toast.success("Profile saved")}>
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error("Could not save profile", {
            description: "The connection dropped. Your changes are still here.",
          })
        }
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.warning("Storage is nearly full", { description: "94% of 10 GB used." })}
      >
        Warning
      </Button>
      <Button variant="outline" onClick={() => toast.info("Version 4.2 is now live")}>
        Info
      </Button>
      <Button variant="outline" onClick={() => toast.show("Nothing in particular happened")}>
        Plain
      </Button>
    </div>
  );
}

export default function ToastBasic() {
  const [stage, setStage] = React.useState<HTMLDivElement | null>(null);

  return (
    // `container` scopes the stack to this box, so it inherits the demo
    // frame's theme and direction. In an app you leave it off and the stack
    // pins itself to the screen.
    <div ref={setStage} className="relative min-h-[20rem] w-full">
      <Toast.Provider container={stage}>
        <Buttons />
      </Toast.Provider>
    </div>
  );
}
