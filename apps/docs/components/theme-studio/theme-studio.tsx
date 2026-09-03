"use client";

import * as React from "react";
import {
  Accordion,
  Alert,
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Card,
  Checkbox,
  CheckboxGroup,
  Combobox,
  DatePicker,
  Dialog,
  Field,
  Input,
  Kbd,
  KbdGroup,
  Menu,
  NumberField,
  Pagination,
  Popover,
  Progress,
  ProgressCircle,
  Radio,
  RadioGroup,
  Select,
  Slider,
  Spinner,
  Switch,
  Table,
  Tabs,
  Toggle,
  ToggleGroup,
  Tooltip,
  usePaginationRange,
} from "@forte-ui/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Archive,
  Bell,
  Clock,
  Copy,
  Flag,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { SANS_FONTS, MONO_FONTS, findFont, type FontOption } from "./fonts";
import { hexToOklch, bestOnColor } from "@/lib/color";
import { EYEBROW, HEADING, ICON } from "@/components/styles";
import { cn } from "@/lib/cn";
import { ThemeConfigurator } from "./theme-configurator";
import { configToAttrs, useThemeConfig, type ThemeConfig } from "./theme-config";

/* The Theme Studio PAGE: the configurator beside a live preview and the CSS
 * the theme exports. The controls themselves live in `theme-configurator.tsx`
 * — the header's theme drawer renders the same component on every page — and
 * the state behind them in `theme-config.ts`, so this file only reads the
 * config: everything it renders is derived, and every edit arrives through
 * the shared store whichever mount it was made in.
 *
 * The preview is a column of the library's own `Card`s, one per subject —
 * palette, the exported CSS, type, buttons, and then a card per family of
 * components. Cards rather than one big frame because the point of the page
 * is to show a theme applied to REAL surfaces: a card's fill, hairline and
 * radius are three of the things the configurator changes, and a bespoke
 * preview box would be showing them on markup nobody ships. */

const RAMP = "grid h-[2.25rem] grid-cols-12 gap-[2px] overflow-hidden rounded-3";

/* A caption over a row of specimens inside a card. The eyebrow is already the
 * studio's label style; the fixed width is what lines the rows up into a
 * table without drawing one. */
const ROW = "grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3";
const ROW_LABEL = cn(EYEBROW, "m-0 leading-normal");

function toCss(cfg: ThemeConfig) {
  const seedO = hexToOklch(cfg.seed);
  const secO = hexToOklch(cfg.secondary);
  const on = seedO ? bestOnColor(seedO) : null;
  const onSec = secO ? bestOnColor(secO) : null;
  const sans = findFont(SANS_FONTS, cfg.fontSans);
  const mono = findFont(MONO_FONTS, cfg.fontMono);

  const attrs = [
    cfg.radius !== "default" && `data-forte-radius="${cfg.radius}"`,
    cfg.density !== "default" && `data-forte-density="${cfg.density}"`,
    cfg.motion !== "default" && `data-forte-motion="${cfg.motion}"`,
    cfg.scheme !== "system" && `data-theme="${cfg.scheme}"`,
  ].filter(Boolean);

  /* @import must precede every other statement in a stylesheet, so the font
   * loads lead the block. Google Fonts is the preview's host, not a
   * requirement — the comment says so because the copied CSS is the one part
   * of the studio that leaves the site. */
  const imports = [sans, mono]
    .filter((f) => f.css)
    .map((f) => `@import url("${f.css}");`);

  const lines = [
    ...(imports.length ? [`/* Or self-host these — any @font-face works. */`, ...imports, ``] : []),
    `:root {`,
    `  --forte-accent-seed: ${cfg.seed};`,
    `  --forte-secondary-seed: ${cfg.secondary};`,
    cfg.tint !== 1 ? `  --forte-neutral-tint: ${cfg.tint};` : null,
    sans.stack ? `  --forte-font-sans: ${sans.stack};` : null,
    mono.stack ? `  --forte-font-mono: ${mono.stack};` : null,
    ``,
    `  /* Measured rather than derived, so it is exact in every browser. */`,
    on ? `  --forte-color-on-primary: ${on.color};` : null,
    onSec ? `  --forte-color-on-secondary: ${onSec.color};` : null,
    `}`,
  ].filter((l) => l !== null);

  const html = attrs.length ? `\n\n<!-- on <html> -->\n<html ${attrs.join(" ")}>` : "";
  return lines.join("\n") + html;
}

export function ThemeStudio() {
  const [cfg] = useThemeConfig();
  const [copied, setCopied] = React.useState(false);

  const attrs = React.useMemo(() => configToAttrs(cfg), [cfg]);
  const sans = findFont(SANS_FONTS, cfg.fontSans);
  const mono = findFont(MONO_FONTS, cfg.fontMono);

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const css = toCss(cfg);

  return (
    <div className="grid grid-cols-[19rem_minmax(0,1fr)] items-start gap-5 max-two-col:grid-cols-[minmax(0,1fr)]">
      {/* One scroll, the page's own. The panel used to be sticky, which meant
        * capping its height and giving it `overflow-y: auto` — and a column of
        * controls that scrolls inside a page that also scrolls is a control
        * surface you have to aim at before you can move it. Taller than the
        * viewport is fine; it just scrolls with everything else. */}
      <ThemeConfigurator className="rounded-surface border border-border-muted bg-panel p-5" />

      {/* The preview carries the config on its own scope as well — redundant
        * while every edit also lands on <html>, but it is what keeps this
        * column honest as A PREVIEW: it shows the config it was handed, not
        * whatever happens to be on the document. The scope is the column,
        * not each card, so the gaps between cards are the page and only the
        * surfaces change — which is how a themed app actually looks.
        *
        * A container query rather than a viewport one for the two-up layout:
        * the column's width depends on the sidebar, the section rail AND the
        * configurator, so no viewport breakpoint says whether two cards fit
        * side by side. `@container` needs an ancestor, hence the wrapper. */}
      <div
        className="@container min-w-0 text-foreground forte-theme"
        style={attrs.style}
        data-forte-radius={attrs["data-forte-radius"]}
        data-forte-density={attrs["data-forte-density"]}
        data-forte-motion={attrs["data-forte-motion"]}
        data-theme={attrs["data-theme"]}
      >
        <div className="grid gap-4 @3xl:grid-cols-2">
          <Section
            id="palette"
            title="Palette"
            description="Three twelve-step ramps, all derived from the two seeds and the tint."
            wide
          >
            <div className="grid gap-3">
              <Ramp name="accent" />
              <Ramp name="secondary" />
              <Ramp name="gray" />
            </div>
          </Section>

          <Section
            id="your-theme"
            title="Your theme"
            description="Paste this into your global stylesheet."
            action={
              <Button
                size="sm"
                variant="soft"
                tone="neutral"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(css);
                    setCopied(true);
                  } catch {
                    /* clipboard may be blocked; the code stays visible */
                  }
                }}
              >
                {copied ? "Copied" : "Copy CSS"}
              </Button>
            }
            wide
          >
            {/* Edge to edge, as a code block in a card wants to be: the media
              * part undoes the card's padding and rounds itself to the card's
              * corner. It is also where the mono picker becomes visible — the
              * block is set in the theme's own mono stack. */}
            <Card.Media className="border-t border-border-muted bg-background">
              <pre className="m-0 overflow-x-auto p-4 font-mono text-2 leading-[1.6] text-foreground">
                {css}
              </pre>
            </Card.Media>
          </Section>

          <Section
            id="typography"
            title="Typography"
            description={fontsLine(sans, mono)}
            wide
          >
            {/* Both stacks through the sizes and weights the library uses, so
              * a font swap actually shows: a control's label is one size and
              * one weight, and most families look alike there. */}
            <div className="grid gap-4">
              <p className="m-0 text-6 leading-[1.1] font-bold tracking-[-0.02em] text-balance">
                Sphinx of black quartz, judge my vow.
              </p>
              <p className="m-0 text-4 leading-normal font-semibold">
                The quick brown fox jumps over the lazy dog.
              </p>
              <p className="m-0 max-w-[60ch] text-2 leading-normal text-pretty">
                A palette rebuilt from one seed, in plain CSS. Twelve accent steps,
                brand-tinted neutrals and a text color chosen to stay readable on
                top of your fill — 0123456789.
              </p>
              <p className="m-0 text-1 text-foreground-muted">
                Caption — the smallest size a label is set in.
              </p>
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2 text-3">
                <span className="font-normal">Regular</span>
                <span className="font-medium">Medium</span>
                <span className="font-semibold">Semibold</span>
                <span className="font-bold">Bold</span>
              </div>
              <code className="w-fit rounded-3 bg-background px-2 py-1 font-mono text-1">
                npm install @forte-ui/react
              </code>
            </div>
          </Section>

          <Section
            id="buttons"
            title="Buttons"
            description="Variant is how loud; tone is which color set. Every pair works."
            wide
          >
            <div className="grid gap-4">
              <Row label="Variant">
                <Button>Solid</Button>
                <Button variant="soft">Soft</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </Row>
              <Row label="Tone">
                <Button>Primary</Button>
                <Button tone="secondary">Secondary</Button>
                <Button tone="neutral">Neutral</Button>
                <Button tone="danger">Danger</Button>
              </Row>
              <Row label="Size">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </Row>
              <Row label="State">
                <Button loading>Saving</Button>
                <Button disabled>Disabled</Button>
                <Button variant="soft">
                  <Plus className={ICON} aria-hidden />
                  With icon
                </Button>
                <Button variant="outline" tone="neutral" iconOnly aria-label="Delete">
                  <Trash2 className={ICON} aria-hidden />
                </Button>
              </Row>
              <Row label="Group">
                <ButtonGroup.Root aria-label="Message actions">
                  <Button variant="outline" tone="neutral">
                    <Archive className={ICON} aria-hidden />
                    Archive
                  </Button>
                  <Button variant="outline" tone="neutral">
                    <Flag className={ICON} aria-hidden />
                    Report
                  </Button>
                  <Button variant="outline" tone="neutral">
                    <Clock className={ICON} aria-hidden />
                    Snooze
                  </Button>
                </ButtonGroup.Root>
              </Row>
            </div>
          </Section>

          <Section
            id="form-controls"
            title="Form controls"
            description="Inputs, choices and a range — the parts of a settings page."
            wide
          >
            <div className="@container">
              <div className="grid gap-5 @md:grid-cols-2">
                <div className="grid content-start gap-4">
                  <Field.Root name="project">
                    <Field.Label>Project name</Field.Label>
                    <Input placeholder="acme-website" />
                    <Field.Description>Lowercase letters, numbers and dashes.</Field.Description>
                  </Field.Root>

                  <Field.Root name="replicas">
                    <NumberField.Root defaultValue={3} min={1} max={99}>
                      <NumberField.ScrubArea>
                        <Field.Label>Replicas</Field.Label>
                      </NumberField.ScrubArea>
                      <NumberField.Group>
                        <NumberField.Decrement />
                        <NumberField.Input />
                        <NumberField.Increment />
                      </NumberField.Group>
                    </NumberField.Root>
                  </Field.Root>

                  <Slider.Root defaultValue={40}>
                    <Slider.Label>Traffic to canary</Slider.Label>
                    <Slider.Value />
                    <Slider.Control>
                      <Slider.Track>
                        <Slider.Indicator />
                        <Slider.Thumb />
                      </Slider.Track>
                    </Slider.Control>
                  </Slider.Root>
                </div>

                <div className="grid content-start gap-4">
                  <Field.Root name="notifications">
                    <Field.Label nativeLabel={false}>Notify me about</Field.Label>
                    <CheckboxGroup defaultValue={["builds"]}>
                      <Field.Item>
                        <Field.Label>
                          <Checkbox value="builds" />
                          Failed builds
                        </Field.Label>
                      </Field.Item>
                      <Field.Item>
                        <Field.Label>
                          <Checkbox value="digest" />
                          Weekly digest
                        </Field.Label>
                      </Field.Item>
                    </CheckboxGroup>
                  </Field.Root>

                  <Field.Root name="visibility">
                    <Field.Label nativeLabel={false}>Visibility</Field.Label>
                    <RadioGroup defaultValue="team">
                      <Field.Item>
                        <Field.Label>
                          <Radio value="private" />
                          Private
                        </Field.Label>
                      </Field.Item>
                      <Field.Item>
                        <Field.Label>
                          <Radio value="team" />
                          Team
                        </Field.Label>
                      </Field.Item>
                      <Field.Item>
                        <Field.Label>
                          <Radio value="public" />
                          Public
                        </Field.Label>
                      </Field.Item>
                    </RadioGroup>
                  </Field.Root>

                  <Field.Root name="auto-deploy">
                    <Field.Label>
                      <Switch defaultChecked />
                      Deploy on push
                    </Field.Label>
                  </Field.Root>
                </div>
              </div>
            </div>
            <Card.Footer align="end">
              <Button variant="ghost" tone="neutral">
                Cancel
              </Button>
              <Button>Save changes</Button>
            </Card.Footer>
          </Section>

          <Section
            id="pickers"
            title="Pickers"
            description="A field that opens a list — the trigger and the popup share the theme."
            wide
          >
            <Pickers />
          </Section>

          <Section
            id="feedback"
            title="Feedback"
            description="Status, progress and the semantic tones."
          >
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Beta</Badge>
                <Badge tone="secondary">Preview</Badge>
                <Badge tone="success" dot>
                  Active
                </Badge>
                <Badge tone="warning" dot>
                  Degraded
                </Badge>
                <Badge tone="info">Scheduled</Badge>
                <Badge tone="danger" variant="solid">
                  Failed
                </Badge>
                <Badge tone="neutral" variant="outline">
                  Draft
                </Badge>
                <Badge tone="danger" variant="solid" shape="pill" count={12} />
              </div>

              <Alert.Root tone="success">
                <Alert.Icon />
                <Alert.Title>Deployed</Alert.Title>
                <Alert.Description>Version 4.2 is live in every region.</Alert.Description>
              </Alert.Root>

              <Progress.Root value={62}>
                <Progress.Label>Uploading footage</Progress.Label>
                <Progress.Value />
                <Progress.Track>
                  <Progress.Indicator />
                </Progress.Track>
              </Progress.Root>

              <div className="flex flex-wrap items-center gap-5">
                <ProgressCircle.Root value={68} size="sm" aria-label="Transcoding">
                  <ProgressCircle.Track>
                    <ProgressCircle.Indicator />
                  </ProgressCircle.Track>
                </ProgressCircle.Root>
                <Spinner variant="ring" decorative />
                <Spinner variant="dots" decorative />
                <Spinner variant="bars" decorative />
                <Spinner variant="pulse" decorative />
              </div>
            </div>
          </Section>

          <Section
            id="navigation"
            title="Navigation"
            description="Tabs, crumbs and pages, on the same accent."
          >
            <div className="grid gap-4">
              <Tabs.Root defaultValue="overview">
                <Tabs.List aria-label="Project sections">
                  <Tabs.Tab value="overview">Overview</Tabs.Tab>
                  <Tabs.Tab value="deployments">Deployments</Tabs.Tab>
                  <Tabs.Tab value="access">Access</Tabs.Tab>
                  <Tabs.Indicator />
                </Tabs.List>
                <Tabs.Panel value="overview">Deployed 4 minutes ago from main.</Tabs.Panel>
                <Tabs.Panel value="deployments">18 deploys, 2 rolled back.</Tabs.Panel>
                <Tabs.Panel value="access">6 members, 2 service tokens.</Tabs.Panel>
              </Tabs.Root>

              <Tabs.Root defaultValue="7d" variant="pill">
                <Tabs.List aria-label="Reporting period">
                  <Tabs.Tab value="24h">24 hours</Tabs.Tab>
                  <Tabs.Tab value="7d">7 days</Tabs.Tab>
                  <Tabs.Tab value="30d">30 days</Tabs.Tab>
                  <Tabs.Indicator />
                </Tabs.List>
              </Tabs.Root>

              <Breadcrumb.Root>
                <Breadcrumb.List>
                  <Breadcrumb.Item>
                    <Breadcrumb.Link href="#">Home</Breadcrumb.Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <Breadcrumb.Link href="#">Projects</Breadcrumb.Link>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <Breadcrumb.Page>acme-website</Breadcrumb.Page>
                  </Breadcrumb.Item>
                </Breadcrumb.List>
              </Breadcrumb.Root>

              <Pager />
            </div>
          </Section>

          <Section
            id="overlays"
            title="Overlays"
            description="Open one — the radius and motion presets show most here."
          >
            {/* These render into a portal, outside the preview scope. They
              * still pick up the theme because every edit also lands on
              * <html>; the scope on the column is for what stays inside it. */}
            <div className="flex flex-wrap items-center gap-3">
              <Tooltip.Root>
                <Tooltip.Trigger
                  aria-label="Notifications"
                  render={<Button variant="outline" tone="neutral" iconOnly />}
                >
                  <Bell className={ICON} aria-hidden />
                </Tooltip.Trigger>
                <Tooltip.Popup>
                  <Tooltip.Arrow />
                  Notifications
                </Tooltip.Popup>
              </Tooltip.Root>

              <Popover.Root>
                <Popover.Trigger render={<Button variant="outline" tone="neutral" />}>
                  Popover
                </Popover.Trigger>
                <Popover.Popup>
                  <Popover.Arrow />
                  <Popover.Title>All caught up</Popover.Title>
                  <Popover.Description>
                    New activity in the workspace will show up here.
                  </Popover.Description>
                </Popover.Popup>
              </Popover.Root>

              {/* The glyphs are `aria-hidden` — a screen reader would read ⌘C
                * as "place of interest sign C" — and `aria-keyshortcuts`
                * carries the same fact in words the platform understands. */}
              <Menu.Root>
                <Menu.Trigger>Menu</Menu.Trigger>
                <Menu.Popup>
                  <Menu.Item aria-keyshortcuts="Meta+C">
                    <Copy aria-hidden="true" />
                    Copy
                    <Menu.Shortcut>⌘C</Menu.Shortcut>
                  </Menu.Item>
                  <Menu.Item aria-keyshortcuts="F2">
                    <Pencil aria-hidden="true" />
                    Rename
                    <Menu.Shortcut>F2</Menu.Shortcut>
                  </Menu.Item>
                  <Menu.Separator />
                  {/* A submenu's popup reads its nesting from the SubmenuRoot
                    * and opens off the inline end of the row on its own. */}
                  <Menu.SubmenuRoot>
                    <Menu.SubmenuTrigger>Move to</Menu.SubmenuTrigger>
                    <Menu.Popup>
                      <Menu.Item>Marketing site</Menu.Item>
                      <Menu.Item>Design system</Menu.Item>
                      <Menu.Item>Archive</Menu.Item>
                    </Menu.Popup>
                  </Menu.SubmenuRoot>
                  <Menu.SubmenuRoot>
                    <Menu.SubmenuTrigger>Export as</Menu.SubmenuTrigger>
                    <Menu.Popup>
                      <Menu.Item>PDF</Menu.Item>
                      <Menu.Item>Markdown</Menu.Item>
                    </Menu.Popup>
                  </Menu.SubmenuRoot>
                  <Menu.Separator />
                  <Menu.Item tone="danger" aria-keyshortcuts="Meta+Backspace">
                    <Trash2 aria-hidden="true" />
                    Delete
                    <Menu.Shortcut>⌘⌫</Menu.Shortcut>
                  </Menu.Item>
                </Menu.Popup>
              </Menu.Root>

              <Dialog.Root>
                <Dialog.Trigger render={<Button variant="soft" />}>Dialog</Dialog.Trigger>
                <Dialog.Popup size="sm">
                  <Dialog.Title>Edit profile</Dialog.Title>
                  <Dialog.Description>
                    These details are visible to everyone in the workspace.
                  </Dialog.Description>
                  <Field.Root name="display-name">
                    <Field.Label>Display name</Field.Label>
                    <Input defaultValue="Ada Lovelace" />
                  </Field.Root>
                  <Dialog.Footer>
                    <Dialog.Close render={<Button variant="soft" tone="neutral" />}>
                      Cancel
                    </Dialog.Close>
                    <Dialog.Close render={<Button />}>Save changes</Dialog.Close>
                  </Dialog.Footer>
                </Dialog.Popup>
              </Dialog.Root>
            </div>
          </Section>

          <Section
            id="content"
            title="Content"
            description="People, keys, a segmented control and a disclosure."
          >
            <div className="grid gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <Avatar.Root>
                    <Avatar.Image src="/avatars/ada.svg" alt="" />
                    <Avatar.Fallback>AL</Avatar.Fallback>
                  </Avatar.Root>
                  <div className="grid">
                    <span className="text-2 font-medium">Ada Lovelace</span>
                    <span className="text-1 text-foreground-muted">Owner</span>
                  </div>
                </div>
                <Avatar.Root tone="primary">
                  <Avatar.Fallback label="Bea Rivera">BR</Avatar.Fallback>
                </Avatar.Root>
                <Avatar.Root tone="secondary" variant="solid">
                  <Avatar.Fallback label="Kofi Mensah">KM</Avatar.Fallback>
                </Avatar.Root>
                <Avatar.Root variant="outline">
                  <Avatar.Fallback label="Adaobi Okonkwo">AO</Avatar.Fallback>
                </Avatar.Root>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <KbdGroup>
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </KbdGroup>
                <ToggleGroup aria-label="Text alignment" defaultValue={["left"]}>
                  <Toggle iconOnly value="left" aria-label="Align left">
                    <AlignLeft className={ICON} aria-hidden />
                  </Toggle>
                  <Toggle iconOnly value="center" aria-label="Align center">
                    <AlignCenter className={ICON} aria-hidden />
                  </Toggle>
                  <Toggle iconOnly value="right" aria-label="Align right">
                    <AlignRight className={ICON} aria-hidden />
                  </Toggle>
                </ToggleGroup>
                <Toggle defaultPressed>Show archived</Toggle>
              </div>

              <Accordion.Root defaultValue={["shipping"]}>
                <Accordion.Item value="shipping">
                  <Accordion.Header>
                    <Accordion.Trigger>When will my order ship?</Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Panel>
                    Orders placed before 14:00 leave the same working day.
                  </Accordion.Panel>
                </Accordion.Item>
                <Accordion.Item value="returns">
                  <Accordion.Header>
                    <Accordion.Trigger>Can I return something?</Accordion.Trigger>
                  </Accordion.Header>
                  <Accordion.Panel>
                    Within 30 days, unopened, with the receipt.
                  </Accordion.Panel>
                </Accordion.Item>
              </Accordion.Root>
            </div>
          </Section>

          <Section
            id="table"
            title="Table"
            description="Rows on the tinted neutrals, status in the semantic tones."
            wide
          >
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Invoice</Table.Head>
                  <Table.Head>Customer</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head numeric>Amount</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {INVOICES.map((invoice) => (
                  <Table.Row key={invoice.id}>
                    <Table.Cell className="font-mono text-1">{invoice.id}</Table.Cell>
                    <Table.Cell>{invoice.customer}</Table.Cell>
                    <Table.Cell>
                      <Badge tone={invoice.tone} size="sm" dot>
                        {invoice.status}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell numeric>{invoice.amount}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* The typography card's caption. "System" is a catalog entry, not a family
 * name — "System for text, System for code" reads as a bug — so the default
 * is spelled out, and the two halves merge when they say the same thing. */
function fontsLine(sans: FontOption, mono: FontOption) {
  const name = (f: FontOption) => (f.stack ? f.name : "the system font");
  const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
  return name(sans) === name(mono)
    ? `${cap(name(sans))} for text and code.`
    : `${cap(name(sans))} for text, ${name(mono)} for code.`;
}

const REGIONS = {
  iad: "Washington, D.C.",
  fra: "Frankfurt",
  sin: "Singapore",
  syd: "Sydney",
};

const INVOICES = [
  { id: "INV-2041", customer: "Northwind", status: "Paid", tone: "success", amount: "$1,250.00" },
  { id: "INV-2040", customer: "Fabrikam", status: "Due today", tone: "warning", amount: "$840.00" },
  { id: "INV-2039", customer: "Contoso", status: "Failed", tone: "danger", amount: "$2,100.00" },
  { id: "INV-2038", customer: "Litware", status: "Draft", tone: "neutral", amount: "$415.50" },
] as const;

/* One card per subject. The title is an `h2[id]`, which is exactly what the
 * section rail looks for on mount (`components/toc.tsx`) — this page is JSX,
 * so `toc` has no seed for it, and the rail fills itself from these. HEADING
 * carries the `scroll-mt` the rail measures against; without it a rail click
 * would land this heading under the app bar while every MDX heading clears
 * it. `wide` spans both columns where two fit. */
function Section({
  id,
  title,
  description,
  action,
  wide = false,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Card.Root className={cn("min-w-0", wide && "@3xl:col-span-2")}>
      <Card.Header>
        <Card.Title>
          <h2 id={id} className={HEADING}>
            {title}
          </h2>
        </Card.Title>
        {description ? <Card.Description>{description}</Card.Description> : null}
        {action ? <Card.Action>{action}</Card.Action> : null}
      </Card.Header>
      {children}
    </Card.Root>
  );
}

const ASSIGNEES = [
  "Ada Lovelace",
  "Adaobi Okonkwo",
  "Bea Rivera",
  "Cyrus Farahani",
  "Dara Quinn",
  "Eli Nakamura",
  "Kofi Mensah",
];

/* Select, Combobox and DatePicker side by side: a closed value, a filtered
 * list and a calendar, all three a field on the page and a popup off it.
 * They get a card apart from the other form controls because the popup is
 * the half a theme change shows on — the radius, the motion preset, the
 * panel's fill and hairline — and a closed trigger hides all of it. Each
 * needs its own state or id, hence a component rather than inline JSX. */
function Pickers() {
  const comboId = React.useId();
  const [date, setDate] = React.useState<Date | null>(null);

  return (
    <div className="@container">
      <div className="grid gap-4 @md:grid-cols-3">
        <Field.Root name="region">
          <Field.Label nativeLabel={false}>Region</Field.Label>
          <Select.Root items={REGIONS} defaultValue="fra">
            <Select.Trigger aria-label="Region">
              <Select.Value />
              <Select.Icon />
            </Select.Trigger>
            <Select.Popup>
              {Object.entries(REGIONS).map(([value, label]) => (
                <Select.Item key={value} value={value}>
                  {label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Root>
        </Field.Root>

        {/* A native label, because the INPUT is the form control here —
          * `Combobox.Label` targets the trigger and belongs to the
          * input-inside-popup pattern. `Field.Label` would wire itself to
          * the wrong element the same way. */}
        <Combobox.Root items={ASSIGNEES}>
          {/* The gap and the label's metrics are Field's own, so this column
            * lines up with the two Field.Roots beside it. */}
          <div className="grid gap-2">
            <label htmlFor={comboId} className="flex items-center text-2 leading-tight font-medium">
              Assignee
            </label>
            {/* `fullWidth`, because the group's default is a fixed 16rem and
              * the column beside the select is narrower than that. */}
            <Combobox.InputGroup fullWidth>
              <Combobox.Input id={comboId} placeholder="Search people" />
              <Combobox.Clear aria-label="Clear selection" />
              <Combobox.Trigger aria-label="Open popup" />
            </Combobox.InputGroup>
          </div>
          <Combobox.Popup>
            <Combobox.Empty>Nobody by that name.</Combobox.Empty>
            <Combobox.List>
              {(name: string) => (
                <Combobox.Item key={name} value={name}>
                  {name}
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Root>

        <Field.Root name="due">
          <Field.Label nativeLabel={false}>Due date</Field.Label>
          <DatePicker.Root selected={date} onSelect={setDate}>
            <DatePicker.Trigger aria-label="Due date">
              <DatePicker.Value placeholder="Pick a date" />
              <DatePicker.Icon />
            </DatePicker.Trigger>
            <DatePicker.Popup>
              <DatePicker.Calendar />
            </DatePicker.Popup>
          </DatePicker.Root>
        </Field.Root>
      </div>
    </div>
  );
}

/* No hrefs, so every slot is a <button> and the strip pages state in place.
 * The first draft linked every page to "#", which is a real navigation: the
 * document scrolled to the top on every click, in a preview whose whole job
 * is to stay under the pointer. `usePaginationRange` keeps the slot count
 * constant as the page moves, so Next never shifts either. */
const PAGE_COUNT = 12;

function Pager() {
  const [page, setPage] = React.useState(2);
  const items = usePaginationRange({ page, count: PAGE_COUNT });

  return (
    <Pagination.Root>
      <Pagination.List>
        <Pagination.Item>
          <Pagination.Previous disabled={page === 1} onClick={() => setPage((p) => p - 1)} />
        </Pagination.Item>
        {items.map((item) => (
          <Pagination.Item key={item}>
            {typeof item === "number" ? (
              <Pagination.Link
                current={item === page}
                onClick={() => setPage(item)}
                aria-label={`Page ${item}`}
              >
                {item}
              </Pagination.Link>
            ) : (
              <Pagination.Ellipsis />
            )}
          </Pagination.Item>
        ))}
        <Pagination.Item>
          <Pagination.Next
            disabled={page === PAGE_COUNT}
            onClick={() => setPage((p) => p + 1)}
          />
        </Pagination.Item>
      </Pagination.List>
    </Pagination.Root>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={ROW}>
      <span className={ROW_LABEL}>{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

function Ramp({ name }: { name: string }) {
  return (
    <div className="grid gap-1">
      <span className={ROW_LABEL}>{name}</span>
      <div className={RAMP} role="img" aria-label={`${name} ramp, 12 steps`}>
        {Array.from({ length: 12 }, (_, i) => (
          // Color is the entire content — keep it in forced-colors mode.
          <span
            key={i}
            className="block [forced-color-adjust:none]"
            style={{ background: `var(--forte-${name}-${i + 1})` }}
          />
        ))}
      </div>
    </div>
  );
}
