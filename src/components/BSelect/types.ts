export interface BSelectOption {
  /** Display label for the option. Falls back to `value` if omitted. */
  label?: string;
  /** The value submitted when this option is selected. */
  value: string | number;
  /** Whether this option is disabled. */
  disabled?: boolean;
  /** Grouping: nested options under this group label. */
  options?: BSelectOption[];
}

export enum BSelectMode {
  Multiple = 'multiple',
  Tags = 'tags',
}

export enum BSelectVariant {
  Outlined = 'outlined',
  Filled = 'filled',
  Borderless = 'borderless',
}

export enum BSelectStatus {
  Error = 'error',
  Warning = 'warning',
}

export enum BSelectPlacement {
  BottomLeft = 'bottomLeft',
  BottomRight = 'bottomRight',
  TopLeft = 'topLeft',
  TopRight = 'topRight',
}

export interface BSelectFieldNames {
  label?: string;
  value?: string;
  options?: string;
  groupLabel?: string;
}
