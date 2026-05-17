export enum BTimePickerSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
}

export enum BTimePickerVariant {
  Outlined = 'outlined',
  Filled = 'filled',
  Borderless = 'borderless',
  Underlined = 'underlined',
}

export enum BTimePickerStatus {
  Error = 'error',
  Warning = 'warning',
}

export enum BTimePickerPlacement {
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right',
  TopLeft = 'top-left',
  TopRight = 'top-right',
}

export interface BTimePickerDisabledTime {
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
}
