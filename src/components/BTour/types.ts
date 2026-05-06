import type { InjectionKey } from 'vue';

// ─────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────

export enum BTourPlacement {
  Center = 'center',
  Top = 'top',
  TopLeft = 'topLeft',
  TopRight = 'topRight',
  Bottom = 'bottom',
  BottomLeft = 'bottomLeft',
  BottomRight = 'bottomRight',
  Left = 'left',
  LeftTop = 'leftTop',
  LeftBottom = 'leftBottom',
  Right = 'right',
  RightTop = 'rightTop',
  RightBottom = 'rightBottom',
}

export enum BTourType {
  Default = 'default',
  Primary = 'primary',
}

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface BTourArrowOptions {
  /** Point the arrow at the center of the target element. */
  pointAtCenter?: boolean;
}

export interface BTourGapOptions {
  /** Pixel offset between the highlight box and the target element. */
  offset?: number | [number, number];
  /** Border-radius of the highlight box (px). */
  radius?: number;
}

export interface BTourButtonProps {
  children?: string;
  onClick?: () => void;
  className?: string;
  style?: Record<string, string>;
}

export interface BTourScrollIntoViewOptions {
  behavior?: ScrollBehavior;
  block?: ScrollLogicalPosition;
  inline?: ScrollLogicalPosition;
}

export interface BTourStep {
  /** Title of the step. */
  title: string;
  /** Description text for the step. */
  description?: string;
  /** Cover image or video URL shown above title, or arbitrary HTML. */
  cover?: string;
  /**
   * CSS selector string, HTMLElement reference, or getter function
   * returning an element. Passing `null` centers the tour popup.
   */
  target?: string | HTMLElement | (() => HTMLElement | null) | null;
  /** Arrow configuration for this step (overrides Tour-level). */
  arrow?: boolean | BTourArrowOptions;
  /** Placement for this step (overrides Tour-level). */
  placement?: `${BTourPlacement}`;
  /** Mask configuration for this step (overrides Tour-level). */
  mask?: boolean | { style?: Record<string, string>; color?: string };
  /** Type variant for this step (overrides Tour-level). */
  type?: `${BTourType}`;
  /** Custom next-button props. */
  nextButtonProps?: BTourButtonProps;
  /** Custom prev-button props. */
  prevButtonProps?: BTourButtonProps;
  /** Custom close icon for this step. */
  closeIcon?: boolean | string;
  /** Scroll-into-view options for this step. */
  scrollIntoViewOptions?: boolean | BTourScrollIntoViewOptions;
  /** Fired when this step's close button is clicked. */
  onClose?: () => void;
}

// ─────────────────────────────────────────────
// Internal computed step (resolved)
// ─────────────────────────────────────────────

export interface BTourResolvedStep extends BTourStep {
  resolvedTarget: HTMLElement | null;
  index: number;
}

// ─────────────────────────────────────────────
// Injection key (unused currently — kept for extensibility)
// ─────────────────────────────────────────────

export const BTourContextKey: InjectionKey<null> = Symbol('BTourContext');
