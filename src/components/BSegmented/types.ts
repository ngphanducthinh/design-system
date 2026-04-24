export type BSegmentedSize = 'small' | 'default' | 'large';

/** Fully resolved option object used internally. */
export interface BSegmentedOption {
  /** Display text for this option. */
  label: string;
  /** Value emitted when this option is selected. */
  value: string | number;
  /** Whether this individual option is disabled. @default false */
  disabled?: boolean;
  /** Optional icon content (text, emoji, or icon component output). */
  icon?: string;
}

/**
 * Accepts either a shorthand primitive (used as both label and value)
 * or a full option object.
 */
export type BSegmentedRawOption = string | number | BSegmentedOption;
