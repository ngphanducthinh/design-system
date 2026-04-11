import type { CSSProperties } from 'vue';

// ─────────────────────────────────────────────
// Enums & literals
// ─────────────────────────────────────────────
export type BDescriptionsLayout = 'horizontal' | 'vertical';
export type BDescriptionsSize = 'default' | 'middle' | 'small';

// ─────────────────────────────────────────────
// Item definition (passed via `items` prop)
// ─────────────────────────────────────────────
export interface BDescriptionsItem {
  /** Label displayed for this description item */
  label?: string;
  /** Content to render for this item (text shorthand; use slots for rich content) */
  children?: string;
  /** Number of columns this item spans. @default 1 */
  span?: number;
  /** Custom style for the label cell */
  labelStyle?: CSSProperties;
  /** Custom style for the content cell */
  contentStyle?: CSSProperties;
}
