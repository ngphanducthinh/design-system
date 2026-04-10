import type { ComputedRef, InjectionKey } from 'vue';

// ─────────────────────────────────────────────
// Enums & literals
// ─────────────────────────────────────────────
export type BCollapseCollapsible = 'header' | 'icon' | 'disabled';
export type BCollapseExpandIconPosition = 'start' | 'end';
export type BCollapseSize = 'default' | 'small';

// ─────────────────────────────────────────────
// Group → Panel injection
// ─────────────────────────────────────────────
export interface BCollapseGroupContext {
  /** Check whether a panel key is currently active. */
  isActive: (key: string | number) => boolean;
  /** Toggle a panel open/closed. */
  toggle: (key: string | number) => void;
  /** Group-level collapsible override. */
  collapsible: ComputedRef<BCollapseCollapsible | undefined>;
  /** Group-level expand icon position. */
  expandIconPosition: ComputedRef<BCollapseExpandIconPosition>;
  /** Whether the group is borderless. */
  bordered: ComputedRef<boolean>;
  /** Whether the group is in ghost mode. */
  ghost: ComputedRef<boolean>;
  /** Size of the collapse group. */
  size: ComputedRef<BCollapseSize>;
}

export const BCollapseGroupContextKey: InjectionKey<BCollapseGroupContext> = Symbol(
  'BCollapseGroupContext',
);
