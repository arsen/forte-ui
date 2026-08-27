"use client";

import * as React from "react";
import { Checkbox, CheckboxGroup } from "@dofortech/pretty-ui";

const row = "flex cursor-pointer items-center gap-(--pui-control-gap)";

export default function CheckboxGroupNativeButton() {
  const groupLabelId = React.useId();

  return (
    <div>
      <div id={groupLabelId} className="mb-2 text-2 font-medium">
        Allowed network protocols
      </div>

      <CheckboxGroup aria-labelledby={groupLabelId} defaultValue={["https"]}>
        {/* Sibling label. `nativeButton` tells Base UI the rendered element
          * really is a <button> — and it also moves `id` from the hidden input
          * onto the root, which is the whole reason htmlFor resolves here. */}
        <div className={row}>
          <Checkbox
            value="http"
            id="protocol-http"
            nativeButton
            render={<button type="button" />}
          />
          <label htmlFor="protocol-http" className="cursor-pointer">
            HTTP
          </label>
        </div>

        {/* Enclosing label. A <button> inside a <label> needs the render
          * CALLBACK rather than an element: the callback controls where the
          * button goes, so Base UI can keep the hidden <input> outside the
          * label. With a plain `render={<button />}` the input would land
          * inside it and the label would have two controls to resolve to. */}
        <Checkbox
          value="https"
          nativeButton
          render={(props) => (
            <label className={row}>
              <button type="button" {...props} />
              HTTPS
            </label>
          )}
        />

        <Checkbox
          value="ssh"
          nativeButton
          render={(props) => (
            <label className={row}>
              <button type="button" {...props} />
              SSH
            </label>
          )}
        />
      </CheckboxGroup>
    </div>
  );
}
