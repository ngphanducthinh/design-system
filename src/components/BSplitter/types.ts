import type { InjectionKey, VNode } from 'vue';

export type BSplitterOrientation = 'horizontal' | 'vertical';

/**
 * Per-side collapsible config on a panel.
 * `start` = collapse toward the previous (left/top) panel.
 * `end`   = collapse toward the next (right/bottom) panel.
 */
export interface BSplitterPanelCollapsible {
  start?: boolean;
  end?: boolean;
}

/**
 * Splitter-level collapsible config (motion + custom icons).
 */
export interface BSplitterCollapsible {
  /** Whether the size change should animate (CSS transition). @default true */
  motion?: boolean;
  /** Custom icon nodes for the collapse buttons. */
  icon?: {
    start?: VNode | string;
    end?: VNode | string;
  };
}

/** Resolved per-panel configuration extracted from slot VNodes. */
export interface BSplitterPanelConfig {
  /** Panel index (0-based). */
  index: number;
  size?: number | string;
  defaultSize?: number | string;
  min?: number | string;
  max?: number | string;
  resizable: boolean;
  collapsible: BSplitterPanelCollapsible | false;
  destroyOnHidden: boolean;
  /** Default slot content for the panel. */
  content?: VNode[];
}

/** Context provided by BSplitter to its children (currently unused; kept for future). */
export interface BSplitterContext {
  orientation: 'horizontal' | 'vertical';
}

export const BSplitterContextKey: InjectionKey<BSplitterContext> = Symbol('BSplitterContext');
