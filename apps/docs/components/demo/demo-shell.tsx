"use client";

import * as React from "react";
import { Tabs } from "@dofortech/pretty-ui";
import { DemoFrame, DemoControls, type DemoScope } from "./demo-frame";
import styles from "./demo-shell.module.css";

const INITIAL: DemoScope = { theme: "inherit", dir: "ltr", motion: "inherit" };

/**
 * Preview / Code shell around a demo.
 *
 * `preview` and `code` arrive as already-rendered nodes from a server
 * component — the demo itself and the Shiki-highlighted markup both stay on
 * the server. This component only owns the tab and scope state, so adding
 * these controls costs the demo nothing in client JS.
 */
export function DemoShell({
  preview,
  code,
  title,
}: {
  preview: React.ReactNode;
  code: React.ReactNode;
  title?: string;
}) {
  const [scope, setScope] = React.useState<DemoScope>(INITIAL);
  // Remounting the subtree is the only reliable way to reset a demo whose
  // state lives inside the demo component itself.
  const [resetKey, setResetKey] = React.useState(0);

  return (
    <div className={styles.root}>
      <Tabs.Root defaultValue="preview" variant="line" className={styles.tabs}>
        <div className={styles.bar}>
          <Tabs.List className={styles.list}>
            <Tabs.Tab value="preview" className={styles.tab}>Preview</Tabs.Tab>
            <Tabs.Tab value="code" className={styles.tab}>Code</Tabs.Tab>
            <Tabs.Indicator className={styles.indicator} />
          </Tabs.List>
          {title ? <span className={styles.title}>{title}</span> : null}
        </div>

        <Tabs.Panel value="preview" className={styles.panel}>
          <DemoFrame key={resetKey} scope={scope}>
            {preview}
          </DemoFrame>
          <DemoControls
            scope={scope}
            onChange={setScope}
            onReset={() => setResetKey((k) => k + 1)}
          />
        </Tabs.Panel>

        <Tabs.Panel value="code" className={styles.panel}>
          {code}
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  );
}
