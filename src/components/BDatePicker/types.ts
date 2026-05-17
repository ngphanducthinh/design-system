export enum BDatePickerType {
  Date = 'date',
  Week = 'week',
  Month = 'month',
  Quarter = 'quarter',
  Year = 'year',
}

export enum BDatePickerSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
}

export enum BDatePickerVariant {
  Outlined = 'outlined',
  Filled = 'filled',
  Borderless = 'borderless',
  Underlined = 'underlined',
}

export enum BDatePickerStatus {
  Error = 'error',
  Warning = 'warning',
}

export enum BDatePickerPlacement {
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right',
  TopLeft = 'top-left',
  TopRight = 'top-right',
}

export interface BDatePickerPreset {
  label: string;
  value: Date | (() => Date);
}

export interface BDatePickerDisabledDateInfo {
  type: `${BDatePickerType}`;
}
