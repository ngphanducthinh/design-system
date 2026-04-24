import type { BIconBrandName, BIconName } from './components/BIcon/BIconEnum.ts';
import type { RouteLocationRaw } from 'vue-router';

export enum BCommonSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
}

export enum BCommonColor {
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

export type {
  BCollapseCollapsible,
  BCollapseExpandIconPosition,
  BCollapseSize,
} from './components/BCollapse/types';

export type {
  BDescriptionsItem,
  BDescriptionsLayout,
  BDescriptionsSize,
} from './components/BDescriptions/types';

export interface BTabData {
  id: number;
  isActive: boolean;
}

export interface BBreadcrumbItem {
  text: string;
  href?: string;
  to?: RouteLocationRaw;
}

export enum BAlertType {
  Success = 'success',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
}

export enum BDrawerPlacement {
  Top = 'top',
  Right = 'right',
  Bottom = 'bottom',
  Left = 'left',
}

export enum BDrawerSize {
  Default = 'default',
  Large = 'large',
}

export enum BMessageType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
  Warning = 'warning',
  Loading = 'loading',
}

export enum BNotificationType {
  Success = 'success',
  Info = 'info',
  Warning = 'warning',
  Error = 'error',
}

export enum BNotificationPlacement {
  TopLeft = 'top-left',
  TopRight = 'top-right',
  BottomLeft = 'bottom-left',
  BottomRight = 'bottom-right',
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

export enum BPopconfirmPlacement {
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

export enum BPopconfirmTrigger {
  Hover = 'hover',
  Click = 'click',
  Focus = 'focus',
}

export enum BPopoverPlacement {
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

export enum BPopoverTrigger {
  Hover = 'hover',
  Click = 'click',
  Focus = 'focus',
}

export enum BStepsStatus {
  Wait = 'wait',
  Process = 'process',
  Finish = 'finish',
  Error = 'error',
}

export enum BStepsDirection {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export enum BStepsType {
  Default = 'default',
  Navigation = 'navigation',
  Inline = 'inline',
}

export enum BStepsLabelPlacement {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export enum BSpinSize {
  Small = 'small',
  Default = 'default',
  Large = 'large',
}

export enum BAvatarShape {
  Circle = 'circle',
  Square = 'square',
}

export enum BAvatarSize {
  Small = 'small',
  Default = 'default',
  Large = 'large',
}

export enum BBadgeSize {
  Default = 'default',
  Small = 'small',
}

export enum BBadgeStatus {
  Success = 'success',
  Processing = 'processing',
  Default = 'default',
  Error = 'error',
  Warning = 'warning',
}

export enum BCardSize {
  Default = 'default',
  Small = 'small',
}

export enum BCardType {
  Default = 'default',
  Inner = 'inner',
}

export interface BCardTabItem {
  key: string;
  tab: string;
  disabled?: boolean;
}

export enum BEmptyImage {
  Default = 'default',
  Simple = 'simple',
}

export interface BStepItem {
  title: string;
  subTitle?: string;
  description?: string;
  status?: `${BStepsStatus}`;
  icon?: `${BIconName}` | `${BIconBrandName}`;
  disabled?: boolean;
}
