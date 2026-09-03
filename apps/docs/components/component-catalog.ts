/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with:  pnpm --filter @forte-ui/docs catalog
 *
 * The library's component catalog, resolved to routes on this site. Both the
 * index page and the sidebar's Components group render from it, so neither can
 * drift from what `@forte-ui/react` actually exports.
 */

/** The six buckets, in the order the library declares them. */
export const CATEGORIES = [
  "Actions",
  "Forms",
  "Overlays",
  "Navigation",
  "Content & layout",
  "Feedback",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type CatalogEntry = {
  /** The exported name — `NavList`, `OTPField`. */
  name: string;
  /** That name as prose — `Nav List`, `OTP Field`. */
  title: string;
  href: string;
  category: Category;
  /** The one-line `@summary` from the component's doc comment. */
  summary: string;
  /**
   * Set when the entry heads no page of its own and is documented alongside
   * another — `AlertDialog` is `partOf: "Dialog"`. Its `href` then points
   * into that component's page.
   */
  partOf: string | null;
};

export const CATALOG: CatalogEntry[] = [
  { name: "Button", title: "Button", href: "/components/button/", category: "Actions", summary: "The clickable action control — submit, open, trigger; for a pressed state that sticks, use Toggle, and for pure navigation use a link.", partOf: null },
  { name: "ButtonGroup", title: "Button Group", href: "/components/button-group/", category: "Actions", summary: "Fuses related buttons into one visual object with shared borders; purely presentational — for a single-choice set with state, use ToggleGroup.", partOf: null },
  { name: "ThemeToggle", title: "Theme Toggle", href: "/components/theme-toggle/", category: "Actions", summary: "A ready-made light/dark mode button — pair with ThemeScript to avoid a wrong-theme flash at first paint; useTheme drives custom toggles.", partOf: null },
  { name: "Toggle", title: "Toggle", href: "/components/toggle/", category: "Actions", summary: "A two-state button that stays pressed — bold in a text editor; for an on/off setting that reads as a control, use Switch.", partOf: null },
  { name: "ToggleGroup", title: "Toggle Group", href: "/components/toggle-group/", category: "Actions", summary: "A set of Toggles sharing one value, single or multiple choice — the view-switcher pattern; for form data use RadioGroup or CheckboxGroup.", partOf: null },
  { name: "Toolbar", title: "Toolbar", href: "/components/toolbar/", category: "Actions", summary: "A strip of related controls that behaves as one tab stop, arrow keys moving between them — the row above an editor or table.", partOf: null },
  { name: "Calendar", title: "Calendar", href: "/components/calendar/", category: "Forms", summary: "An inline month grid for picking one day, several days, or a range; for a form field that opens a calendar on demand, use DatePicker.", partOf: null },
  { name: "Checkbox", title: "Checkbox", href: "/components/checkbox/", category: "Forms", summary: "An independent yes/no option with an optional mixed state; for one-of-many use RadioGroup, for a setting that applies immediately use Switch.", partOf: null },
  { name: "CheckboxGroup", title: "Checkbox Group", href: "/components/checkbox-group/", category: "Forms", summary: "One array value shared by several Checkboxes, with an optional parent checkbox that summarises and toggles the lot.", partOf: null },
  { name: "ColorPicker", title: "Color Picker", href: "/components/color-picker/", category: "Forms", summary: "Full color selection — saturation/brightness canvas, hue and alpha rails, preset swatches, and a text field that speaks four CSS notations.", partOf: null },
  { name: "Combobox", title: "Combobox", href: "/components/combobox/", category: "Forms", summary: "A text input combined with a filterable option list — the Select to reach for once the list is long enough to need typing.", partOf: null },
  { name: "DatePicker", title: "Date Picker", href: "/components/date-picker/", category: "Forms", summary: "A form field that opens a Calendar in a popover — the input-shaped way to pick a day or a range.", partOf: null },
  { name: "Field", title: "Field", href: "/components/field/", category: "Forms", summary: "Wires one control to its label, description and error message, and owns the validation state they all read — the wrapper every form control sits in.", partOf: null },
  { name: "Fieldset", title: "Fieldset", href: "/components/fieldset/", category: "Forms", summary: "Groups related Fields under one legend, without the browser's default fieldset chrome.", partOf: null },
  { name: "Form", title: "Form", href: "/components/form/", category: "Forms", summary: "A <form> that aggregates every Field's validity, blocks submission until they pass, and routes server errors back to fields by name.", partOf: null },
  { name: "Input", title: "Input", href: "/components/input/", category: "Forms", summary: "The single-line text field; wrap in Field for label and error wiring, in InputGroup for inner icons and buttons; for numbers use NumberField.", partOf: null },
  { name: "InputGroup", title: "Input Group", href: "/components/input-group/", category: "Forms", summary: "Puts icons, prefixes, buttons and counters inside a text field's boundary instead of bolted onto it.", partOf: null },
  { name: "NumberField", title: "Number Field", href: "/components/number-field/", category: "Forms", summary: "A text input that knows it holds a number — parses, formats, steps, clamps, and scrubs by dragging; use over Input whenever the value is numeric.", partOf: null },
  { name: "OTPField", title: "OTP Field", href: "/components/otp-field/", category: "Forms", summary: "A row of single-character slots holding one verification code — one value, one tab stop, and paste that lands where you expect.", partOf: null },
  { name: "Radio", title: "Radio", href: "/components/radio/", category: "Forms", summary: "One option in a mutually exclusive set — always rendered inside a RadioGroup.", partOf: null },
  { name: "RadioGroup", title: "Radio Group", href: "/components/radio/#radiogroup", category: "Forms", summary: "A single choice among a few options that all stay visible; once the list grows past a handful, use Select.", partOf: "Radio" },
  { name: "Select", title: "Select", href: "/components/select/", category: "Forms", summary: "A dropdown for choosing one option from a closed list; once the list is long enough to need typing to navigate, use Combobox.", partOf: null },
  { name: "Slider", title: "Slider", href: "/components/slider/", category: "Forms", summary: "Picks a numeric value or range by feel along a track; when the exact number matters more than the feel, use NumberField.", partOf: null },
  { name: "Switch", title: "Switch", href: "/components/switch/", category: "Forms", summary: "An on/off control whose change applies immediately — no submit step; for a value collected and submitted by a form, use Checkbox.", partOf: null },
  { name: "Textarea", title: "Textarea", href: "/components/textarea/", category: "Forms", summary: "A multi-line text control sized in rows, with an optional ceiling and CSS-driven auto-growth.", partOf: null },
  { name: "AlertDialog", title: "Alert Dialog", href: "/components/dialog/", category: "Overlays", summary: "A modal for decisions that must be answered — it cannot be dismissed by clicking outside; the shape for destructive confirms. Shares Dialog's parts (see Dialog's props.json keys) under AlertDialog.*.", partOf: "Dialog" },
  { name: "ContextMenu", title: "Context Menu", href: "/components/context-menu/", category: "Overlays", summary: "A Menu that opens at the pointer on right-click or long-press over a region of the page rather than off a button.", partOf: null },
  { name: "Dialog", title: "Dialog", href: "/components/dialog/", category: "Overlays", summary: "A modal surface that takes focus until dismissed; for confirmations that must be answered use AlertDialog, for edge-anchored panels use Drawer.", partOf: null },
  { name: "Drawer", title: "Drawer", href: "/components/drawer/", category: "Overlays", summary: "A panel that slides in from any screen edge, with drag-to-dismiss and snap points; for a centered modal use Dialog.", partOf: null },
  { name: "Menu", title: "Menu", href: "/components/menu/", category: "Overlays", summary: "A button-opened list of commands with checkable items, submenus and shortcut hints; for choosing a form value use Select instead.", partOf: null },
  { name: "Menubar", title: "Menubar", href: "/components/menubar/", category: "Overlays", summary: "A row of Menus that behave as one strip — the application menu bar.", partOf: null },
  { name: "Popover", title: "Popover", href: "/components/popover/", category: "Overlays", summary: "An anchored non-modal surface for content the user reads or acts on — tabbable and touch-reachable; for a hover-only hint use Tooltip.", partOf: null },
  { name: "PreviewCard", title: "Preview Card", href: "/components/preview-card/", category: "Overlays", summary: "A rich preview of a link's destination revealed by resting on it — supplementary by design, never the only route to what it shows.", partOf: null },
  { name: "Toast", title: "Toast", href: "/components/toast/", category: "Overlays", summary: "Short transient messages raised imperatively from anywhere via useToast; for a persistent in-page message use Alert.", partOf: null },
  { name: "Tooltip", title: "Tooltip", href: "/components/tooltip/", category: "Overlays", summary: "A short label shown on hover or focus naming a control — never the only carrier of essential content; for interactive content use Popover.", partOf: null },
  { name: "AppBar", title: "App Bar", href: "/components/app-bar/", category: "Navigation", summary: "The bar across the top of a screen — leading controls, a title and trailing actions, pinned, elevating or hiding on scroll; for a one-tab-stop strip of controls inside it, use Toolbar.", partOf: null },
  { name: "Breadcrumb", title: "Breadcrumb", href: "/components/breadcrumb/", category: "Navigation", summary: "The trail of ancestors above the current page, with automatic separators and a collapsible middle for narrow screens.", partOf: null },
  { name: "NavigationMenu", title: "Navigation Menu", href: "/components/navigation-menu/", category: "Navigation", summary: "A horizontal site-nav bar whose items open one shared panel of links that slides and resizes between them.", partOf: null },
  { name: "NavList", title: "Nav List", href: "/components/nav-list/", category: "Navigation", summary: "A sidebar's vertical page list — titled sections, collapsible groups, nesting, and a controlled notion of the current page.", partOf: null },
  { name: "Pagination", title: "Pagination", href: "/components/pagination/", category: "Navigation", summary: "Page controls for a long set — previous, next, numbered pages and an ellipsis; for moving through steps of one task use Tabs, and for a position within a document use Breadcrumb.", partOf: null },
  { name: "Steps", title: "Steps", href: "/components/steps/", category: "Navigation", summary: "A numbered sequence of steps and the user's position in it — a wizard header or an order's progress; for a single fraction done, use Progress instead.", partOf: null },
  { name: "Tabs", title: "Tabs", href: "/components/tabs/", category: "Navigation", summary: "Switches between panels of related content in the same place, with a sliding active indicator.", partOf: null },
  { name: "Accordion", title: "Accordion", href: "/components/accordion/", category: "Content & layout", summary: "A stack of headings that each expand a panel, one or several open at a time; for a single independent disclosure, use Collapsible.", partOf: null },
  { name: "Alert", title: "Alert", href: "/components/alert/", category: "Content & layout", summary: "A persistent in-page message about the page's state — the static counterpart to Toast, which is transient and floats above the page.", partOf: null },
  { name: "AspectRatio", title: "Aspect Ratio", href: "/components/aspect-ratio/", category: "Content & layout", summary: "Reserves a fixed-ratio box from first paint so late-arriving media drops into already-reserved space instead of shifting the layout.", partOf: null },
  { name: "Avatar", title: "Avatar", href: "/components/avatar/", category: "Content & layout", summary: "A picture of a person or thing with a sensible fallback when the image is missing or slow, plus an optional status badge and grouping.", partOf: null },
  { name: "Badge", title: "Badge", href: "/components/badge/", category: "Content & layout", summary: "A small label for status, counts and categories.", partOf: null },
  { name: "Card", title: "Card", href: "/components/card/", category: "Content & layout", summary: "The bordered grouping surface — header, title, action, content, footer and media slots for everything from settings sections to pricing tiers.", partOf: null },
  { name: "Carousel", title: "Carousel", href: "/components/carousel/", category: "Content & layout", summary: "A strip of slides shown one (or a few) at a time, moved by drag, by buttons or on a timer; for panels chosen by name rather than by position use Tabs, and for a list that merely scrolls use ScrollArea.", partOf: null },
  { name: "Collapsible", title: "Collapsible", href: "/components/collapsible/", category: "Content & layout", summary: "A single trigger and the region it reveals; for a stack of exclusive disclosures, use Accordion.", partOf: null },
  { name: "Kbd", title: "Kbd", href: "/components/kbd/", category: "Content & layout", summary: "A keyboard key cap for shortcut hints — works in prose, tooltips, menu items and buttons.", partOf: null },
  { name: "KbdGroup", title: "Kbd Group", href: "/components/kbd/#kbdgroup", category: "Content & layout", summary: "A sequence of Kbds read as one shortcut (⌘ K).", partOf: "Kbd" },
  { name: "Resizable", title: "Resizable", href: "/components/resizable/", category: "Content & layout", summary: "Panels the user re-proportions by dragging the divider between them — keyboard operable, constrainable, and persistable.", partOf: null },
  { name: "ScrollArea", title: "Scroll Area", href: "/components/scroll-area/", category: "Content & layout", summary: "A scroll container with overlay scrollbars that look the same on every platform, plus scroll-position edge fades.", partOf: null },
  { name: "Separator", title: "Separator", href: "/components/separator/", category: "Content & layout", summary: "A rule between things, horizontal or vertical, announced to assistive technology unless marked decorative.", partOf: null },
  { name: "Table", title: "Table", href: "/components/table/", category: "Content & layout", summary: "Rows and columns of data on a real `<table>` — variants, sizes, striping, selection tint, numeric columns, sortable headers and a sticky header; the data, sorting and selection state stay with the consumer.", partOf: null },
  { name: "Progress", title: "Progress", href: "/components/progress/", category: "Feedback", summary: "A linear progress bar — determinate when passed a number, indeterminate when passed null; the circular form is ProgressCircle.", partOf: null },
  { name: "ProgressCircle", title: "Progress Circle", href: "/components/progress/#progresscircle", category: "Feedback", summary: "The circular Progress — a ring for tight spaces; same determinate/indeterminate contract as the bar.", partOf: "Progress" },
  { name: "Skeleton", title: "Skeleton", href: "/components/skeleton/", category: "Feedback", summary: "A loading placeholder that occupies exactly the space the real content will, so the page doesn't jump when data lands.", partOf: null },
  { name: "Spinner", title: "Spinner", href: "/components/spinner/", category: "Feedback", summary: "An indeterminate busy indicator for waits with no measurable progress; when progress is known, use Progress.", partOf: null },
];

/**
 * The sidebar's rows: one per PAGE, alphabetical.
 *
 * A separate array rather than a filter over `CATALOG`, and the duplication is
 * deliberate. `nav.tsx` is a client component, so whatever it imports ships to
 * the browser — a filter would reference `CATALOG` and drag all sixty
 * summaries into the bundle to render fifty-six links. Two independent consts
 * let the one nothing on the client reads be dropped.
 */
export const COMPONENT_PAGES: { title: string; href: string }[] = [
  { title: "Accordion", href: "/components/accordion/" },
  { title: "Alert", href: "/components/alert/" },
  { title: "App Bar", href: "/components/app-bar/" },
  { title: "Aspect Ratio", href: "/components/aspect-ratio/" },
  { title: "Avatar", href: "/components/avatar/" },
  { title: "Badge", href: "/components/badge/" },
  { title: "Breadcrumb", href: "/components/breadcrumb/" },
  { title: "Button", href: "/components/button/" },
  { title: "Button Group", href: "/components/button-group/" },
  { title: "Calendar", href: "/components/calendar/" },
  { title: "Card", href: "/components/card/" },
  { title: "Carousel", href: "/components/carousel/" },
  { title: "Checkbox", href: "/components/checkbox/" },
  { title: "Checkbox Group", href: "/components/checkbox-group/" },
  { title: "Collapsible", href: "/components/collapsible/" },
  { title: "Color Picker", href: "/components/color-picker/" },
  { title: "Combobox", href: "/components/combobox/" },
  { title: "Context Menu", href: "/components/context-menu/" },
  { title: "Date Picker", href: "/components/date-picker/" },
  { title: "Dialog", href: "/components/dialog/" },
  { title: "Drawer", href: "/components/drawer/" },
  { title: "Field", href: "/components/field/" },
  { title: "Fieldset", href: "/components/fieldset/" },
  { title: "Form", href: "/components/form/" },
  { title: "Input", href: "/components/input/" },
  { title: "Input Group", href: "/components/input-group/" },
  { title: "Kbd", href: "/components/kbd/" },
  { title: "Menu", href: "/components/menu/" },
  { title: "Menubar", href: "/components/menubar/" },
  { title: "Navigation Menu", href: "/components/navigation-menu/" },
  { title: "Nav List", href: "/components/nav-list/" },
  { title: "Number Field", href: "/components/number-field/" },
  { title: "OTP Field", href: "/components/otp-field/" },
  { title: "Pagination", href: "/components/pagination/" },
  { title: "Popover", href: "/components/popover/" },
  { title: "Preview Card", href: "/components/preview-card/" },
  { title: "Progress", href: "/components/progress/" },
  { title: "Radio", href: "/components/radio/" },
  { title: "Resizable", href: "/components/resizable/" },
  { title: "Scroll Area", href: "/components/scroll-area/" },
  { title: "Select", href: "/components/select/" },
  { title: "Separator", href: "/components/separator/" },
  { title: "Skeleton", href: "/components/skeleton/" },
  { title: "Slider", href: "/components/slider/" },
  { title: "Spinner", href: "/components/spinner/" },
  { title: "Steps", href: "/components/steps/" },
  { title: "Switch", href: "/components/switch/" },
  { title: "Table", href: "/components/table/" },
  { title: "Tabs", href: "/components/tabs/" },
  { title: "Textarea", href: "/components/textarea/" },
  { title: "Theme Toggle", href: "/components/theme-toggle/" },
  { title: "Toast", href: "/components/toast/" },
  { title: "Toggle", href: "/components/toggle/" },
  { title: "Toggle Group", href: "/components/toggle-group/" },
  { title: "Toolbar", href: "/components/toolbar/" },
  { title: "Tooltip", href: "/components/tooltip/" },
];
