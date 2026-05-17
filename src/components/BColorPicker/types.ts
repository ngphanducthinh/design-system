export enum BColorPickerFormat {
  Hex = 'hex',
  Rgb = 'rgb',
  Hsl = 'hsl',
  Hsb = 'hsb',
}

export enum BColorPickerSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
}

export enum BColorPickerTrigger {
  Click = 'click',
  Hover = 'hover',
}

export enum BColorPickerPlacement {
  TopLeft = 'top-left',
  TopCenter = 'top-center',
  TopRight = 'top-right',
  BottomLeft = 'bottom-left',
  BottomCenter = 'bottom-center',
  BottomRight = 'bottom-right',
}

export interface BColorPickerPreset {
  label: string;
  colors: string[];
  defaultOpen?: boolean;
}

export interface BColorHsb {
  h: number;
  s: number;
  b: number;
  a: number;
}

export interface BColorRgb {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface BColorHsl {
  h: number;
  s: number;
  l: number;
  a: number;
}
