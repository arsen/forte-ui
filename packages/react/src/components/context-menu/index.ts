export { ContextMenu } from "./ContextMenu";
export type {
  ContextMenuRootProps,
  ContextMenuTriggerProps,
} from "./ContextMenu";

/*
 * The rest of the namespace is the Menu parts, so their prop types are the
 * Menu ones too. Aliased rather than redeclared: `ContextMenu.Item` and
 * `Menu.Item` are one component, and two names for one type is the honest way
 * to say so — a second interface would be a second thing to keep in step.
 */
export type {
  MenuItemTone as ContextMenuItemTone,
  MenuPopupProps as ContextMenuPopupProps,
  MenuItemProps as ContextMenuItemProps,
  MenuLinkItemProps as ContextMenuLinkItemProps,
  MenuCheckboxItemProps as ContextMenuCheckboxItemProps,
  MenuRadioGroupProps as ContextMenuRadioGroupProps,
  MenuRadioItemProps as ContextMenuRadioItemProps,
  MenuGroupProps as ContextMenuGroupProps,
  MenuGroupLabelProps as ContextMenuGroupLabelProps,
  MenuSeparatorProps as ContextMenuSeparatorProps,
  MenuSubmenuRootProps as ContextMenuSubmenuRootProps,
  MenuSubmenuTriggerProps as ContextMenuSubmenuTriggerProps,
  MenuShortcutProps as ContextMenuShortcutProps,
} from "../menu/Menu";
