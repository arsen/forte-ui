"use client";

import * as React from "react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { InputGroup } from "@dofortech/pretty-ui";

export default function InputGroupButtons() {
  const [visible, setVisible] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText("https://pretty-ui.dev/install");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex w-full max-w-[22rem] flex-col gap-4">
      {/* The addon sits AFTER the control in the DOM even though it draws at
        * the end edge anyway — for inline-start addons the same freedom is
        * what keeps Tab order matching reading order. */}
      <InputGroup.Root fullWidth>
        <InputGroup.Input
          type={visible ? "text" : "password"}
          defaultValue="correct horse battery"
          aria-label="Password"
        />
        <InputGroup.Addon align="inline-end">
          <InputGroup.Button
            iconOnly
            aria-label="Show password"
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
          >
            {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </InputGroup.Button>
        </InputGroup.Addon>
      </InputGroup.Root>

      <InputGroup.Root fullWidth>
        <InputGroup.Input
          readOnly
          defaultValue="https://pretty-ui.dev/install"
          aria-label="Install link"
        />
        <InputGroup.Addon align="inline-end">
          <InputGroup.Button iconOnly aria-label="Copy link" onClick={copy}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          </InputGroup.Button>
        </InputGroup.Addon>
      </InputGroup.Root>
      <span aria-live="polite" className="pui-visually-hidden">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}
