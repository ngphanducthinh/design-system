import type { CSSProperties, VNode } from 'vue';

// ─────────────────────────────────────────────
// Size / variant tokens
// ─────────────────────────────────────────────

export type BTableSize = 'default' | 'middle' | 'small';

export type BTableSortOrder = 'ascend' | 'descend' | null;

export type BTableFilterValue = (string | number | boolean)[];

export type BTableAlign = 'left' | 'center' | 'right';

export type BTableFixed = 'left' | 'right' | boolean;

export type BTableRowSelectionType = 'checkbox' | 'radio';

export type BTableExpandIconPosition = 'start' | 'end';

// ─────────────────────────────────────────────
// Column definition
// ─────────────────────────────────────────────

export interface BTableSorterResult<T = Record<string, unknown>> {
  column?: BTableColumnType<T>;
  order: BTableSortOrder;
  field?: string | string[];
  columnKey?: string | number;
}

export interface BTableFilterOption {
  text: string;
  value: string | number | boolean;
  children?: BTableFilterOption[];
}

export interface BTableColumnType<T = Record<string, unknown>> {
  /** Column title */
  title?: string;
  /** Column data key — dot-path supported (e.g. 'address.city') */
  dataIndex?: string | string[];
  /** Unique column key (falls back to dataIndex) */
  key?: string | number;
  /** Custom render function or slot name */
  customRender?: (params: { value: unknown; record: T; index: number; column: BTableColumnType<T> }) => VNode | string | number;
  /** Slot name to use for rendering cells */
  customCell?: string;
  /** Text alignment */
  align?: BTableAlign;
  /** Fixed column */
  fixed?: BTableFixed;
  /** Column width (px or CSS value) */
  width?: number | string;
  /** Min width */
  minWidth?: number;
  /** Max width */
  maxWidth?: number;
  /** Custom header cell renderer */
  customHeaderCell?: (column: BTableColumnType<T>) => Record<string, unknown>;
  /** Whether this column is sortable */
  sorter?: boolean | ((a: T, b: T) => number);
  /** Controlled sort order */
  sortOrder?: BTableSortOrder;
  /** Default sort order (uncontrolled) */
  defaultSortOrder?: BTableSortOrder;
  /** Sort directions to cycle through */
  sortDirections?: BTableSortOrder[];
  /** Show sorter tooltip */
  showSorterTooltip?: boolean;
  /** Filter options */
  filters?: BTableFilterOption[];
  /** Whether filter is multiple-select */
  filterMultiple?: boolean;
  /** Controlled filter value */
  filteredValue?: BTableFilterValue;
  /** Default filter value (uncontrolled) */
  defaultFilteredValue?: BTableFilterValue;
  /** Custom filter function */
  onFilter?: (value: string | number | boolean, record: T) => boolean;
  /** Whether to reset current page when filter changes */
  filterResetToDefaultFilteredValue?: boolean;
  /** Filter search (enable search in filter dropdown) */
  filterSearch?: boolean | ((input: string, option: BTableFilterOption) => boolean);
  /** Colspan for header cell */
  colSpan?: number;
  /** Row span for header cell */
  rowSpan?: number;
  /** Ellipsis overflow */
  ellipsis?: boolean | { showTitle?: boolean };
  /** Custom class for the column cells */
  className?: string;
  /** Nested columns (column group) */
  children?: BTableColumnType<T>[];
  /** Whether to show the column toggle in column settings */
  hidden?: boolean;
  /** Label for title (used when title is complex VNode) */
  titleText?: string;
  /** Responsive breakpoints */
  responsive?: ('xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl')[];
  /** Cell style */
  cellStyle?: CSSProperties | ((record: T, rowIndex: number) => CSSProperties);
}

// ─────────────────────────────────────────────
// Row selection
// ─────────────────────────────────────────────

export interface BTableRowSelection<T = Record<string, unknown>> {
  /** 'checkbox' or 'radio' */
  type?: BTableRowSelectionType;
  /** Controlled selected row keys */
  selectedRowKeys?: (string | number)[];
  /** Default selected row keys (uncontrolled) */
  defaultSelectedRowKeys?: (string | number)[];
  /** Callback when selection changes */
  onChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
  /** Get checkbox/radio props per row */
  getCheckboxProps?: (record: T) => Partial<{
    disabled: boolean;
    name: string;
    defaultChecked: boolean;
    checked: boolean;
    indeterminate: boolean;
  }>;
  /** Custom selections in header dropdown */
  selections?: boolean | BTableSelectionItem[];
  /** Fixed the selection column */
  fixed?: BTableFixed;
  /** Column width */
  columnWidth?: number | string;
  /** Column title */
  columnTitle?: string | VNode;
  /** Preserve selected row keys across page changes */
  preserveSelectedRowKeys?: boolean;
  /** Hide the select-all checkbox */
  hideSelectAll?: boolean;
  /** Callback on row select */
  onSelect?: (record: T, selected: boolean, selectedRows: T[], nativeEvent: Event) => void;
  /** Callback on select all */
  onSelectAll?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
  /** Callback on select invert */
  onSelectInvert?: (selectedRowKeys: (string | number)[]) => void;
  /** Callback on select none */
  onSelectNone?: () => void;
  /** Callback on select multiple */
  onSelectMultiple?: (selected: boolean, selectedRows: T[], changeRows: T[]) => void;
}

export interface BTableSelectionItem {
  key: string;
  text: string | VNode;
  onSelect: (currentPageRowKeys: (string | number)[]) => void;
}

// ─────────────────────────────────────────────
// Expandable rows
// ─────────────────────────────────────────────

export interface BTableExpandable<T = Record<string, unknown>> {
  /** Controlled expanded row keys */
  expandedRowKeys?: (string | number)[];
  /** Default expanded row keys (uncontrolled) */
  defaultExpandedRowKeys?: (string | number)[];
  /** Custom expanded row render */
  expandedRowRender?: (record: T, index: number, indent: number, expanded: boolean) => VNode;
  /** Row expand icon */
  expandIcon?: (props: BTableExpandIconProps<T>) => VNode;
  /** Expand on row click */
  expandRowByClick?: boolean;
  /** Row expand change callback */
  onExpand?: (expanded: boolean, record: T) => void;
  /** All expanded rows change callback */
  onExpandedRowsChange?: (expandedRows: (string | number)[]) => void;
  /** Show expand column */
  showExpandColumn?: boolean;
  /** Expand column position */
  expandIconColumnIndex?: number;
  /** Fixed expand column */
  fixed?: BTableFixed;
  /** Column width */
  columnWidth?: number | string;
  /** Indent size */
  indentSize?: number;
  /** Row expandable condition */
  rowExpandable?: (record: T) => boolean;
  /** Child row data key */
  childrenColumnName?: string;
}

export interface BTableExpandIconProps<T = Record<string, unknown>> {
  expanded: boolean;
  record: T;
  onExpand: (record: T, e: MouseEvent) => void;
  expandable: boolean;
}

// ─────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────

export interface BTablePaginationConfig {
  current?: number;
  pageSize?: number;
  total?: number;
  defaultCurrent?: number;
  defaultPageSize?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
  pageSizeOptions?: (string | number)[];
  hideOnSinglePage?: boolean;
  simple?: boolean;
  disabled?: boolean;
  position?: ('topLeft' | 'topCenter' | 'topRight' | 'bottomLeft' | 'bottomCenter' | 'bottomRight')[];
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

// ─────────────────────────────────────────────
// Scroll config
// ─────────────────────────────────────────────

export interface BTableScrollConfig {
  x?: number | string | true;
  y?: number | string;
  scrollToFirstRowOnChange?: boolean;
}

// ─────────────────────────────────────────────
// Sort / filter change info
// ─────────────────────────────────────────────

export interface BTableChangeExtra<T = Record<string, unknown>> {
  currentDataSource: T[];
  action: 'paginate' | 'sort' | 'filter';
}

export type BTableFilterState = Record<string, BTableFilterValue | null>;

// ─────────────────────────────────────────────
// Summary row
// ─────────────────────────────────────────────

export interface BTableSummaryCell {
  index: number;
  colSpan?: number;
  rowSpan?: number;
  align?: BTableAlign;
  value?: unknown;
}

// ─────────────────────────────────────────────
// Row drag config (basic)
// ─────────────────────────────────────────────

export interface BTableRowDragConfig<T = Record<string, unknown>> {
  onDragEnd?: (fromIndex: number, toIndex: number, rows: T[]) => void;
}
