export enum BDropdownTrigger {
  Hover = 'hover',
  Click = 'click',
  ContextMenu = 'contextMenu',
}

export enum BDropdownPlacement {
  Bottom = 'bottom',
  BottomLeft = 'bottomLeft',
  BottomRight = 'bottomRight',
  Top = 'top',
  TopLeft = 'topLeft',
  TopRight = 'topRight',
}

export interface BDropdownMenuItem {
  /** Unique key for the menu item. */
  key: string | number;
  /** Display label text. */
  label: string;
  /** Icon name to show before the label. */
  icon?: string;
  /** Whether this item is disabled. */
  disabled?: boolean;
  /** Whether this item is a danger/destructive action. */
  danger?: boolean;
  /** Nested children for sub-menus. */
  children?: BDropdownMenuItem[];
  /** If set to 'divider', renders a separator line. */
  type?: 'divider' | 'group';
  /** Group title when type is 'group'. */
  title?: string;
}

export interface BDropdownMenuProps {
  /** Array of menu items to render. */
  items: BDropdownMenuItem[];
  /** Currently selected keys. */
  selectedKeys?: (string | number)[];
  /** Whether the menu is selectable. */
  selectable?: boolean;
  /** Allow multiple selection. */
  multiple?: boolean;
}
