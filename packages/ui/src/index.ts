"use client";

// Every export in this barrel is a client component, so the barrel itself is a
// client boundary. Marking it here means a consumer can `import { Button } from
// "@dofortech/pretty-ui"` directly inside a React Server Component without
// having to wrap it — which is the import everyone writes first.

export { Accordion } from "./components/accordion";
export type {
  AccordionVariant,
  AccordionRootProps,
  AccordionItemProps,
  AccordionHeaderProps,
  AccordionTriggerProps,
  AccordionPanelProps,
} from "./components/accordion";

export { Button } from "./components/button";
export type { ButtonProps, ButtonVariant, ButtonTone, ButtonSize } from "./components/button";

export { Checkbox, CheckboxGroup } from "./components/checkbox";
export type {
  CheckboxProps,
  CheckboxSize,
  CheckboxTone,
  CheckboxGroupProps,
  CheckboxGroupOrientation,
} from "./components/checkbox";

export { Dialog, AlertDialog } from "./components/dialog";
export type {
  DialogSize,
  DialogFooterAlign,
  DialogRootProps,
  DialogTriggerProps,
  DialogPopupProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
  DialogFooterProps,
  AlertDialogRootProps,
  AlertDialogTriggerProps,
} from "./components/dialog";

export { Drawer } from "./components/drawer";
export type {
  DrawerSide,
  DrawerSize,
  DrawerVariant,
  DrawerSnapPoint,
  DrawerFooterAlign,
  DrawerRootProps,
  DrawerTriggerProps,
  DrawerPopupProps,
  DrawerHandleProps,
  DrawerContentProps,
  DrawerTitleProps,
  DrawerDescriptionProps,
  DrawerCloseProps,
  DrawerFooterProps,
  DrawerSwipeAreaProps,
  DrawerVirtualKeyboardProviderProps,
} from "./components/drawer";

export { Field, FieldRoot, FieldLabel, FieldDescription, FieldError, FieldItem } from "./components/field";
export type {
  FieldRootProps,
  FieldLabelProps,
  FieldDescriptionProps,
  FieldErrorProps,
  FieldItemProps,
} from "./components/field";

export { Fieldset, FieldsetRoot, FieldsetLegend } from "./components/fieldset";
export type { FieldsetRootProps, FieldsetLegendProps } from "./components/fieldset";

export { Form } from "./components/form";
export type { FormProps, FormValidationMode } from "./components/form";

export { Input } from "./components/input";
export type { InputProps, InputSize, InputVariant } from "./components/input";

export { Select } from "./components/select";
export type {
  SelectRootProps,
  SelectLabelProps,
  SelectTriggerProps,
  SelectValueProps,
  SelectIconProps,
  SelectPopupProps,
  SelectItemProps,
  SelectGroupProps,
  SelectGroupLabelProps,
  SelectSeparatorProps,
  SelectSize,
  SelectVariant,
} from "./components/select";

export { Switch } from "./components/switch";
export type { SwitchProps, SwitchSize } from "./components/switch";

export { Tabs } from "./components/tabs";
export type {
  TabsVariant,
  TabsRootProps,
  TabsListProps,
  TabsTabProps,
  TabsIndicatorProps,
  TabsPanelProps,
} from "./components/tabs";

export { Tooltip } from "./components/tooltip";
export type {
  TooltipProviderProps,
  TooltipRootProps,
  TooltipTriggerProps,
  TooltipPopupProps,
  TooltipArrowProps,
} from "./components/tooltip";
