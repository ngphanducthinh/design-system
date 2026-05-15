export interface BAutoCompleteOption {
  /** Display label for the option. Falls back to `value` if omitted. */
  label?: string;
  /** The value submitted when this option is selected. */
  value: string;
  /** Whether this option is disabled. */
  disabled?: boolean;
}

export enum BAutoCompleteStatus {
  Error = 'error',
  Warning = 'warning',
}

export enum BAutoCompleteVariant {
  Outlined = 'outlined',
  Filled = 'filled',
  Borderless = 'borderless',
}
