/**
 * BDivider - component-specific types
 */

/**
 * Direction of the divider line.
 * - `'horizontal'` – full-width block separator (default)
 * - `'vertical'`   – inline separator between text/links
 */
export type BDividerOrientation = 'horizontal' | 'vertical';

/**
 * Visual style of the divider line.
 * Mirrors AntD v5.20+ `variant` prop.
 */
export type BDividerVariant = 'solid' | 'dashed' | 'dotted';

/**
 * Vertical spacing size for horizontal dividers.
 * AntD v5.25+ `size` prop.
 */
export type BDividerSize = 'small' | 'medium' | 'large';

/**
 * Horizontal position of the embedded title text.
 * AntD `titlePlacement` prop (note: AntD also accepts `'left'`/`'right'`
 * on the legacy `orientation` prop - we unify under `titlePlacement`).
 */
export type BDividerTitlePlacement = 'start' | 'center' | 'end';
