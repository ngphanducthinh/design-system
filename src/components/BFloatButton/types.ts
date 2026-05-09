export enum BFloatButtonShape {
  Circle = 'circle',
  Square = 'square',
}

export enum BFloatButtonType {
  Default = 'default',
  Primary = 'primary',
}

export enum BFloatButtonTrigger {
  Click = 'click',
  Hover = 'hover',
}

export enum BFloatButtonGroupPlacement {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

export interface BFloatButtonBadgeProps {
  /** Badge count number */
  count?: number;
  /** Whether to show badge even when count is 0 */
  showZero?: boolean;
  /** Max count to display before showing overflow text */
  overflowCount?: number;
  /** Show a red dot instead of a count */
  dot?: boolean;
  /** Custom badge text color */
  color?: string;
}
