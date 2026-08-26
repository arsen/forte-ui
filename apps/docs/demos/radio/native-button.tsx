"use client";

import * as React from "react";
import { Radio, RadioGroup } from "@dofortech/pretty-ui";

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "var(--pui-control-gap)",
  cursor: "pointer",
};

export default function RadioNativeButton() {
  const groupLabelId = React.useId();

  return (
    <div>
      <div
        id={groupLabelId}
        style={{
          marginBlockEnd: "var(--pui-space-2)",
          fontSize: "var(--pui-font-size-2)",
          fontWeight: "var(--pui-font-weight-medium)",
        }}
      >
        Theme
      </div>

      <RadioGroup
        aria-labelledby={groupLabelId}
        name="theme"
        defaultValue="system"
        style={{ gap: "var(--pui-space-2)" }}
      >
        {/* Sibling label. `nativeButton` tells Base UI the rendered element
          * really is a <button> — and it also moves `id` from the hidden input
          * onto the root, which is the whole reason htmlFor resolves here. */}
        <div style={rowStyle}>
          <Radio
            value="system"
            id="theme-system"
            nativeButton
            render={<button type="button" />}
          />
          <label htmlFor="theme-system" style={{ cursor: "pointer" }}>
            Match my system
          </label>
        </div>

        {/* Enclosing label. A <button> inside a <label> needs the render
          * CALLBACK rather than an element: the callback controls where the
          * button goes, so Base UI can keep the hidden <input> outside the
          * label. With a plain `render={<button />}` the input would land
          * inside it and the label would have two controls to resolve to. */}
        <Radio
          value="light"
          nativeButton
          render={(props) => (
            <label style={rowStyle}>
              <button type="button" {...props} />
              Always light
            </label>
          )}
        />

        <Radio
          value="dark"
          nativeButton
          render={(props) => (
            <label style={rowStyle}>
              <button type="button" {...props} />
              Always dark
            </label>
          )}
        />
      </RadioGroup>
    </div>
  );
}
