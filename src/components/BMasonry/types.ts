// ─── BMasonry Types ───────────────────────────────────────────────────────────

/**
 * Responsive breakpoint keys matching Ant Design / Tailwind conventions.
 */
export type BMasonryBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

/**
 * Responsive column/gutter value — either a fixed number or a breakpoint map.
 * @example 3
 * @example { xs: 1, sm: 2, md: 3, lg: 4 }
 */
export type BMasonryResponsive = number | Partial<Record<BMasonryBreakpoint, number>>;

/**
 * A single item passed to the `items` prop.
 */
export interface BMasonryItem {
  /** Unique identifier. */
  key: string | number;
  /** Hint for the item's intrinsic height (px). Used for SSR/initial layout. */
  height?: number;
  /** Pin the item to a specific 1-based column index. */
  column?: number;
  /** Arbitrary data forwarded to `itemRender` / the default slot. */
  data?: unknown;
}

/**
 * Payload emitted by `layoutChange`.
 */
export interface BMasonryLayoutChangePayload {
  /** Resolved column count at the time of the change. */
  columns: number;
  /** Column index (0-based) each item was placed in, keyed by item key. */
  columnMap: Record<string | number, number>;
}

/**
 * classNames / styles callback signature — mirrors AntD's semantic-DOM API.
 * Receives the item and its resolved column index; returns a string/object/undefined.
 */
export type BMasonryClassNamesFunc = (
  item: BMasonryItem,
  columnIndex: number,
) => string | string[] | Record<string, boolean> | undefined;

export type BMasonryStylesFunc = (
  item: BMasonryItem,
  columnIndex: number,
) => Record<string, string> | undefined;

/**
 * Either a plain record of semantic-DOM names → class, or a per-item function.
 * Supported semantic keys: `root`, `column`, `item`.
 */
export type BMasonryClassNames =
  | Partial<{ root: string; column: string; item: BMasonryClassNamesFunc | string }>
  | BMasonryClassNamesFunc;

export type BMasonryStyles =
  | Partial<{
      root: Record<string, string>;
      column: Record<string, string>;
      item: BMasonryStylesFunc | Record<string, string>;
    }>
  | BMasonryStylesFunc;
