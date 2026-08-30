"use client";

import * as React from "react";
import { Checkbox, CheckboxGroup } from "@forte-ui/react";

const row = "flex cursor-pointer items-center gap-(--forte-control-gap)";
const nest = "ms-6 flex flex-col gap-2";

const MAIN = ["view-dashboard", "manage-users", "access-reports"];
const MANAGEMENT = ["create-user", "edit-user", "delete-user", "assign-roles"];

export default function CheckboxGroupNested() {
  const mainLabelId = React.useId();
  const managementLabelId = React.useId();

  const [main, setMain] = React.useState<string[]>([]);
  const [management, setManagement] = React.useState<string[]>([]);

  return (
    /* Each level is its own CheckboxGroup with its own parent checkbox, and
     * the two are stitched together by hand: "Manage users" is a value in the
     * OUTER group and the parent of the INNER one, and nothing in Base UI
     * connects those two facts. Ticking it here therefore has to fill the
     * inner group, and filling the inner group has to tick it. */
    <CheckboxGroup
      aria-labelledby={mainLabelId}
      value={main}
      onValueChange={(next) => {
        if (next.includes("manage-users")) {
          setManagement(MANAGEMENT);
        } else if (management.length === MANAGEMENT.length) {
          // Only clear the sub-permissions when they were ALL ticked — that is
          // the state "manage-users" was standing for. Unticking it out of a
          // partial selection would silently throw away choices the user made
          // one level down.
          setManagement([]);
        }
        setMain(next);
      }}
      allValues={MAIN}
    >
      <label id={mainLabelId} className={row}>
        {/* The group works out the mixed state from its own three values, but
          * it cannot see the level below, so a partly-filled inner group has
          * to be reported up explicitly. Without this the top checkbox reads
          * as fully unticked while four sub-permissions are granted. */}
        <Checkbox
          parent
          indeterminate={
            management.length > 0 && management.length !== MANAGEMENT.length
          }
        />
        User permissions
      </label>

      <div className={nest}>
        <label className={row}>
          <Checkbox value="view-dashboard" />
          View dashboard
        </label>
        <label className={row}>
          <Checkbox value="access-reports" />
          Access reports
        </label>

        <CheckboxGroup
          aria-labelledby={managementLabelId}
          value={management}
          onValueChange={(next) => {
            setMain((prev) =>
              next.length === MANAGEMENT.length
                ? Array.from(new Set([...prev, "manage-users"]))
                : prev.filter((value) => value !== "manage-users"),
            );
            setManagement(next);
          }}
          allValues={MANAGEMENT}
        >
          {/* No `value`: this checkbox is the inner group's parent, and the
            * "manage-users" entry it stands for lives in the outer group's
            * value. Giving it one would submit the same permission twice. */}
          <label id={managementLabelId} className={row}>
            <Checkbox parent />
            Manage users
          </label>

          <div className={nest}>
            <label className={row}>
              <Checkbox value="create-user" />
              Create user
            </label>
            <label className={row}>
              <Checkbox value="edit-user" />
              Edit user
            </label>
            <label className={row}>
              <Checkbox value="delete-user" />
              Delete user
            </label>
            <label className={row}>
              <Checkbox value="assign-roles" />
              Assign roles
            </label>
          </div>
        </CheckboxGroup>
      </div>
    </CheckboxGroup>
  );
}
