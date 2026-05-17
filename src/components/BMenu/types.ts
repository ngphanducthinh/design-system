import type { ComputedRef, InjectionKey } from 'vue';

// ─────────────────────────────────────────────
// Enums & Literals
// ─────────────────────────────────────────────
export type BMenuMode = 'horizontal' | 'vertical' | 'inline';
export type BMenuTheme = 'light' | 'dark';
export type BMenuTriggerAction = 'hover' | 'click';

// ─────────────────────────────────────────────
// Item types (data-driven API)
// ─────────────────────────────────────────────
export interface BMenuItemType {
  key: string;
  label?: string;
  icon?: string;
  disabled?: boolean;
  danger?: boolean;
  title?: string;
  extra?: string;
}

export interface BMenuSubMenuType {
  key: string;
  label?: string;
  icon?: string;
  disabled?: boolean;
  children?: BMenuItemUnion[];
  popupClassName?: string;
}

export interface BMenuItemGroupType {
  type: 'group';
  key?: string;
  label?: string;
  children?: BMenuItemType[];
}

export interface BMenuDividerType {
  type: 'divider';
  key?: string;
  dashed?: boolean;
}

export type BMenuItemUnion =
  | BMenuItemType
  | BMenuSubMenuType
  | BMenuItemGroupType
  | BMenuDividerType;

// ─────────────────────────────────────────────
// Event payloads
// ─────────────────────────────────────────────
export interface BMenuClickInfo {
  key: string;
  keyPath: string[];
  domEvent: MouseEvent | KeyboardEvent;
}

export interface BMenuSelectInfo {
  key: string;
  keyPath: string[];
  selectedKeys: string[];
  domEvent: MouseEvent | KeyboardEvent;
}

// ─────────────────────────────────────────────
// Context (provided by BMenu to children)
// ─────────────────────────────────────────────
export interface BMenuContext {
  mode: ComputedRef<BMenuMode>;
  theme: ComputedRef<BMenuTheme>;
  inlineCollapsed: ComputedRef<boolean>;
  inlineIndent: ComputedRef<number>;
  selectedKeys: ComputedRef<string[]>;
  openKeys: ComputedRef<string[]>;
  multiple: ComputedRef<boolean>;
  selectable: ComputedRef<boolean>;
  triggerSubMenuAction: ComputedRef<BMenuTriggerAction>;
  subMenuOpenDelay: ComputedRef<number>;
  subMenuCloseDelay: ComputedRef<number>;
  onItemClick: (info: BMenuClickInfo) => void;
  onOpenChange: (key: string, open: boolean) => void;
  registerKeyPath: (key: string, path: string[]) => void;
}

export const BMenuContextKey: InjectionKey<BMenuContext> = Symbol('BMenuContext');

// ─────────────────────────────────────────────
// SubMenu context (nesting depth)
// ─────────────────────────────────────────────
export interface BMenuSubMenuContext {
  level: number;
  keyPath: string[];
}

export const BMenuSubMenuContextKey: InjectionKey<BMenuSubMenuContext> =
  Symbol('BMenuSubMenuContext');

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
export function isSubMenu(item: BMenuItemUnion): item is BMenuSubMenuType {
  return 'children' in item && ('type' in item ? item.type !== 'group' : true);
}

export function isItemGroup(item: BMenuItemUnion): item is BMenuItemGroupType {
  return 'type' in item && item.type === 'group';
}

export function isDivider(item: BMenuItemUnion): item is BMenuDividerType {
  return 'type' in item && item.type === 'divider';
}

export function isMenuItem(item: BMenuItemUnion): item is BMenuItemType {
  return !isSubMenu(item) && !isItemGroup(item) && !isDivider(item);
}
