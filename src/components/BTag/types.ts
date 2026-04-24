export type BTagPresetColor =
  | 'default'
  | 'success'
  | 'processing'
  | 'error'
  | 'warning'
  | 'magenta'
  | 'red'
  | 'volcano'
  | 'orange'
  | 'gold'
  | 'lime'
  | 'green'
  | 'cyan'
  | 'blue'
  | 'geekblue'
  | 'purple';

/**
 * Accepts a preset color name or any valid CSS color string.
 */
export type BTagColor = BTagPresetColor | (string & {});

export type BTagVariant = 'filled' | 'outlined';

export type BTagSize = 'small' | 'default' | 'large';
