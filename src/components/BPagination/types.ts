/** Size options for BPagination. */
export type BPaginationSize = 'small' | 'default' | 'large';

/** Alignment options for BPagination. */
export type BPaginationAlign = 'start' | 'center' | 'end';

/** Simple mode configuration. */
export type BPaginationSimple = boolean | { readOnly?: boolean };

/** Quick jumper configuration. */
export type BPaginationQuickJumper = boolean | { goButton?: boolean };

/** Function to render total display text. */
export type BPaginationShowTotal = (total: number, range: [number, number]) => string;
