"use client";

import * as React from "react";

export type ToolbarSize = "sm" | "md" | "lg";

/* -------------------------------------------------------------------------
 * The bar's size, for whatever sits in it
 *
 * A bar whose controls are three different heights does not read as a bar, so
 * `size` set on `Toolbar.Root` becomes the default for everything inside it:
 * the bar's own `Toolbar.Button`, `Toolbar.Input`, `Toolbar.Link` and
 * `Toolbar.Text`, and the library's other controls that end up in a bar —
 * a `Toggle`, a `Select.Trigger` or a `Combobox` handed to `Toolbar.Button`
 * through `render`, where the bar's button steps aside and the rendered
 * component decides its own `data-size`.
 *
 * React context and not CSS inheritance, for the same reason `ToggleGroup`
 * uses context: the size knobs are declared on each control's OWN root rule —
 * which is what lets a consumer re-skin one control, since an element's own
 * declaration beats an inherited one — so a value set on the bar would be
 * inherited and then immediately overwritten. The `data-size` attribute the
 * rules key off has to be resolved in JS and written onto each item.
 *
 * Its own module, and a leaf: Toolbar imports Button and Input, so a context
 * living in Toolbar.tsx could only reach Toggle, Select and Combobox through
 * an import cycle — and would drag the whole Toolbar chunk into any page that
 * merely renders a Select. Nothing here is exported from the package; the
 * consumer-facing surface is the `size` prop on each component.
 *
 * `??` and not `||`, everywhere it is read: a control's own prop wins, then
 * (for a Toggle) its group's, then the bar's, then the component default.
 * ---------------------------------------------------------------------- */

export const ToolbarSizeContext = React.createContext<ToolbarSize | undefined>(undefined);

/** The size the surrounding `Toolbar.Root` asks for; `undefined` outside one. */
export function useToolbarSize(): ToolbarSize | undefined {
  return React.useContext(ToolbarSizeContext);
}
