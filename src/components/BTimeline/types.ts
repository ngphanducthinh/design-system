// ─────────────────────────────────────────────
// BTimeline types
// ─────────────────────────────────────────────

/** Color of the timeline item dot. */
export type BTimelineItemColor = 'blue' | 'red' | 'green' | 'gray' | (string & {});

/**
 * Overall mode controlling which side labels/content appear on.
 * - `'start'`     — all content on the right of the line (default)
 * - `'end'`       — all content on the left of the line
 * - `'alternate'` — content alternates left/right
 */
export type BTimelineMode = 'start' | 'alternate' | 'end';

/** Dot style presentation. */
export type BTimelineVariant = 'filled' | 'outlined';

/** Layout direction. */
export type BTimelineOrientation = 'vertical' | 'horizontal';

/** Per-item side placement — overrides the global mode for a single item. */
export type BTimelineItemPlacement = 'start' | 'end';

/** Status-based color convenience alias. */
export type BTimelineItemStatus = 'success' | 'processing' | 'error' | 'warning' | 'default';

/**
 * Data-driven item shape used when passing `items` prop to BTimeline.
 * An alternative to the default-slot pattern.
 */
export interface BTimelineItem {
  /** Main content of the item. */
  content?: string;
  /** Dot color — preset name or any CSS color. @default 'blue' */
  color?: BTimelineItemColor;
  /** Title / timestamp shown on the opposing side (alternate / end mode). */
  title?: string;
  /** Custom dot content (string/emoji). Prefer the slot API for rich content. */
  icon?: string;
  /** When true, renders a spinner on this item's dot. @default false */
  loading?: boolean;
  /** Override the global mode for this item — pin it to 'start' or 'end'. */
  placement?: BTimelineItemPlacement;
  /** Additional CSS class(es) to add to the item root. */
  className?: string;
  /** Additional inline style for the item root. */
  style?: string | Record<string, string>;
}
