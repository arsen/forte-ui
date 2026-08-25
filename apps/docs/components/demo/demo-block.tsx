import * as React from "react";
import { CodeBlock } from "./code-block";
import { DemoShell } from "./demo-shell";
import { getDemo, type DemoId } from "@/demos/registry";

/**
 * Renders a registered demo: the real component, and its real source.
 *
 * Both come from the SAME file — imported once normally and once through the
 * `?raw` loader — so the code on screen cannot drift from the code that runs.
 * There is no second copy to keep in sync, which is the failure mode this
 * whole mechanism exists to remove.
 */
export function DemoBlock({ id, title }: { id: DemoId; title?: string }) {
  const demo = getDemo(id);
  const Component = demo.Component;

  return (
    <DemoShell
      title={title ?? demo.file}
      preview={<Component />}
      code={<CodeBlock code={demo.source} lang="tsx" />}
    />
  );
}
