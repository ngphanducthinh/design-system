export enum BCascaderExpandTrigger {
  Click = 'click',
  Hover = 'hover',
}

export enum BCascaderPlacement {
  BottomLeft = 'bottomLeft',
  BottomRight = 'bottomRight',
  TopLeft = 'topLeft',
  TopRight = 'topRight',
}

export enum BCascaderSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
}

export enum BCascaderStatus {
  Error = 'error',
  Warning = 'warning',
}

export interface BCascaderOption {
  /** The value used for identification. */
  value: string | number;
  /** The display label. */
  label: string;
  /** Whether this option is disabled. */
  disabled?: boolean;
  /** Child options for the next level. */
  children?: BCascaderOption[];
  /** Whether this is a leaf node (used with lazy loading). */
  isLeaf?: boolean;
}

export interface BCascaderFieldNames {
  /** Custom field name for label. */
  label?: string;
  /** Custom field name for value. */
  value?: string;
  /** Custom field name for children. */
  children?: string;
}

export type BCascaderValueType = (string | number)[];

export interface BCascaderShowSearchConfig {
  /** Custom filter function. */
  filter?: (inputValue: string, path: BCascaderOption[]) => boolean;
  /** Maximum number of search results. */
  limit?: number;
  /** Custom render function for search results. */
  render?: (inputValue: string, path: BCascaderOption[]) => string;
}
