export enum BInputVariant {
  Outlined = 'outlined',
  Filled = 'filled',
  Borderless = 'borderless',
  Underlined = 'underlined',
}

export enum BInputStatus {
  Error = 'error',
  Warning = 'warning',
}

export interface BInputCountConfig {
  /** Custom character count strategy (e.g., for emoji or CJK). */
  strategy?: (value: string) => number;
  /** Maximum count to display. Triggers exceedFormatter when exceeded. */
  max?: number;
  /** Formatter when count exceeds max. */
  exceedFormatter?: (value: string, config: { max: number }) => string;
  /** Whether to show the count indicator. */
  show?: boolean | ((args: { value: string; count: number; maxLength?: number }) => string);
}

export interface BInputFocusOptions {
  preventScroll?: boolean;
  cursor?: 'start' | 'end' | 'all';
}
