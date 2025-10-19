import type { RouteLocationRaw } from 'vue-router';

export enum BButtonSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
}

export enum BButtonColor {
  Primary = 'primary',
  Secondary = 'secondary',
  Success = 'success',
  Failure = 'failure',
  Warning = 'warning',
  Info = 'info',
}

export enum BButtonVariant {
  Solid = 'solid',
  Outlined = 'outlined',
  Dashed = 'dashed',
  Text = 'text',
  Link = 'link',
}

export enum BIconSize {
  XSmall = 'xs',
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
  XLarge = 'xl',
  XXLarge = 'xxl',
}

export enum BIconVariant {
  Duotone = 'duotone',
  Light = 'light',
  Regular = 'regular',
  SharpLine = 'sharp-line',
  SharpRegular = 'sharp-regular',
  SharpSolid = 'sharp-solid',
  SharpThin = 'sharp-thin',
  Solid = 'solid',
  Thin = 'thin',
}

export enum BIconColor {
  Primary = 'primary',
  Secondary = 'secondary',
  Success = 'success',
  Failure = 'failure',
  Warning = 'warning',
  Info = 'info',
}

export enum BPaginationSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
}

export enum BInputSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
}

export enum BInputVariant {
  Outline = 'outlined',
  Filled = 'filled',
  Borderless = 'borderless',
  Underlined = 'underlined',
}

export interface BSelectOption {
  label: string;
  value: unknown;
}

export interface BCollapseData {
  id: number;
  isOpen: boolean;
}

export interface BTabData {
  id: number;
  isActive: boolean;
}

export interface BBreadcrumbItem {
  text: string;
  href?: string;
  to?: RouteLocationRaw;
}

export enum BTooltipTrigger {
  Hover = 'hover',
  Click = 'click',
  Focus = 'focus',
}

export enum BTooltipPlacement {
  TopLeft = 'top-left',
  TopCenter = 'top-center',
  TopRight = 'top-right',
  RightTop = 'right-top',
  RightCenter = 'right-center',
  RightBottom = 'right-bottom',
  BottomRight = 'bottom-right',
  BottomCenter = 'bottom-center',
  BottomLeft = 'bottom-left',
  LeftBottom = 'left-bottom',
  LeftCenter = 'left-center',
  LeftTop = 'left-top',
}
