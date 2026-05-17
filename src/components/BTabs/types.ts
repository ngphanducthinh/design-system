import type { ComputedRef, InjectionKey, VNode } from 'vue';

export type BTabsType = 'line' | 'card' | 'editable-card';
export type BTabsPlacement = 'top' | 'bottom' | 'left' | 'right';
export type BTabsSize = 'small' | 'middle' | 'large';

export interface BTabItem {
  /** Unique identifier for the tab. */
  key: string;
  /** Tab header text or VNode. */
  label?: string | VNode;
  /** Whether the tab is disabled. @default false */
  disabled?: boolean;
  /** Whether the close button is shown (editable-card only). @default true */
  closable?: boolean;
  /** Whether to destroy content when tab is hidden. @default false */
  destroyOnHidden?: boolean;
  /** Whether to force render content even when not active. @default false */
  forceRender?: boolean;
  /** Whether to keep this tab's component state alive when switching away. Overrides global keepAlive. */
  keepAlive?: boolean;
}

// ─────────────────────────────────────────────
// BTabPane registration (provide/inject)
// ─────────────────────────────────────────────

export interface BTabPaneRegistration {
  /** Unique key for this pane. */
  key: string;
  /** Tab label (text or VNode). */
  label?: string | VNode;
  /** Whether tab is disabled. */
  disabled?: boolean;
  /** Whether close button shows in editable-card mode. */
  closable?: boolean;
  /** Whether to destroy when hidden. */
  destroyOnHidden?: boolean;
  /** Whether to force render even when inactive. */
  forceRender?: boolean;
  /** Per-pane keepAlive override. */
  keepAlive?: boolean;
  /** Render function for the pane content (from BTabPane's default slot). */
  renderContent: () => VNode[];
  /** Optional render function for custom label (from BTabPane's tab slot). */
  renderLabel?: () => VNode[];
}

// ─────────────────────────────────────────────
// Context injected from BTabs to BTabPane children
// ─────────────────────────────────────────────

export interface BTabsContext {
  /** Currently active tab key. */
  activeKey: ComputedRef<string>;
  /** Tab type. */
  type: ComputedRef<BTabsType>;
  /** Tab size. */
  size: ComputedRef<BTabsSize>;
  /** Tab placement. */
  placement: ComputedRef<BTabsPlacement>;
  /** Global keepAlive setting. */
  keepAlive: ComputedRef<boolean>;
  /** Global destroyOnHidden setting. */
  destroyOnHidden: ComputedRef<boolean>;
  /** Register a pane. */
  register: (pane: BTabPaneRegistration) => void;
  /** Unregister a pane by key. */
  unregister: (key: string) => void;
  /** Update a registered pane's data (when props change reactively). */
  update: (key: string, pane: BTabPaneRegistration) => void;
}

export const BTabsContextKey: InjectionKey<BTabsContext> = Symbol('BTabsContext');
