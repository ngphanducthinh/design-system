export interface BMentionsOption {
  /** Display label for the mention suggestion. Falls back to `value` if omitted. */
  label?: string;
  /** The value inserted when this option is selected. */
  value: string;
  /** Whether this option is disabled. */
  disabled?: boolean;
}

export enum BMentionsStatus {
  Error = 'error',
  Warning = 'warning',
}

export enum BMentionsVariant {
  Outlined = 'outlined',
  Filled = 'filled',
  Borderless = 'borderless',
}

export enum BMentionsPlacement {
  Top = 'top',
  Bottom = 'bottom',
}
