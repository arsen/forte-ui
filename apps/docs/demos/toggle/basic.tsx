"use client";

import { Toggle } from "@dofortech/pretty-ui";

export default function ToggleBasic() {
  // A lone toggle owns its own state: `defaultPressed` for uncontrolled,
  // `pressed` + `onPressedChange` for controlled. `value` is for grouping and
  // does nothing here.
  return <Toggle defaultPressed>Show archived</Toggle>;
}
