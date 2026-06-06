/**
 * A single item displayed inside `BContextMenu`. Items can be:
 *   - a regular menu entry (with `label`)
 *   - a divider (`divider: true`) — rendered as <hr role="separator">
 */
export interface BContextMenuItem {
  /** Stable identifier used for keyed rendering and selection. */
  key: string;
  /** Visible label. Required unless `divider: true`. */
  label?: string;
  /** Optional icon name forwarded to `BIcon`. */
  icon?: string;
  /** Whether the item is disabled — non-activatable, skipped by keyboard nav. */
  disabled?: boolean;
  /** Render in destructive styling (e.g. "Delete"). */
  danger?: boolean;
  /** Render this item as a separator instead of a regular entry. */
  divider?: boolean;
  /** Per-item callback invoked on activation, before `select` is emitted. */
  onSelect?: () => void;
  /** Nested children (rendered inline as a flat-ish menu). */
  children?: BContextMenuItem[];
}
