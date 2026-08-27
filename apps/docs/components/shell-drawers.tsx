"use client";

import * as React from "react";
import { Button, Drawer } from "@dofortech/pretty-ui";
import { List, Menu } from "lucide-react";
import { ICON } from "./styles";
import { NavLinks } from "./nav";
import { TocList, goToHeading, useActiveHeading, useTocHeadings } from "./toc";

/**
 * The two shell columns, on a screen that has no room for them.
 *
 * Below `--breakpoint-nav` the page list is gone; below `--breakpoint-toc` the
 * section rail is. Hiding them was the whole answer before this file existed,
 * which meant a phone reader could not move between pages at all without
 * going back to the home page, and could not see the shape of the one they
 * were on. Each column now has a drawer with the SAME list in it — literally
 * the same components, imported from `nav.tsx` and `toc.tsx`, so the two
 * renderings cannot drift.
 *
 * Both triggers live in the header, which is why they are here and not inside
 * `Sidebar` / `Toc`: a button in the header cannot be rendered by a component
 * in the grid below it.
 *
 * ---------------------------------------------------------------------------
 * Where the icons come from
 * ---------------------------------------------------------------------------
 * lucide-react, and it is deliberately a DOCS dependency: the library ships no
 * icon set today, so when it grows one these imports are what changes. The
 * header's GitHub mark is the exception and comes from react-icons — lucide
 * dropped its brand icons, and a brand mark should be the owner's own.
 *
 * The `ICON` class they carry — and the reason `.pui-icon` is not it — is in
 * `styles.ts`, next to the other strings more than one component depends on.
 */

/**
 * Close the drawer when the layout stops needing it.
 *
 * A drawer left open across a resize past its breakpoint covers a page that
 * has just grown the very column the drawer was standing in for — and the
 * trigger that would close it is now `display: none`, so the only way out is
 * Escape.
 *
 * The test is the trigger's own visibility rather than a `matchMedia` on the
 * breakpoint. Restating `820px` here would make this the second place that
 * decides when the rail disappears, and the two would eventually disagree by a
 * pixel; asking the button whether it is still painted asks the CSS that
 * actually hid it. Only armed while the drawer is open, so the resize
 * listener is not a permanent cost.
 */
function useCloseWhenTriggerHides(
  open: boolean,
  trigger: React.RefObject<HTMLButtonElement | null>,
  close: () => void,
) {
  React.useEffect(() => {
    if (!open) return;

    const check = () => {
      const el = trigger.current;
      /* `checkVisibility` where it exists, `offsetParent` as the fallback —
       * null for a `display: none` element, and nothing here is inside a
       * positioned ancestor that would make that answer lie. */
      const visible = el
        ? el.checkVisibility?.() ?? el.offsetParent !== null
        : false;
      if (!visible) close();
    };

    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [open, trigger, close]);
}

/* -------------------------------------------------------------------------
 * Page list
 * ---------------------------------------------------------------------- */

export function NavDrawer() {
  const [open, setOpen] = React.useState(false);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const close = React.useCallback(() => setOpen(false), []);

  useCloseWhenTriggerHides(open, trigger, close);

  return (
    <Drawer.Root side="left" open={open} onOpenChange={setOpen}>
      <Drawer.Trigger
        ref={trigger}
        render={<Button variant="ghost" size="sm" iconOnly />}
        className="hidden max-nav:inline-flex"
        aria-label="Open navigation"
      >
        <Menu className={ICON} aria-hidden="true" />
      </Drawer.Trigger>
      <Drawer.Popup size="sm">
        <Drawer.Content>
          <Drawer.Title>Documentation</Drawer.Title>
          {/* `onNavigate` and not an effect on `pathname`: the drawer has to
            * start closing on the click, while the route transition is still
            * in flight, or it sits over the new page for as long as that
            * takes. Clicking the page you are already on has no transition to
            * wait for at all. */}
          <NavLinks onNavigate={close} />
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Root>
  );
}

/* -------------------------------------------------------------------------
 * Section list
 * ---------------------------------------------------------------------- */

export function TocDrawer() {
  const [open, setOpen] = React.useState(false);
  const trigger = React.useRef<HTMLButtonElement>(null);
  const close = React.useCallback(() => setOpen(false), []);

  const headings = useTocHeadings();
  /* Only while it is open: see `useActiveHeading`. A closed drawer measuring
   * every heading on the page on every scroll frame would be a scroll spy for
   * a list that is not in the DOM. */
  const active = useActiveHeading(headings, open);

  /* The heading the reader just picked, for `finalFocus` below to land on.
   * Everything else about the jump happens on the click. */
  const picked = React.useRef<HTMLElement | null>(null);

  useCloseWhenTriggerHides(open, trigger, close);

  /* Same rule as the rail: one entry is a link to where you already are. With
   * nothing to show, the button is not there to press. */
  if (headings.length < 2) return null;

  return (
    <Drawer.Root side="right" open={open} onOpenChange={setOpen}>
      <Drawer.Trigger
        ref={trigger}
        render={<Button variant="ghost" size="sm" iconOnly />}
        className="hidden max-toc:inline-flex"
        aria-label="On this page"
      >
        <List className={ICON} aria-hidden="true" />
      </Drawer.Trigger>
      <Drawer.Popup
        size="sm"
        /* Where focus goes when the drawer closes. Base UI's default — back to
         * the trigger — is right for every close except this one: a reader who
         * picked a section should end up AT that section, not back on the
         * button they opened the list with. `true` asks for the default, which
         * is what every other close gets. */
        finalFocus={() => picked.current ?? true}
      >
        <Drawer.Content>
          <Drawer.Title>On this page</Drawer.Title>
          <TocList
            headings={headings}
            active={active}
            /* The URL and the scroll happen now; only the focus waits, and it
             * waits by being named above rather than by being deferred here.
             * That split is what keeps the jump working even if the closing
             * transition never finishes — a backgrounded tab, or a reader who
             * reopens the drawer mid-close. */
            onSelect={(target) => {
              picked.current = target;
              goToHeading(target, { focus: false });
              close();
            }}
          />
        </Drawer.Content>
      </Drawer.Popup>
    </Drawer.Root>
  );
}
