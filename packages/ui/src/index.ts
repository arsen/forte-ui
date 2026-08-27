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

export { Avatar } from "./components/avatar";
export type {
  AvatarSize,
  AvatarShape,
  AvatarVariant,
  AvatarTone,
  AvatarBadgeTone,
  AvatarBadgePlacement,
  AvatarRootProps,
  AvatarImageProps,
  AvatarFallbackProps,
  AvatarBadgeProps,
  AvatarGroupProps,
} from "./components/avatar";

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

export { Collapsible } from "./components/collapsible";
export type {
  CollapsibleVariant,
  CollapsibleRootProps,
  CollapsibleTriggerProps,
  CollapsiblePanelProps,
} from "./components/collapsible";

export { ColorPicker, DEFAULT_SWATCHES } from "./components/color-picker";
export type {
  ColorPickerFormat,
  ColorPickerChangeReason,
  ColorPickerChangeDetails,
  ColorPickerRootProps,
  ColorPickerTriggerProps,
  ColorPickerPopupProps,
  ColorPickerPanelProps,
  ColorPickerRowProps,
  ColorPickerAreaProps,
  ColorPickerHueSliderProps,
  ColorPickerAlphaSliderProps,
  ColorPickerSwatchesProps,
  ColorPickerSwatchProps,
  ColorPickerPreviewProps,
  ColorPickerValueProps,
  ColorPickerFormatProps,
  ColorPickerInputProps,
  ColorPickerEyeDropperProps,
  ColorPickerHiddenInputProps,
  Hsva,
  Rgba,
} from "./components/color-picker";

export { Dialog, AlertDialog, useDialog } from "./components/dialog";
export type {
  DialogSize,
  DialogFooterAlign,
  DialogRootProps,
  DialogTriggerProps,
  DialogPopupProps,
  DialogSurfaceProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
  DialogFooterProps,
  AlertDialogRootProps,
  AlertDialogTriggerProps,
  DialogProviderProps,
  DialogApi,
  DialogManager,
  DialogLabels,
  DialogMessageOptions,
  DialogAlertOptions,
  DialogConfirmOptions,
  DialogConfirmWithInputOptions,
  DialogShowOptions,
  CustomDialogProps,
  CustomDialogComponent,
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

export { Menu } from "./components/menu";
export type {
  MenuItemTone,
  MenuRootProps,
  MenuTriggerProps,
  MenuPopupProps,
  MenuItemProps,
  MenuLinkItemProps,
  MenuCheckboxItemProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuGroupProps,
  MenuGroupLabelProps,
  MenuSeparatorProps,
  MenuSubmenuRootProps,
  MenuSubmenuTriggerProps,
  MenuShortcutProps,
} from "./components/menu";

export { Menubar } from "./components/menubar";
export type {
  MenubarProps,
  MenubarVariant,
  MenubarOrientation,
} from "./components/menubar";

export { NumberField } from "./components/number-field";
export type {
  NumberFieldSize,
  NumberFieldVariant,
  NumberFieldScrubDirection,
  NumberFieldRootProps,
  NumberFieldGroupProps,
  NumberFieldInputProps,
  NumberFieldIncrementProps,
  NumberFieldDecrementProps,
  NumberFieldScrubAreaProps,
  NumberFieldScrubAreaCursorProps,
} from "./components/number-field";

export { OTPField } from "./components/otp-field";
export type {
  OTPFieldSize,
  OTPFieldVariant,
  OTPFieldValidationType,
  OTPFieldRootProps,
  OTPFieldInputProps,
  OTPFieldSeparatorProps,
} from "./components/otp-field";

export { Popover } from "./components/popover";
export type {
  PopoverSize,
  PopoverFooterAlign,
  PopoverRootProps,
  PopoverTriggerProps,
  PopoverPopupProps,
  PopoverArrowProps,
  PopoverTitleProps,
  PopoverDescriptionProps,
  PopoverCloseProps,
  PopoverFooterProps,
  PopoverViewportProps,
} from "./components/popover";

export { PreviewCard } from "./components/preview-card";
export type {
  PreviewCardSize,
  PreviewCardRootProps,
  PreviewCardTriggerProps,
  PreviewCardPopupProps,
  PreviewCardArrowProps,
  PreviewCardViewportProps,
} from "./components/preview-card";

export { Progress, ProgressCircle } from "./components/progress";
export type {
  ProgressSize,
  ProgressTone,
  ProgressRootProps,
  ProgressLabelProps,
  ProgressValueProps,
  ProgressTrackProps,
  ProgressIndicatorProps,
  ProgressCircleSize,
  ProgressCircleTone,
  ProgressCircleRootProps,
  ProgressCircleTrackProps,
  ProgressCircleIndicatorProps,
  ProgressCircleValueProps,
  ProgressCircleLabelProps,
} from "./components/progress";

export { Radio, RadioGroup } from "./components/radio";
export type {
  RadioProps,
  RadioSize,
  RadioTone,
  RadioGroupProps,
  RadioGroupOrientation,
} from "./components/radio";

export { ScrollArea } from "./components/scroll-area";
export type {
  ScrollAreaScrollbarVisibility,
  ScrollAreaRootProps,
  ScrollAreaViewportProps,
  ScrollAreaContentProps,
  ScrollAreaScrollbarProps,
  ScrollAreaThumbProps,
  ScrollAreaCornerProps,
} from "./components/scroll-area";

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

export { Separator } from "./components/separator";
export type {
  SeparatorProps,
  SeparatorOrientation,
  SeparatorVariant,
} from "./components/separator";

export { Slider } from "./components/slider";
export type {
  SliderSize,
  SliderTone,
  SliderRootProps,
  SliderLabelProps,
  SliderValueProps,
  SliderControlProps,
  SliderTrackProps,
  SliderIndicatorProps,
  SliderThumbProps,
} from "./components/slider";

export { Spinner } from "./components/spinner";
export type {
  SpinnerProps,
  SpinnerVariant,
  SpinnerSize,
  SpinnerTone,
  SpinnerLabelPlacement,
} from "./components/spinner";

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

export { Textarea } from "./components/textarea";
export type {
  TextareaProps,
  TextareaSize,
  TextareaVariant,
  TextareaResize,
} from "./components/textarea";

export { Toast, useToast } from "./components/toast";
export type {
  ToastType,
  ToastPosition,
  ToastSwipeDirection,
  ToastData,
  ToastObject,
  ToastActionOptions,
  ToastOptions,
  ToastMessage,
  ToastHandle,
  ToastPromiseOptions,
  ToastApi,
  ToastManager,
  UseToastReturn,
  ToastProviderProps,
  ToastViewportProps,
  ToastItemProps,
  ToastIconProps,
  ToastTitleProps,
  ToastDescriptionProps,
  ToastActionProps,
  ToastCloseProps,
} from "./components/toast";

export { Toggle, ToggleGroup } from "./components/toggle";
export type {
  ToggleProps,
  ToggleVariant,
  ToggleTone,
  ToggleSize,
  ToggleGroupProps,
  ToggleGroupOrientation,
} from "./components/toggle";

export { Tooltip } from "./components/tooltip";
export type {
  TooltipProviderProps,
  TooltipRootProps,
  TooltipTriggerProps,
  TooltipPopupProps,
  TooltipArrowProps,
} from "./components/tooltip";
