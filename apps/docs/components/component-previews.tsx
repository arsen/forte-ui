"use client";

import * as React from "react";
import type { CSSProperties } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Archive,
  Bold,
  Italic,
  Menu as MenuIcon,
  MousePointer2,
  Search,
  Star,
  Underline,
} from "lucide-react";
import {
  Accordion,
  Alert,
  AppBar,
  AspectRatio,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Calendar,
  Card,
  Carousel,
  Checkbox,
  CheckboxGroup,
  Collapsible,
  ColorPicker,
  Combobox,
  DatePicker,
  Dialog,
  Drawer,
  Field,
  Fieldset,
  Form,
  Input,
  InputGroup,
  Kbd,
  KbdGroup,
  Menu,
  Menubar,
  NavigationMenu,
  NavList,
  NumberField,
  OTPField,
  Pagination,
  Popover,
  PreviewCard,
  Progress,
  ProgressCircle,
  Radio,
  RadioGroup,
  Resizable,
  ScrollArea,
  Select,
  Separator,
  Shimmer,
  Skeleton,
  Slider,
  Spinner,
  Steps,
  Switch,
  Table,
  Tabs,
  Textarea,
  ThemeToggle,
  Toast,
  Toggle,
  ToggleGroup,
  Toolbar,
  Tooltip,
  useToast,
} from "@forte-ui/react";
import type { ComponentName } from "./component-catalog";
import { cn } from "@/lib/cn";
import { ICON } from "./styles";

/**
 * The picture on every card in the component index: the component itself,
 * rendered small, in the state that says most about it — a Switch that is
 * on, a Menu that is open, a Progress bar part way along.
 *
 * ---------------------------------------------------------------------------
 * It is the real component, and it is inert
 * ---------------------------------------------------------------------------
 * These are not screenshots or mimics built out of Card parts. A real Button
 * follows the seed, the radius preset, the density preset and the next
 * restyle without anyone touching this file; a picture of one is stale the
 * day the ramp changes. What makes that possible is the stage: `inert` takes
 * the whole subtree out of the tab order, out of the accessibility tree and
 * out of hit-testing, so sixty interactive components on one page add no tab
 * stops, no pointer targets and nothing for a screen reader to wade through.
 * The card's link is the one interactive thing, and it stretches over the
 * stage — which also means the stage cannot sit INSIDE that link, the way the
 * home page's entry cards nest their content: Breadcrumb, Pagination and
 * NavList all render anchors, and an `<a>` inside an `<a>` is closed early
 * by the HTML parser, breaking hydration. See `component-index.tsx`.
 *
 * ---------------------------------------------------------------------------
 * Two rules for anything that opens
 * ---------------------------------------------------------------------------
 * A popup that is simply mounted open is a popup with side effects on the
 * PAGE: a modal locks body scroll and marks everything outside itself
 * `aria-hidden`, and a portal lands in `<body>` and floats over the index.
 * So every open surface here is non-modal — `modal={false}`, or a `Menu`
 * standing in for `ContextMenu`, whose root is modal by definition — and
 * every one portals into the `Scene` under its own stage. The stage carries
 * `contain: paint`, which makes it the containing block for `position:
 * fixed` descendants, so a Dialog's full-screen viewport and scrim fill the
 * card's thumbnail instead of the screen. A portal cannot render on the
 * server, so those surfaces appear a frame after hydration, entering on
 * their own transition; the trigger beside them is in the HTML.
 *
 * And a list with a SELECTED item must not open until its card is on screen.
 * Base UI's list navigation calls `scrollIntoView({ block: "nearest" })` on
 * the selected item when the popup opens, and `inert` stops focus, not
 * scrolling: the call walks every scroll container up to the document, so
 * a Select mounted open below the fold scrolled the whole page down to its
 * own card on every load — smoothly, because the site scrolls smoothly, so
 * it read as the page drifting to the middle on its own. `useInView` holds
 * `open` until the stage is fully visible, when "nearest" is where the item
 * already is. The Combobox needs no such guard only because nothing in it
 * is selected; give it a value and it will.
 *
 * ---------------------------------------------------------------------------
 * The map is exhaustive, and typecheck says so
 * ---------------------------------------------------------------------------
 * `PREVIEWS` is a `Record` over the generated `ComponentName` union, so a
 * component added to the library gets a "property is missing" error here
 * until it has a preview — the same gate `build-catalog.mjs` applies to
 * pages, one file over. Write a few lines, not a demo: the card's title says
 * what it is, and the reader has the page one click away.
 */

/* The stage: a fixed frame, so every card on the page is the same height
 * whether it holds a Kbd or a Calendar. 11rem is the smallest height at
 * which a trigger pinned to the top and three menu items under it both fit
 * — at 10rem the Select's last item was cut in half. Padding keeps a popup's
 * shadow off the card's edge; `overflow-hidden` is redundant with
 * `contain-paint` and stays for the reader. `text-2` is the base size the
 * labels below inherit — the components carry their own. */
const STAGE =
  "relative flex h-44 items-center justify-center gap-3 overflow-hidden bg-background px-5 py-4 text-2 text-foreground select-none contain-paint";

/** A one-line label beside a control, the way `Field.Label` lays one out. */
const LABEL = "flex items-center gap-2 text-2";

export function ComponentPreview({ name }: { name: ComponentName }) {
  const Preview = PREVIEWS[name];
  return (
    // `aria-hidden` restates what `inert` already means, for engines that
    // took the attribute's focus half before its accessibility half.
    <div inert aria-hidden="true" className={STAGE}>
      <Preview />
    </div>
  );
}

/**
 * The portal target for a preview that opens something.
 *
 * `children` is a render function because the target has to be a mounted
 * element before a portal can point at it: the popup renders only once
 * `portal` is non-null, which is also what keeps Base UI from falling back
 * to `<body>` for the one render before the ref lands. The target is
 * `absolute inset-0` so an anchored popup's `position: absolute` resolves
 * against the stage, and it sits AFTER the trigger in the DOM so the popup
 * paints over it.
 */
function Scene({ children }: { children: (portal: HTMLDivElement | null) => React.ReactNode }) {
  const [portal, setPortal] = React.useState<HTMLDivElement | null>(null);
  return (
    <>
      {children(portal)}
      <div ref={setPortal} className="absolute inset-0" />
    </>
  );
}

/**
 * For a preview taller than the stage — a Calendar, a Table. It is pinned to
 * the top and fades out toward the bottom rather than being cut off: a hard
 * clip reads as a layout bug, a fade reads as "there is more".
 */
function Peek({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex h-full w-full items-start justify-center overflow-hidden mask-b-from-45%", className)}>
      {children}
    </div>
  );
}

/**
 * True once `el` has been fully inside the viewport, and from then on.
 *
 * For a popup whose opening scrolls its selected item into view — see the
 * header. Nearly all of it rather than any intersection: at the edge of the
 * viewport "nearest" still means a nudge, and a page that nudges itself
 * while the reader scrolls is the same bug at a smaller size. Not exactly
 * 1, though: a card at a fractional pixel offset reports a ratio of 0.998
 * when it is entirely on screen, and a threshold of 1 then never fires. At
 * 0.95 the most that can be cut off is nine pixels of a stage whose items
 * start fifty pixels down, so the item is still in view when the list
 * opens and the document has nothing to do.
 */
function useInView(el: Element | null) {
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    if (!el || inView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true);
      },
      { threshold: 0.95 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [el, inView]);
  return inView;
}

/* A fixed day, so the server and the browser render the same month and no
 * cell is "today" — that attribute is set from the clock on each side, and
 * a mismatch fails hydration. Built from parts rather than an ISO string so
 * both sides read it in local time. */
const PICKED = new Date(2026, 2, 14);

const ZONES = { pst: "Pacific", est: "Eastern", gmt: "GMT" };
const FRUITS = ["Apple", "Banana", "Cherry"];

function RaisedToast() {
  // `success` is one of the memoised methods, stable across renders; the
  // object `useToast` returns is not, because it carries `toasts`.
  const { success } = useToast();
  React.useEffect(() => {
    const handle = success("Profile saved", {
      description: "The change is live everywhere.",
      timeout: 0,
    });
    return () => handle.close();
  }, [success]);
  return null;
}

/**
 * The Select, opened only once its card is in view — the header says why.
 * A component of its own because the guard is a hook, and the map's entries
 * are components already: this is the one that needs state.
 */
function SelectScene({ portal }: { portal: HTMLDivElement | null }) {
  const open = useInView(portal);
  return (
    // `modal={false}` is not optional: Base UI's Select, like its Menu, is
    // modal by default, and one open on mount locked the page's scroll and
    // marked everything outside itself `aria-hidden` — the whole index, for
    // a screen reader, was one listbox. `alignItemWithTrigger={false}` for
    // the same reason one level down: that mode holds its own scroll lock.
    <Select.Root items={ZONES} defaultValue="gmt" open={open} modal={false}>
      <Select.Trigger aria-label="Time zone" size="sm" className="self-start">
        <Select.Value />
        <Select.Icon />
      </Select.Trigger>
      {portal && (
        <Select.Popup container={portal} alignItemWithTrigger={false}>
          {Object.entries(ZONES).map(([value, label]) => (
            <Select.Item key={value} value={value}>
              {label}
            </Select.Item>
          ))}
        </Select.Popup>
      )}
    </Select.Root>
  );
}

function Pane({ title }: { title: string }) {
  return (
    <div className="flex h-full items-center justify-center text-1 font-medium text-foreground-muted uppercase tracking-[0.06em]">
      {title}
    </div>
  );
}

const PREVIEWS: Record<ComponentName, React.ComponentType> = {
  /* Actions ------------------------------------------------------------- */

  // The default tone is neutral, so the call to action says `primary` itself
  // — the picture is the pair, one found and one ordinary.
  Button: () => (
    <>
      <Button tone="primary">Save changes</Button>
      <Button variant="outline">Cancel</Button>
    </>
  ),

  ButtonGroup: () => (
    <ButtonGroup.Root aria-label="Range">
      <Button variant="outline">Day</Button>
      <Button variant="outline">Week</Button>
      <Button variant="outline">Month</Button>
    </ButtonGroup.Root>
  ),

  ThemeToggle: () => <ThemeToggle variant="outline" size="lg" />,

  Toggle: () => (
    <>
      <Toggle defaultPressed>Show archived</Toggle>
      <Toggle iconOnly aria-label="Favorite">
        <Star className={ICON} />
      </Toggle>
    </>
  ),

  ToggleGroup: () => (
    <ToggleGroup aria-label="Text alignment" defaultValue={["left"]}>
      <Toggle iconOnly value="left" aria-label="Align left">
        <AlignLeft className={ICON} />
      </Toggle>
      <Toggle iconOnly value="center" aria-label="Align center">
        <AlignCenter className={ICON} />
      </Toggle>
      <Toggle iconOnly value="right" aria-label="Align right">
        <AlignRight className={ICON} />
      </Toggle>
    </ToggleGroup>
  ),

  Toolbar: () => (
    <Toolbar.Root aria-label="Formatting" size="sm">
      <ToggleGroup aria-label="Text style" multiple defaultValue={["bold"]}>
        <Toggle iconOnly value="bold" aria-label="Bold">
          <Bold className={ICON} />
        </Toggle>
        <Toggle iconOnly value="italic" aria-label="Italic">
          <Italic className={ICON} />
        </Toggle>
        <Toggle iconOnly value="underline" aria-label="Underline">
          <Underline className={ICON} />
        </Toggle>
      </ToggleGroup>
      <Toolbar.Separator />
      <Toolbar.Button variant="solid" tone="primary">
        Publish
      </Toolbar.Button>
    </Toolbar.Root>
  ),

  /* Forms --------------------------------------------------------------- */

  Calendar: () => (
    <Peek>
      <Calendar mode="single" selected={PICKED} defaultMonth={PICKED} size="sm" locale="en-US" />
    </Peek>
  ),

  Checkbox: () => (
    <div className="grid gap-2">
      <label className={LABEL}>
        <Checkbox defaultChecked />
        Email me when a build fails
      </label>
      <label className={LABEL}>
        <Checkbox indeterminate />
        Select all
      </label>
    </div>
  ),

  CheckboxGroup: () => (
    <CheckboxGroup aria-label="Repository access" defaultValue={["read"]} allValues={["read", "write"]}>
      <label className={LABEL}>
        <Checkbox parent />
        Repository access
      </label>
      <div className="ms-6 grid gap-2">
        <label className={LABEL}>
          <Checkbox value="read" />
          Read
        </label>
        <label className={LABEL}>
          <Checkbox value="write" />
          Write
        </label>
      </div>
    </CheckboxGroup>
  ),

  ColorPicker: () => (
    <ColorPicker.Root defaultValue="oklch(0.72 0.19 55)">
      <ColorPicker.Panel
        style={
          {
            "--forte-color-picker-width": "11rem",
            "--forte-color-picker-area-height": "4.5rem",
          } as CSSProperties
        }
      >
        <ColorPicker.Area />
        <ColorPicker.HueSlider />
      </ColorPicker.Panel>
    </ColorPicker.Root>
  ),

  Combobox: () => (
    <Scene>
      {(portal) => (
        <Combobox.Root items={FRUITS} open>
          <Combobox.InputGroup size="sm" className="w-44 self-start">
            <Combobox.Input placeholder="Search fruit…" aria-label="Fruit" />
            <Combobox.Trigger aria-label="Open popup" />
          </Combobox.InputGroup>
          {portal && (
            <Combobox.Popup container={portal}>
              <Combobox.List>
                {(fruit: string) => (
                  <Combobox.Item key={fruit} value={fruit}>
                    {fruit}
                  </Combobox.Item>
                )}
              </Combobox.List>
            </Combobox.Popup>
          )}
        </Combobox.Root>
      )}
    </Scene>
  ),

  DatePicker: () => (
    <DatePicker.Root selected={PICKED} locale="en-US">
      <DatePicker.Trigger aria-label="Due date" className="w-44">
        <DatePicker.Value placeholder="Pick a date" />
        <DatePicker.Icon />
      </DatePicker.Trigger>
    </DatePicker.Root>
  ),

  Field: () => (
    <Field.Root name="email" className="w-full">
      <Field.Label>Email</Field.Label>
      <Input type="email" placeholder="you@example.com" />
      <Field.Description>We only use this for receipts.</Field.Description>
    </Field.Root>
  ),

  Fieldset: () => (
    <Fieldset.Root className="w-full">
      <Fieldset.Legend>Shipping address</Fieldset.Legend>
      <div className="flex gap-3">
        <Field.Root name="city">
          <Field.Label>City</Field.Label>
          <Input size="sm" placeholder="Paris" />
        </Field.Root>
        <Field.Root name="postcode" className="w-20 flex-none">
          <Field.Label>Postcode</Field.Label>
          <Input size="sm" placeholder="75001" />
        </Field.Root>
      </div>
    </Fieldset.Root>
  ),

  Form: () => (
    <Form className="w-full">
      <Field.Root name="workspace">
        <Field.Label>Workspace name</Field.Label>
        <Input placeholder="acme" />
      </Field.Root>
      <Button type="submit" tone="primary" size="sm" className="self-start">
        Create workspace
      </Button>
    </Form>
  ),

  Input: () => <Input defaultValue="acme-website" aria-label="Project name" className="w-48" />,

  InputGroup: () => (
    <InputGroup.Root className="w-full">
      <InputGroup.Addon>
        <Search aria-hidden="true" />
      </InputGroup.Addon>
      <InputGroup.Input placeholder="Search the docs…" aria-label="Search" />
      <InputGroup.Addon align="inline-end">
        <InputGroup.Text aria-hidden="true">⌘K</InputGroup.Text>
      </InputGroup.Addon>
    </InputGroup.Root>
  ),

  NumberField: () => (
    <NumberField.Root defaultValue={12} min={1} max={99} aria-label="Quantity">
      <NumberField.Group>
        <NumberField.Decrement />
        <NumberField.Input />
        <NumberField.Increment />
      </NumberField.Group>
    </NumberField.Root>
  ),

  OTPField: () => <OTPField.Root length={6} defaultValue="4417" size="sm" aria-label="Verification code" />,

  Radio: () => (
    <RadioGroup defaultValue="fra" aria-label="Primary region">
      <label className={LABEL}>
        <Radio value="iad" />
        Washington, D.C.
      </label>
      <label className={LABEL}>
        <Radio value="fra" />
        Frankfurt
      </label>
      <label className={LABEL}>
        <Radio value="syd" />
        Sydney
      </label>
    </RadioGroup>
  ),

  RadioGroup: () => (
    <RadioGroup defaultValue="md" orientation="horizontal" aria-label="Size">
      <label className={LABEL}>
        <Radio value="sm" />
        Small
      </label>
      <label className={LABEL}>
        <Radio value="md" />
        Medium
      </label>
      <label className={LABEL}>
        <Radio value="lg" />
        Large
      </label>
    </RadioGroup>
  ),

  Select: () => <Scene>{(portal) => <SelectScene portal={portal} />}</Scene>,

  Slider: () => (
    <Slider.Root defaultValue={40} className="w-44">
      <Slider.Control>
        <Slider.Track>
          <Slider.Indicator />
          <Slider.Thumb aria-label="Volume" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  ),

  Switch: () => (
    <div className="grid gap-3">
      <label className={LABEL}>
        <Switch defaultChecked />
        Email notifications
      </label>
      <label className={LABEL}>
        <Switch />
        Public profile
      </label>
    </div>
  ),

  Textarea: () => (
    <Textarea
      rows={3}
      defaultValue={"Fixed the focus ring inside scroll containers.\nAdded the drawer's swipe area."}
      aria-label="Release notes"
      className="w-full"
    />
  ),

  /* Overlays ------------------------------------------------------------ */

  // A Dialog with the alert's content: `AlertDialog.Root` is modal by
  // definition — it drops the prop — and a modal open on mount locks the
  // page's scroll. The two share every part and every pixel; what differs
  // is behavior, which an inert preview cannot show anyway.
  AlertDialog: () => (
    <Scene>
      {(portal) =>
        portal && (
          <Dialog.Root open modal={false}>
            <Dialog.Popup container={portal} size="sm">
              <Dialog.Title>Delete project?</Dialog.Title>
              <Dialog.Description>This cannot be undone.</Dialog.Description>
              <Dialog.Footer align="between">
                <Button size="sm" variant="soft">
                  Keep
                </Button>
                <Button size="sm" tone="danger">
                  Delete
                </Button>
              </Dialog.Footer>
            </Dialog.Popup>
          </Dialog.Root>
        )
      }
    </Scene>
  ),

  // A `Menu` anchored to a drawn pointer, because `ContextMenu.Root` is
  // always modal (see AlertDialog). The popup is the same surface with the
  // same items; only the trigger differs, and the trigger is the picture.
  ContextMenu: function ContextMenuPreview() {
    const pointer = React.useRef<SVGSVGElement>(null);
    return (
      <Scene>
        {(portal) => (
          // No "right click here" label: the menu opens over the region and
          // covered it. A dashed region with a pointer in it is the picture.
          <div className="relative aspect-5/3 w-40 rounded-surface border border-dashed border-border-strong bg-panel">
            <MousePointer2
              ref={pointer}
              className="absolute top-[40%] left-[30%] size-4 fill-foreground text-foreground"
            />
            <Menu.Root open modal={false}>
              {portal && (
                <Menu.Popup container={portal} anchor={pointer} side="right" align="start">
                  <Menu.Item>Add to library</Menu.Item>
                  <Menu.Item>Play next</Menu.Item>
                  <Menu.Separator />
                  <Menu.Item tone="danger">Remove</Menu.Item>
                </Menu.Popup>
              )}
            </Menu.Root>
          </div>
        )}
      </Scene>
    );
  },

  Dialog: () => (
    <Scene>
      {(portal) =>
        portal && (
          <Dialog.Root open modal={false}>
            <Dialog.Popup container={portal} size="sm">
              <Dialog.Title>Edit profile</Dialog.Title>
              <Dialog.Description>Visible to everyone in the workspace.</Dialog.Description>
              <Dialog.Footer>
                <Button size="sm" variant="soft">
                  Cancel
                </Button>
                <Button size="sm" tone="primary">
                  Save
                </Button>
              </Dialog.Footer>
            </Dialog.Popup>
          </Dialog.Root>
        )
      }
    </Scene>
  ),

  Drawer: () => (
    <Scene>
      {(portal) =>
        portal && (
          <Drawer.Root open modal={false} side="right" disablePointerDismissal>
            <Drawer.Popup
              container={portal}
              size="sm"
              // The `sm` width is wider than the stage; a drawer that fills
              // its viewport is a page, not a drawer.
              style={{ "--forte-drawer-size": "62%" } as CSSProperties}
            >
              <Drawer.Content>
                <Drawer.Title>Filters</Drawer.Title>
                <Drawer.Description>Narrow the list down.</Drawer.Description>
              </Drawer.Content>
            </Drawer.Popup>
          </Drawer.Root>
        )
      }
    </Scene>
  ),

  Menu: () => (
    <Scene>
      {(portal) => (
        <Menu.Root open modal={false}>
          <Menu.Trigger className="self-start">Actions</Menu.Trigger>
          {portal && (
            <Menu.Popup container={portal}>
              <Menu.Item>Duplicate</Menu.Item>
              <Menu.Item>Rename…</Menu.Item>
              <Menu.Separator />
              <Menu.Item tone="danger">Delete</Menu.Item>
            </Menu.Popup>
          )}
        </Menu.Root>
      )}
    </Scene>
  ),

  Menubar: () => (
    <Menubar>
      {["File", "Edit", "View", "Help"].map((label) => (
        <Menu.Root key={label}>
          <Menu.Trigger>{label}</Menu.Trigger>
        </Menu.Root>
      ))}
    </Menubar>
  ),

  Popover: () => (
    <Scene>
      {(portal) => (
        <Popover.Root open>
          <Popover.Trigger render={<Button variant="outline" className="self-start" />}>
            Notifications
          </Popover.Trigger>
          {portal && (
            <Popover.Popup container={portal} size="sm">
              <Popover.Arrow />
              <Popover.Title>Notifications</Popover.Title>
              <Popover.Description>You are all caught up.</Popover.Description>
            </Popover.Popup>
          )}
        </Popover.Root>
      )}
    </Scene>
  ),

  PreviewCard: () => (
    <Scene>
      {(portal) => (
        <p className="m-0 self-start text-2">
          Published in 1843 by{" "}
          <PreviewCard.Root open>
            <PreviewCard.Trigger href="https://en.wikipedia.org/wiki/Ada_Lovelace">
              Ada Lovelace
            </PreviewCard.Trigger>
            {portal && (
              <PreviewCard.Popup container={portal} size="sm">
                <div className="flex items-center gap-3">
                  <Avatar.Root>
                    <Avatar.Image src="/avatars/ada.svg" alt="" />
                    <Avatar.Fallback>AL</Avatar.Fallback>
                  </Avatar.Root>
                  <div className="grid">
                    <span className="font-semibold">Ada Lovelace</span>
                    <span className="text-1 text-foreground-muted">@ada</span>
                  </div>
                </div>
              </PreviewCard.Popup>
            )}
          </PreviewCard.Root>
          .
        </p>
      )}
    </Scene>
  ),

  Toast: () => (
    <Scene>
      {(portal) =>
        portal && (
          <Toast.Provider container={portal} position="bottom-end">
            <RaisedToast />
          </Toast.Provider>
        )
      }
    </Scene>
  ),

  Tooltip: () => (
    <Scene>
      {(portal) => (
        <Tooltip.Root open>
          <Tooltip.Trigger
            aria-label="Archive conversation"
            render={<Button variant="outline" iconOnly />}
          >
            <Archive className={ICON} />
          </Tooltip.Trigger>
          {portal && (
            <Tooltip.Popup container={portal}>
              <Tooltip.Arrow />
              Archive conversation
            </Tooltip.Popup>
          )}
        </Tooltip.Root>
      )}
    </Scene>
  ),

  /* Navigation ---------------------------------------------------------- */

  AppBar: () => (
    <AppBar.Root variant="outline" position="static" size="sm" className="w-full">
      <AppBar.Leading>
        <Button variant="ghost" size="sm" iconOnly aria-label="Open navigation">
          <MenuIcon className={ICON} />
        </Button>
      </AppBar.Leading>
      <AppBar.Title>Inbox</AppBar.Title>
      <AppBar.Trailing>
        <Button variant="ghost" size="sm" iconOnly aria-label="Search">
          <Search className={ICON} />
        </Button>
        <Avatar.Root size="xs">
          <Avatar.Image src="/avatars/ada.svg" alt="" />
          <Avatar.Fallback>AL</Avatar.Fallback>
        </Avatar.Root>
      </AppBar.Trailing>
    </AppBar.Root>
  ),

  Breadcrumb: () => (
    <Breadcrumb.Root size="sm">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="#">Projects</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Breadcrumb.Page>Orbit</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  ),

  NavigationMenu: () => (
    <NavigationMenu.Root aria-label="Site">
      <NavigationMenu.List>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Products</NavigationMenu.Trigger>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Trigger>Docs</NavigationMenu.Trigger>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link variant="plain" href="#">
            Pricing
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu.List>
    </NavigationMenu.Root>
  ),

  NavList: () => (
    <NavList.Root aria-label="Guides" size="sm" className="w-40">
      <NavList.Section>
        <NavList.SectionLabel>Getting started</NavList.SectionLabel>
        <NavList.List>
          <NavList.Item>
            <NavList.Link href="#">Installation</NavList.Link>
          </NavList.Item>
          <NavList.Item>
            <NavList.Link href="#" active>
              Project structure
            </NavList.Link>
          </NavList.Item>
          <NavList.Item>
            <NavList.Link href="#">Routing</NavList.Link>
          </NavList.Item>
        </NavList.List>
      </NavList.Section>
    </NavList.Root>
  ),

  Pagination: () => (
    <Pagination.Root size="sm">
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Previous href="#" iconOnly />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link href="#">1</Pagination.Link>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link href="#" current>
            2
          </Pagination.Link>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link href="#">3</Pagination.Link>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Ellipsis />
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Link href="#">8</Pagination.Link>
        </Pagination.Item>
        <Pagination.Item>
          <Pagination.Next href="#" iconOnly />
        </Pagination.Item>
      </Pagination.List>
    </Pagination.Root>
  ),

  Steps: () => (
    <Steps.Root current={1} size="sm" labelPlacement="below" className="w-full">
      <Steps.Item>
        <Steps.Indicator />
        <Steps.Title>Account</Steps.Title>
      </Steps.Item>
      <Steps.Item>
        <Steps.Indicator />
        <Steps.Title>Address</Steps.Title>
      </Steps.Item>
      <Steps.Item>
        <Steps.Indicator />
        <Steps.Title>Review</Steps.Title>
      </Steps.Item>
    </Steps.Root>
  ),

  Tabs: () => (
    <Tabs.Root defaultValue="overview" className="w-full">
      <Tabs.List aria-label="Project sections">
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="deploys">Deploys</Tabs.Tab>
        <Tabs.Tab value="access">Access</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="overview">Deployed 4 minutes ago from main.</Tabs.Panel>
    </Tabs.Root>
  ),

  /* Content & layout ---------------------------------------------------- */

  Accordion: () => (
    <Accordion.Root defaultValue={["shipping"]} className="w-full">
      <Accordion.Item value="shipping">
        <Accordion.Header>
          <Accordion.Trigger>When will my order ship?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Orders placed before 14:00 leave the same day.</Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="returns">
        <Accordion.Header>
          <Accordion.Trigger>Can I return something?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Panel>Within 30 days, with the receipt.</Accordion.Panel>
      </Accordion.Item>
    </Accordion.Root>
  ),

  Alert: () => (
    <Alert.Root tone="success" className="w-full">
      <Alert.Icon />
      <Alert.Title>Account updated</Alert.Title>
      <Alert.Description>The change is live everywhere.</Alert.Description>
    </Alert.Root>
  ),

  AspectRatio: () => (
    <div className="w-44">
      <AspectRatio ratio="video" variant="filled">
        <img src="/media/harbour.svg" alt="" />
      </AspectRatio>
    </div>
  ),

  Avatar: () => (
    <>
      <Avatar.Group>
        <Avatar.Root>
          <Avatar.Image src="/avatars/ada.svg" alt="" />
          <Avatar.Fallback>AL</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root>
          <Avatar.Image src="/avatars/bea.svg" alt="" />
          <Avatar.Fallback>BR</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root>
          <Avatar.Image src="/avatars/cyrus.svg" alt="" />
          <Avatar.Fallback>CB</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root tone="primary" variant="solid">
          <Avatar.Fallback>+3</Avatar.Fallback>
        </Avatar.Root>
      </Avatar.Group>
      <Avatar.Root>
        <Avatar.Image src="/avatars/dara.svg" alt="" />
        <Avatar.Fallback>DO</Avatar.Fallback>
        <Avatar.Badge tone="success" />
      </Avatar.Root>
    </>
  ),

  Badge: () => (
    <>
      <Badge>Beta</Badge>
      <Badge tone="success" dot>
        Active
      </Badge>
      <Badge tone="neutral" variant="outline">
        Draft
      </Badge>
      <Badge tone="danger" variant="solid" shape="pill" count={12} />
    </>
  ),

  Card: () => (
    <Card.Root className="w-full">
      <Card.Header>
        <Card.Title>Weekly digest</Card.Title>
        <Card.Description>Every Monday morning.</Card.Description>
      </Card.Header>
      <Card.Content>Twelve issues closed, three opened.</Card.Content>
    </Card.Root>
  ),

  Carousel: () => (
    <Carousel.Root aria-label="Slides" className="w-44">
      <Carousel.Viewport>
        <Carousel.Track>
          {["Strategy", "Timeline", "Budget"].map((title) => (
            <Carousel.Slide key={title}>
              <div className="flex h-16 items-center justify-center rounded-surface bg-primary-soft text-3 font-semibold text-primary-text">
                {title}
              </div>
            </Carousel.Slide>
          ))}
        </Carousel.Track>
        <Carousel.Prev />
        <Carousel.Next />
      </Carousel.Viewport>
      <Carousel.Dots />
    </Carousel.Root>
  ),

  Collapsible: () => (
    <Collapsible.Root defaultOpen className="w-full">
      <Collapsible.Trigger>What is in the file?</Collapsible.Trigger>
      <Collapsible.Panel>One record per project, as newline-delimited JSON.</Collapsible.Panel>
    </Collapsible.Root>
  ),

  Kbd: () => (
    <>
      <Kbd>⌘K</Kbd>
      <Kbd>Esc</Kbd>
      <Kbd>⏎</Kbd>
    </>
  ),

  KbdGroup: () => (
    <KbdGroup>
      <Kbd>⌘</Kbd>
      <Kbd>⇧</Kbd>
      <Kbd>P</Kbd>
    </KbdGroup>
  ),

  Resizable: () => (
    <Resizable.Group
      orientation="horizontal"
      className="h-24 w-full overflow-hidden rounded-surface border border-border-muted"
    >
      <Resizable.Panel defaultSize={35} minSize={15}>
        <Pane title="Sidebar" />
      </Resizable.Panel>
      <Resizable.Handle grip />
      <Resizable.Panel>
        <Pane title="Content" />
      </Resizable.Panel>
    </Resizable.Group>
  ),

  ScrollArea: () => (
    <ScrollArea.Root
      orientation="vertical"
      scrollbarVisibility="always"
      className="max-h-24 w-44 rounded-surface border border-border-muted"
    >
      <ScrollArea.Viewport aria-label="Release notes">
        <ScrollArea.Content className="grid gap-2 p-3 pe-5">
          {["4.2.0", "4.1.3", "4.1.2", "4.1.1", "4.1.0", "4.0.4"].map((version) => (
            <div key={version}>
              <span className="font-medium">{version}</span>{" "}
              <span className="text-foreground-muted">Release notes</span>
            </div>
          ))}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar orientation="vertical">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  ),

  Separator: () => (
    <div className="grid w-44 gap-3">
      <div>
        <div className="font-medium">Billing</div>
        <div className="text-1 text-foreground-muted">Visa ending 4242</div>
      </div>
      <Separator />
      <div>
        <div className="font-medium">Notifications</div>
        <div className="text-1 text-foreground-muted">Email only</div>
      </div>
    </div>
  ),

  Table: () => (
    <Peek>
      <Table.Root size="sm" className="w-full">
        <Table.Header>
          <Table.Row>
            <Table.Head>Invoice</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head numeric>Amount</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {[
            ["INV-2041", "Paid", "success", "$1,250.00"],
            ["INV-2040", "Due", "warning", "$840.00"],
            ["INV-2039", "Failed", "danger", "$2,100.00"],
          ].map(([id, status, tone, amount]) => (
            <Table.Row key={id}>
              <Table.Cell className="font-mono text-1">{id}</Table.Cell>
              <Table.Cell>
                <Badge tone={tone as "success" | "warning" | "danger"} size="sm" dot>
                  {status}
                </Badge>
              </Table.Cell>
              <Table.Cell numeric>{amount}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Peek>
  ),

  /* Feedback ------------------------------------------------------------ */

  Progress: () => (
    <Progress.Root value={62} className="w-44">
      <Progress.Label>Uploading footage</Progress.Label>
      <Progress.Value />
      <Progress.Track>
        <Progress.Indicator />
      </Progress.Track>
    </Progress.Root>
  ),

  ProgressCircle: () => (
    <>
      <ProgressCircle.Root value={24}>
        <ProgressCircle.Track>
          <ProgressCircle.Indicator />
        </ProgressCircle.Track>
        <ProgressCircle.Value />
      </ProgressCircle.Root>
      <ProgressCircle.Root value={68} tone="secondary">
        <ProgressCircle.Track>
          <ProgressCircle.Indicator />
        </ProgressCircle.Track>
        <ProgressCircle.Value />
      </ProgressCircle.Root>
    </>
  ),

  Shimmer: () => (
    <Shimmer className="text-3 font-medium text-foreground-muted">Generating response…</Shimmer>
  ),

  Skeleton: () => (
    <div className="flex w-44 items-center gap-3">
      <Skeleton.Root variant="circle" width="2.5rem" />
      <Skeleton.Text lines={2} className="flex-1" />
    </div>
  ),

  Spinner: () => (
    <>
      <Spinner variant="ring" decorative />
      <Spinner variant="dots" decorative />
      <Spinner variant="bars" decorative />
    </>
  ),
};
