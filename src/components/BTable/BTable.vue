<script setup lang="ts" generic="T extends Record<string, unknown> = Record<string, unknown>">
import type { CSSProperties } from 'vue';
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import type {
  BTableChangeExtra,
  BTableColumnType,
  BTableExpandable,
  BTableFilterOption,
  BTableFilterState,
  BTableFilterValue,
  BTablePaginationConfig,
  BTableRowSelection,
  BTableScrollConfig,
  BTableSize,
  BTableSortOrder,
  BTableSorterResult,
} from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

const {
  dataSource = [],
  columns = [],
  rowKey = 'key',
  size = 'default',
  bordered = false,
  loading = false,
  showHeader = true,
  tableLayout,
  scroll,
  pagination = false,
  rowSelection,
  expandable,
  sticky = false,
  caption,
  locale,
  rowClassName,
  onRow,
  onHeaderRow,
  components: _customComponents, // eslint-disable-line @typescript-eslint/no-unused-vars
} = defineProps<{
  /** Data array */
  dataSource?: T[];
  /** Column definitions */
  columns?: BTableColumnType<T>[];
  /** Unique row key - a field name string or extractor function */
  rowKey?: string | ((record: T) => string | number);
  /** Table size */
  size?: BTableSize;
  /** Show outer border and column borders */
  bordered?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Show table header */
  showHeader?: boolean;
  /** Table layout algorithm */
  tableLayout?: 'auto' | 'fixed';
  /** Scroll config */
  scroll?: BTableScrollConfig;
  /** Pagination config; false to disable */
  pagination?: BTablePaginationConfig | false;
  /** Row selection config */
  rowSelection?: BTableRowSelection<T>;
  /** Expandable config */
  expandable?: BTableExpandable<T>;
  /** Make table header sticky */
  sticky?: boolean | { offsetHeader?: number; offsetScroll?: number; getContainer?: () => HTMLElement };
  /** Table caption (accessibility) */
  caption?: string;
  /** Custom locale text */
  locale?: { emptyText?: string; filterConfirm?: string; filterReset?: string; selectAll?: string; selectInvert?: string; selectionAll?: string; sortTitle?: string; expand?: string; collapse?: string };
  /** Custom row class name */
  rowClassName?: (record: T, index: number) => string;
  /** Custom row event handlers */
  onRow?: (record: T, index: number) => Record<string, unknown>;
  /** Custom header row event handlers */
  onHeaderRow?: (columns: BTableColumnType<T>[], index: number) => Record<string, unknown>;
  /** Override internal table elements */
  components?: {
    table?: unknown;
    header?: { wrapper?: unknown; row?: unknown; cell?: unknown };
    body?: { wrapper?: unknown; row?: unknown; cell?: unknown };
  };
}>();

// ─────────────────────────────────────────────
// Emits
// ─────────────────────────────────────────────

const emit = defineEmits<{
  (e: 'change', pagination: BTablePaginationConfig, filters: BTableFilterState, sorter: BTableSorterResult<T> | BTableSorterResult<T>[], extra: BTableChangeExtra<T>): void;
  (e: 'expandedRowsChange', expandedRows: (string | number)[]): void;
  (e: 'expand', expanded: boolean, record: T): void;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
defineSlots<Record<string, ((props: any) => unknown) | undefined>>();

// ─────────────────────────────────────────────
// Locale defaults
// ─────────────────────────────────────────────

const resolvedLocale = computed(() => ({
  emptyText: locale?.emptyText ?? 'No data',
  filterConfirm: locale?.filterConfirm ?? 'OK',
  filterReset: locale?.filterReset ?? 'Reset',
  selectAll: locale?.selectAll ?? 'Select all data',
  selectInvert: locale?.selectInvert ?? 'Invert current page',
  selectionAll: locale?.selectionAll ?? 'Select all data',
  sortTitle: locale?.sortTitle ?? 'Sort',
  expand: locale?.expand ?? 'Expand row',
  collapse: locale?.collapse ?? 'Collapse row',
}));

// ─────────────────────────────────────────────
// Row-key helper
// ─────────────────────────────────────────────

function getRowKey(record: T, index: number): string | number {
  if (typeof rowKey === 'function') return rowKey(record);
  const val = record[rowKey as string];
  return (val as string | number) ?? index;
}

// ─────────────────────────────────────────────
// Nested value accessor (dot-path)
// ─────────────────────────────────────────────

function getValue(record: T, dataIndex?: string | string[]): unknown {
  if (!dataIndex) return undefined;
  const keys = Array.isArray(dataIndex) ? dataIndex : dataIndex.split('.');
  let cur: unknown = record;
  for (const k of keys) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = (cur as Record<string, unknown>)[k];
  }
  return cur;
}

// ─────────────────────────────────────────────
// Sort state
// ─────────────────────────────────────────────

interface ColumnSortState {
  key: string | number;
  order: BTableSortOrder;
}

const internalSortState = ref<ColumnSortState>({ key: '', order: null });

function columnSortKey(col: BTableColumnType<T>): string | number {
  return col.key ?? (Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : (col.dataIndex ?? ''));
}

function getColumnSortOrder(col: BTableColumnType<T>): BTableSortOrder {
  if (col.sortOrder !== undefined) return col.sortOrder;
  const key = columnSortKey(col);
  if (internalSortState.value.key === key) return internalSortState.value.order;
  return col.defaultSortOrder ?? null;
}

function cycleSortOrder(current: BTableSortOrder, directions: BTableSortOrder[]): BTableSortOrder {
  const cycle = directions.length ? directions : ['ascend' as const, 'descend' as const, null];
  const idx = cycle.indexOf(current);
  return cycle[(idx + 1) % cycle.length] ?? null;
}

function handleSort(col: BTableColumnType<T>) {
  if (!col.sorter) return;
  const key = columnSortKey(col);
  const current = getColumnSortOrder(col);
  const directions = col.sortDirections ?? ['ascend', 'descend', null];
  const next = cycleSortOrder(current, directions);

  // Controlled sort is driven by parent via col.sortOrder
  if (col.sortOrder === undefined) {
    internalSortState.value = { key, order: next };
  }

  const sorterResult: BTableSorterResult<T> = {
    column: col,
    order: next,
    field: col.dataIndex,
    columnKey: key,
  };
  emit('change', currentPagination.value, currentFilters.value, sorterResult, {
    currentDataSource: processedData.value,
    action: 'sort',
  });
}

// ─────────────────────────────────────────────
// Filter state
// ─────────────────────────────────────────────

const internalFilters = ref<BTableFilterState>({});
const openFilterKey = ref<string | number | null>(null);
const filterSearchMap = ref<Record<string | number, string>>({});

function getColumnFilterKey(col: BTableColumnType<T>): string | number {
  return col.key ?? (Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : (col.dataIndex ?? ''));
}

function getColumnFilterValue(col: BTableColumnType<T>): BTableFilterValue | null {
  if (col.filteredValue !== undefined) return col.filteredValue;
  return internalFilters.value[getColumnFilterKey(col)] ?? col.defaultFilteredValue ?? null;
}

const currentFilters = computed<BTableFilterState>(() => {
  const result: BTableFilterState = {};
  for (const col of flatColumns.value) {
    if (col.filters || col.filteredValue !== undefined) {
      const key = getColumnFilterKey(col);
      result[key] = getColumnFilterValue(col);
    }
  }
  return result;
});

function toggleFilterPanel(col: BTableColumnType<T>) {
  const key = getColumnFilterKey(col);
  openFilterKey.value = openFilterKey.value === key ? null : key;
}

function applyFilters(col: BTableColumnType<T>, values: BTableFilterValue) {
  const key = getColumnFilterKey(col);
  if (col.filteredValue === undefined) {
    internalFilters.value = { ...internalFilters.value, [key]: values.length ? values : null };
  }
  openFilterKey.value = null;

  // Reset to page 1 on filter change
  if (col.filterResetToDefaultFilteredValue !== false) {
    internalPage.value = 1;
  }

  emit('change', currentPagination.value, currentFilters.value, buildActiveSorter(), {
    currentDataSource: processedData.value,
    action: 'filter',
  });
}

function resetFilter(col: BTableColumnType<T>) {
  const key = getColumnFilterKey(col);
  const defaults = col.defaultFilteredValue ?? [];
  if (col.filteredValue === undefined) {
    internalFilters.value = { ...internalFilters.value, [key]: defaults.length ? defaults : null };
  }
  openFilterKey.value = null;
  emit('change', currentPagination.value, currentFilters.value, buildActiveSorter(), {
    currentDataSource: processedData.value,
    action: 'filter',
  });
}

function buildActiveSorter(): BTableSorterResult<T> {
  const sortCol = flatColumns.value.find(c => getColumnSortOrder(c) !== null);
  if (!sortCol) return { order: null };
  return {
    column: sortCol,
    order: getColumnSortOrder(sortCol),
    field: sortCol.dataIndex,
    columnKey: columnSortKey(sortCol),
  };
}

function getFilteredOptions(col: BTableColumnType<T>): BTableFilterOption[] {
  const search = filterSearchMap.value[getColumnFilterKey(col)] ?? '';
  if (!search) return col.filters ?? [];
  const lc = search.toLowerCase();
  const filterFn = typeof col.filterSearch === 'function'
    ? col.filterSearch
    : (input: string, opt: BTableFilterOption) => opt.text.toLowerCase().includes(input.toLowerCase());
  return (col.filters ?? []).filter(opt => filterFn(lc, opt));
}

// Temp filter selections while the dropdown is open
const tempFilterValues = ref<Record<string | number, BTableFilterValue>>({});

function openFilter(col: BTableColumnType<T>) {
  const key = getColumnFilterKey(col);
  tempFilterValues.value[key] = [...(getColumnFilterValue(col) ?? [])];
  toggleFilterPanel(col);
}

function toggleTempFilter(col: BTableColumnType<T>, value: string | number | boolean) {
  const key = getColumnFilterKey(col);
  const current = tempFilterValues.value[key] ?? [];
  if (col.filterMultiple !== false) {
    const idx = current.indexOf(value);
    tempFilterValues.value[key] = idx === -1 ? [...current, value] : current.filter(v => v !== value);
  } else {
    tempFilterValues.value[key] = [value];
  }
}

function confirmFilter(col: BTableColumnType<T>) {
  const key = getColumnFilterKey(col);
  applyFilters(col, tempFilterValues.value[key] ?? []);
}

// ─────────────────────────────────────────────
// Pagination state
// ─────────────────────────────────────────────

const internalPage = ref(1);
const internalPageSize = ref(
  typeof pagination === 'object' ? (pagination.defaultPageSize ?? pagination.pageSize ?? 10) : 10,
);

watch(() => (typeof pagination === 'object' ? pagination.pageSize : undefined), (ps) => {
  if (ps != null) internalPageSize.value = ps;
});

const currentPage = computed(() =>
  typeof pagination === 'object' && pagination.current != null
    ? pagination.current
    : internalPage.value,
);

const currentPageSize = computed(() =>
  typeof pagination === 'object' && pagination.pageSize != null
    ? pagination.pageSize
    : internalPageSize.value,
);

const currentPagination = computed<BTablePaginationConfig>(() => ({
  current: currentPage.value,
  pageSize: currentPageSize.value,
  total: filteredData.value.length,
}));

function goToPage(page: number) {
  if (typeof pagination === 'object' && pagination.current == null) {
    internalPage.value = page;
  }
  if (typeof pagination === 'object') {
    pagination.onChange?.(page, currentPageSize.value);
  }
  emit('change', { ...currentPagination.value, current: page }, currentFilters.value, buildActiveSorter(), {
    currentDataSource: processedData.value,
    action: 'paginate',
  });
}

function changePageSize(size: number) {
  internalPageSize.value = size;
  internalPage.value = 1;
  if (typeof pagination === 'object') {
    pagination.onShowSizeChange?.(1, size);
  }
}

const totalPages = computed(() => Math.ceil(filteredData.value.length / currentPageSize.value));

const pageSizeOptions = computed(() =>
  typeof pagination === 'object' && pagination.pageSizeOptions
    ? pagination.pageSizeOptions.map(Number)
    : [10, 20, 50, 100],
);

// ─────────────────────────────────────────────
// Data processing pipeline
// ─────────────────────────────────────────────

const filteredData = computed<T[]>(() => {
  let data = [...dataSource];

  for (const col of flatColumns.value) {
    const filterValues = getColumnFilterValue(col);
    if (!filterValues || filterValues.length === 0) continue;

    if (col.onFilter) {
      data = data.filter(record =>
        (filterValues as (string | number | boolean)[]).some(v => col.onFilter!(v, record)),
      );
    } else if (col.dataIndex) {
      data = data.filter(record => {
        const val = getValue(record, col.dataIndex);
        return (filterValues as (string | number | boolean)[]).some(v => String(val) === String(v));
      });
    }
  }
  return data;
});

const sortedData = computed<T[]>(() => {
  const data = [...filteredData.value];
  const sortCol = flatColumns.value.find(c => getColumnSortOrder(c) !== null);
  if (!sortCol || !sortCol.sorter) return data;

  const order = getColumnSortOrder(sortCol);
  if (!order) return data;

  if (typeof sortCol.sorter === 'function') {
    data.sort((a, b) => {
      const res = (sortCol.sorter as (a: T, b: T) => number)(a, b);
      return order === 'ascend' ? res : -res;
    });
  } else {
    // Default sort: compare string values
    data.sort((a, b) => {
      const av = String(getValue(a, sortCol.dataIndex) ?? '');
      const bv = String(getValue(b, sortCol.dataIndex) ?? '');
      return order === 'ascend' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }
  return data;
});

const processedData = computed<T[]>(() => {
  if (!pagination) return sortedData.value;
  const start = (currentPage.value - 1) * currentPageSize.value;
  return sortedData.value.slice(start, start + currentPageSize.value);
});

// ─────────────────────────────────────────────
// Column processing
// ─────────────────────────────────────────────

/** Flatten leaf columns (skip group columns for data rendering) */
const flatColumns = computed<BTableColumnType<T>[]>(() => {
  function flatten(cols: BTableColumnType<T>[]): BTableColumnType<T>[] {
    const result: BTableColumnType<T>[] = [];
    for (const col of cols) {
      if (col.children?.length) {
        result.push(...flatten(col.children));
      } else {
        result.push(col);
      }
    }
    return result;
  }
  return flatten(columns);
});

/** Header rows for colspan/rowspan grouped headers */
interface HeaderCell {
  col: BTableColumnType<T>;
  colSpan: number;
  rowSpan: number;
  isLeaf: boolean;
}

const headerRows = computed<HeaderCell[][]>(() => {
  function getDepth(col: BTableColumnType<T>): number {
    if (!col.children?.length) return 1;
    return 1 + Math.max(...col.children.map(getDepth));
  }

  const maxDepth = Math.max(...columns.map(getDepth), 1);

  function buildRows(cols: BTableColumnType<T>[], depth: number, rows: HeaderCell[][], rowIdx: number) {
    for (const col of cols) {
      const isLeaf = !col.children?.length;
      const cell: HeaderCell = {
        col,
        colSpan: isLeaf ? 1 : flattenLeafCount(col),
        rowSpan: isLeaf ? maxDepth - rowIdx : 1,
        isLeaf,
      };
      if (!rows[rowIdx]) rows[rowIdx] = [];
      rows[rowIdx].push(cell);
      if (!isLeaf) {
        buildRows(col.children!, depth, rows, rowIdx + 1);
      }
    }
  }

  function flattenLeafCount(col: BTableColumnType<T>): number {
    if (!col.children?.length) return 1;
    return col.children.reduce((s, c) => s + flattenLeafCount(c), 0);
  }

  const rows: HeaderCell[][] = [];
  buildRows(columns, maxDepth, rows, 0);
  return rows;
});

// ─────────────────────────────────────────────
// Row selection state
// ─────────────────────────────────────────────

const internalSelectedKeys = ref<Set<string | number>>(
  new Set(rowSelection?.defaultSelectedRowKeys ?? []),
);

const selectedKeys = computed<Set<string | number>>(() => {
  if (rowSelection?.selectedRowKeys) return new Set(rowSelection.selectedRowKeys);
  return internalSelectedKeys.value;
});

const isCheckbox = computed(() => rowSelection?.type !== 'radio');

const pageRowKeys = computed(() =>
  processedData.value.map((r, i) => getRowKey(r, i)),
);

const selectablePageKeys = computed(() =>
  pageRowKeys.value.filter((key, i) => {
    const checkboxProps = rowSelection?.getCheckboxProps?.(processedData.value[i]);
    return !checkboxProps?.disabled;
  }),
);

const allPageSelected = computed(() =>
  selectablePageKeys.value.length > 0 &&
  selectablePageKeys.value.every(k => selectedKeys.value.has(k)),
);

const somePageSelected = computed(() =>
  !allPageSelected.value && selectablePageKeys.value.some(k => selectedKeys.value.has(k)),
);

function setSelectedKeys(keys: Set<string | number>) {
  if (!rowSelection?.selectedRowKeys) {
    internalSelectedKeys.value = keys;
  }
  const keyArr = [...keys];
  const rows = dataSource.filter((r, i) => keys.has(getRowKey(r, i)));
  rowSelection?.onChange?.(keyArr, rows);
}

function toggleRow(record: T, index: number, event: Event) {
  const key = getRowKey(record, index);
  const keys = new Set(selectedKeys.value);
  if (isCheckbox.value) {
    if (keys.has(key)) {
      keys.delete(key);
      rowSelection?.onSelect?.(record, false, [...keys].map(k => dataSource.find((r, i) => getRowKey(r, i) === k)!), event);
    } else {
      keys.add(key);
      rowSelection?.onSelect?.(record, true, [...keys].map(k => dataSource.find((r, i) => getRowKey(r, i) === k)!), event);
    }
  } else {
    keys.clear();
    keys.add(key);
    rowSelection?.onSelect?.(record, true, [record], event);
  }
  setSelectedKeys(keys);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toggleAllPage(_event: Event) {
  const keys = new Set(
    rowSelection?.preserveSelectedRowKeys
      ? selectedKeys.value
      : new Set<string | number>(),
  );
  if (allPageSelected.value) {
    selectablePageKeys.value.forEach(k => keys.delete(k));
    rowSelection?.onSelectAll?.(false, [], processedData.value);
  } else {
    selectablePageKeys.value.forEach(k => keys.add(k));
    rowSelection?.onSelectAll?.(true, [...keys].map(k => dataSource.find((r, i) => getRowKey(r, i) === k)!), processedData.value);
  }
  setSelectedKeys(keys);
}

// ─────────────────────────────────────────────
// Expand state
// ─────────────────────────────────────────────

const internalExpandedKeys = ref<Set<string | number>>(
  new Set(expandable?.defaultExpandedRowKeys ?? []),
);

const expandedKeys = computed<Set<string | number>>(() => {
  if (expandable?.expandedRowKeys) return new Set(expandable.expandedRowKeys);
  return internalExpandedKeys.value;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toggleExpand(record: T, index: number, _event: MouseEvent) {
  const key = getRowKey(record, index);
  const keys = new Set(expandedKeys.value);
  const isExpanded = keys.has(key);
  if (isExpanded) {
    keys.delete(key);
  } else {
    keys.add(key);
  }
  if (!expandable?.expandedRowKeys) {
    internalExpandedKeys.value = keys;
  }
  expandable?.onExpand?.(!isExpanded, record);
  expandable?.onExpandedRowsChange?.([...keys]);
  emit('expand', !isExpanded, record);
  emit('expandedRowsChange', [...keys]);
}

function isRowExpanded(record: T, index: number): boolean {
  return expandedKeys.value.has(getRowKey(record, index));
}

function isRowExpandable(record: T): boolean {
  if (expandable?.rowExpandable) return expandable.rowExpandable(record);
  const childKey = expandable?.childrenColumnName ?? 'children';
  const children = (record as Record<string, unknown>)[childKey];
  return Array.isArray(children) && children.length > 0;
}

// ─────────────────────────────────────────────
// Cell value helper
// ─────────────────────────────────────────────

function getCellValue(record: T, col: BTableColumnType<T>): unknown {
  return getValue(record, col.dataIndex);
}

function getColumnKey(col: BTableColumnType<T>, idx: number): string | number {
  return col.key ?? (Array.isArray(col.dataIndex) ? col.dataIndex.join('.') : (col.dataIndex ?? idx));
}

// ─────────────────────────────────────────────
// Sticky offset
// ─────────────────────────────────────────────

const stickyOffsetHeader = computed(() =>
  typeof sticky === 'object' ? (sticky.offsetHeader ?? 0) : 0,
);

// ─────────────────────────────────────────────
// Scroll wrapper ref
// ─────────────────────────────────────────────

const scrollRef = ref<HTMLElement | null>(null);
const hasHorizontalScroll = ref(false);

onMounted(() => {
  checkScroll();
});

watch(() => columns, () => nextTick(checkScroll));

function checkScroll() {
  if (!scrollRef.value) return;
  hasHorizontalScroll.value = scrollRef.value.scrollWidth > scrollRef.value.clientWidth;
}

// ─────────────────────────────────────────────
// Root class / style
// ─────────────────────────────────────────────

const rootClasses = computed(() => [
  'b-table',
  {
    'b-table--bordered': bordered,
    'b-table--loading': loading,
    'b-table--small': size === 'small',
    'b-table--middle': size === 'middle',
    'b-table--sticky': sticky,
    'b-table--fixed-header': !!scroll?.y,
    'b-table--scroll-x': !!scroll?.x,
    'b-table--has-selection': !!rowSelection,
    'b-table--has-expand': !!expandable,
    'b-table--empty': processedData.value.length === 0,
  },
]);

const tableStyle = computed<CSSProperties>(() => {
  const s: CSSProperties = {};
  if (tableLayout) s.tableLayout = tableLayout;
  if (scroll?.x === true) s.minWidth = '100%';
  else if (scroll?.x) s.width = typeof scroll.x === 'number' ? `${scroll.x}px` : scroll.x;
  return s;
});

const wrapperStyle = computed<CSSProperties>(() => {
  const s: CSSProperties = {};
  if (scroll?.x) {
    s.overflowX = 'auto';
  }
  if (scroll?.y) {
    s.overflowY = 'auto';
    s.maxHeight = typeof scroll.y === 'number' ? `${scroll.y}px` : scroll.y;
  }
  return s;
});

const stickyHeaderStyle = computed<CSSProperties>(() => {
  if (!sticky) return {};
  return {
    position: 'sticky',
    top: stickyOffsetHeader.value ? `${stickyOffsetHeader.value}px` : '0',
    zIndex: 2,
  };
});

// ─────────────────────────────────────────────
// Sort icon helper
// ─────────────────────────────────────────────

function getSortIcon(col: BTableColumnType<T>): 'asc' | 'desc' | 'none' {
  const order = getColumnSortOrder(col);
  if (order === 'ascend') return 'asc';
  if (order === 'descend') return 'desc';
  return 'none';
}

// ─────────────────────────────────────────────
// Ellipsis helper
// ─────────────────────────────────────────────

function getEllipsis(col: BTableColumnType<T>): boolean {
  if (typeof col.ellipsis === 'boolean') return col.ellipsis;
  return !!col.ellipsis;
}

// ─────────────────────────────────────────────
// Column width style
// ─────────────────────────────────────────────

function colWidthStyle(col: BTableColumnType<T>): CSSProperties {
  const s: CSSProperties = {};
  if (col.width != null) s.width = typeof col.width === 'number' ? `${col.width}px` : col.width;
  if (col.minWidth != null) s.minWidth = `${col.minWidth}px`;
  if (col.maxWidth != null) s.maxWidth = `${col.maxWidth}px`;
  if (col.align) s.textAlign = col.align;
  return s;
}

// ─────────────────────────────────────────────
// Page jump (simple pagination)
// ─────────────────────────────────────────────

const jumpInput = ref('');
function handleJumpKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    const p = parseInt(jumpInput.value, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages.value) {
      goToPage(p);
    }
    jumpInput.value = '';
  }
}

// ─────────────────────────────────────────────
// Filter keyboard handler (close on Escape)
// ─────────────────────────────────────────────

function handleFilterKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') openFilterKey.value = null;
}

// ─────────────────────────────────────────────
// Get cell style
// ─────────────────────────────────────────────

function getCellStyle(col: BTableColumnType<T>, record: T, rowIndex: number): CSSProperties | undefined {
  if (!col.cellStyle) return undefined;
  if (typeof col.cellStyle === 'function') return col.cellStyle(record, rowIndex);
  return col.cellStyle;
}
</script>

<template>
  <div :class="rootClasses" role="region" :aria-label="caption ?? undefined" :aria-busy="loading ? 'true' : undefined">
    <!-- Loading overlay -->
    <div v-if="loading" class="b-table__loading-overlay" role="status" aria-live="polite" aria-label="Loading data">
      <div class="b-table__spin" aria-hidden="true">
        <span class="b-table__spin-dot" />
        <span class="b-table__spin-dot" />
        <span class="b-table__spin-dot" />
        <span class="b-table__spin-dot" />
      </div>
    </div>

    <!-- Title slot -->
    <div
      v-if="$slots.title"
      class="b-table__title"
      :aria-hidden="loading ? 'true' : undefined"
      :style="loading ? { visibility: 'hidden' } : {}"
    >
      <slot name="title" />
    </div>

    <!-- Scroll wrapper -->
    <div
      ref="scrollRef"
      class="b-table__scroll-wrapper"
      :style="[wrapperStyle, loading ? { visibility: 'hidden' } : {}]"
      :aria-hidden="loading ? 'true' : undefined"
      :tabindex="(scroll?.x || scroll?.y) ? 0 : undefined"
    >
      <table class="b-table__table" :style="tableStyle" role="table">
        <!-- Caption (a11y) -->
        <caption v-if="caption" class="b-table__caption">{{ caption }}</caption>

        <!-- Colgroup for widths -->
        <colgroup>
          <col v-if="rowSelection" :style="{ width: rowSelection.columnWidth ? (typeof rowSelection.columnWidth === 'number' ? `${rowSelection.columnWidth}px` : rowSelection.columnWidth) : '48px' }" />
          <col v-if="expandable && expandable.showExpandColumn !== false" style="width:48px" />
          <col
            v-for="(col, ci) in flatColumns"
            :key="getColumnKey(col, ci)"
            :style="colWidthStyle(col)"
          />
        </colgroup>

        <!-- Header -->
        <thead v-if="showHeader" class="b-table__thead" :style="stickyHeaderStyle">
          <tr
            v-for="(row, ri) in headerRows"
            :key="ri"
            class="b-table__tr b-table__tr--header"
            v-bind="onHeaderRow?.(columns, ri)"
          >
            <!-- Select-all cell (first header row only) -->
            <th
              v-if="rowSelection && ri === 0"
              class="b-table__th b-table__th--selection"
              :rowspan="headerRows.length"
              scope="col"
              :aria-label="resolvedLocale.selectAll"
            >
              <span v-if="rowSelection.columnTitle">{{ rowSelection.columnTitle }}</span>
              <label v-else-if="isCheckbox && !rowSelection.hideSelectAll" class="b-table__checkbox-wrapper">
                <input
                  type="checkbox"
                  class="b-table__checkbox"
                  :checked="allPageSelected"
                  :indeterminate="somePageSelected"
                  :aria-label="resolvedLocale.selectAll"
                  @change="toggleAllPage($event)"
                />
                <span class="b-table__checkbox-inner" :class="{ 'b-table__checkbox-inner--indeterminate': somePageSelected, 'b-table__checkbox-inner--checked': allPageSelected }" aria-hidden="true" />
              </label>
            </th>

            <!-- Expand cell (first header row only) -->
            <th
              v-if="expandable && expandable.showExpandColumn !== false && ri === 0"
              class="b-table__th b-table__th--expand"
              :rowspan="headerRows.length"
              scope="col"
              aria-hidden="true"
            />

            <!-- Column header cells -->
            <th
              v-for="cell in row"
              :key="getColumnKey(cell.col, 0)"
              class="b-table__th"
              :class="{
                'b-table__th--sorted': getColumnSortOrder(cell.col) !== null,
                'b-table__th--sortable': !!cell.col.sorter,
                'b-table__th--filtered': (getColumnFilterValue(cell.col)?.length ?? 0) > 0,
                [`b-table__th--align-${cell.col.align ?? 'left'}`]: true,
                [cell.col.className ?? '']: !!cell.col.className,
              }"
              :colspan="cell.colSpan > 1 ? cell.colSpan : undefined"
              :rowspan="cell.rowSpan > 1 ? cell.rowSpan : undefined"
              :style="colWidthStyle(cell.col)"
              scope="col"
              :aria-sort="cell.col.sorter ? (getColumnSortOrder(cell.col) === 'ascend' ? 'ascending' : getColumnSortOrder(cell.col) === 'descend' ? 'descending' : 'none') : undefined"
              v-bind="onHeaderRow?.(columns, 0)"
            >
              <div class="b-table__th-inner">
                <!-- Title -->
                <span
                  class="b-table__col-title"
                  :class="{ 'b-table__col-title--rowspan': cell.rowSpan > 1 }"
                >{{ cell.col.titleText ?? cell.col.title }}</span>

                <!-- Sorter -->
                <button
                  v-if="cell.col.sorter && cell.isLeaf"
                  class="b-table__sorter"
                  type="button"
                  :aria-label="`${resolvedLocale.sortTitle}: ${cell.col.titleText ?? cell.col.title}`"
                  :data-sort="getSortIcon(cell.col)"
                  @click.stop="handleSort(cell.col)"
                >
                  <span class="b-table__sorter-inner" aria-hidden="true">
                    <svg class="b-table__sort-up" :class="{ active: getSortIcon(cell.col) === 'asc' }" viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M858.9 689L530.5 308.2a24 24 0 0 0-36.9 0L165.1 689c-4.7 5.2-.4 13 6.5 13h496.8c6.9 0 11.2-7.8 6.5-13z" /></svg>
                    <svg class="b-table__sort-down" :class="{ active: getSortIcon(cell.col) === 'desc' }" viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z" /></svg>
                  </span>
                </button>

                <!-- Filter trigger -->
                <div
                  v-if="cell.col.filters && cell.isLeaf"
                  class="b-table__filter-trigger"
                  :class="{ 'b-table__filter-trigger--active': (getColumnFilterValue(cell.col)?.length ?? 0) > 0 || openFilterKey === getColumnFilterKey(cell.col) }"
                >
                  <button
                    type="button"
                    class="b-table__filter-btn"
                    :aria-expanded="openFilterKey === getColumnFilterKey(cell.col) ? 'true' : 'false'"
                    :aria-label="`Filter ${cell.col.titleText ?? cell.col.title}`"
                    @click.stop="openFilter(cell.col)"
                  >
                    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M880.1 154H143.9c-24.5 0-39.8 26.7-27.5 48L349 597.4V838c0 17.8 14.5 32 32.3 32h263.4c17.8 0 32.3-14.2 32.3-32V597.4L909.6 202c12.3-21.3-3-48-29.5-48z" /></svg>
                  </button>

                  <!-- Filter dropdown -->
                  <div
                    v-if="openFilterKey === getColumnFilterKey(cell.col)"
                    class="b-table__filter-dropdown"
                    role="dialog"
                    :aria-label="`Filter ${cell.col.titleText ?? cell.col.title}`"
                    @keydown="handleFilterKeydown"
                  >
                    <!-- Search input -->
                    <div v-if="cell.col.filterSearch" class="b-table__filter-search">
                      <input
                        v-model="filterSearchMap[getColumnFilterKey(cell.col)]"
                        type="search"
                        class="b-table__filter-search-input"
                        placeholder="Search..."
                        aria-label="Search filter options"
                      />
                    </div>

                    <!-- Options -->
                    <ul class="b-table__filter-list" role="listbox" :aria-multiselectable="cell.col.filterMultiple !== false ? 'true' : 'false'">
                      <li
                        v-for="opt in getFilteredOptions(cell.col)"
                        :key="String(opt.value)"
                        class="b-table__filter-item"
                        role="option"
                        :aria-selected="(tempFilterValues[getColumnFilterKey(cell.col)] ?? []).includes(opt.value)"
                      >
                        <label class="b-table__filter-item-label">
                          <input
                            :type="cell.col.filterMultiple !== false ? 'checkbox' : 'radio'"
                            class="b-table__filter-item-input"
                            :checked="(tempFilterValues[getColumnFilterKey(cell.col)] ?? []).includes(opt.value)"
                            @change="toggleTempFilter(cell.col, opt.value)"
                          />
                          <span>{{ opt.text }}</span>
                        </label>
                      </li>
                    </ul>

                    <!-- Actions -->
                    <div class="b-table__filter-actions">
                      <button type="button" class="b-table__filter-reset" @click="resetFilter(cell.col)">{{ resolvedLocale.filterReset }}</button>
                      <button type="button" class="b-table__filter-confirm" @click="confirmFilter(cell.col)">{{ resolvedLocale.filterConfirm }}</button>
                    </div>
                  </div>
                </div>
              </div>
            </th>
          </tr>
        </thead>

        <!-- Body -->
        <tbody class="b-table__tbody">
          <!-- Empty state -->
          <tr v-if="processedData.length === 0" class="b-table__tr--empty">
            <td
              class="b-table__td b-table__td--empty"
              :colspan="flatColumns.length + (rowSelection ? 1 : 0) + (expandable && expandable.showExpandColumn !== false ? 1 : 0)"
            >
              <slot name="emptyText">
                <div class="b-table__empty">
                  <svg class="b-table__empty-icon" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <g transform="translate(0 1)" fill="none" fill-rule="evenodd">
                      <ellipse cx="32" cy="33" rx="32" ry="7" fill="currentColor" opacity=".2" />
                      <g fill-rule="nonzero" stroke="currentColor">
                        <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z" />
                        <path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="currentColor" opacity=".08" />
                      </g>
                    </g>
                  </svg>
                  <p class="b-table__empty-text">{{ resolvedLocale.emptyText }}</p>
                </div>
              </slot>
            </td>
          </tr>

          <!-- Data rows -->
          <template v-for="(record, rowIndex) in processedData" :key="getRowKey(record, rowIndex)">
            <tr
              class="b-table__tr b-table__tr--data"
              :class="[
                rowClassName?.(record, rowIndex),
                {
                  'b-table__tr--selected': selectedKeys.has(getRowKey(record, rowIndex)),
                  'b-table__tr--expanded': isRowExpanded(record, rowIndex),
                },
              ]"
              v-bind="onRow?.(record, rowIndex)"
            >
              <!-- Selection cell -->
              <td v-if="rowSelection" class="b-table__td b-table__td--selection">
                <label class="b-table__checkbox-wrapper">
                  <input
                    :type="isCheckbox ? 'checkbox' : 'radio'"
                    class="b-table__checkbox"
                    :checked="selectedKeys.has(getRowKey(record, rowIndex))"
                    :disabled="!!rowSelection.getCheckboxProps?.(record)?.disabled"
                    :aria-label="`Select row ${rowIndex + 1}`"
                    v-bind="rowSelection.getCheckboxProps?.(record)"
                    @change="toggleRow(record, rowIndex, $event)"
                  />
                  <span
                    class="b-table__checkbox-inner"
                    :class="{ 'b-table__checkbox-inner--checked': selectedKeys.has(getRowKey(record, rowIndex)) }"
                    aria-hidden="true"
                  />
                </label>
              </td>

              <!-- Expand toggle cell -->
              <td
                v-if="expandable && expandable.showExpandColumn !== false"
                class="b-table__td b-table__td--expand"
              >
                <button
                  v-if="isRowExpandable(record)"
                  type="button"
                  class="b-table__expand-btn"
                  :class="{ 'b-table__expand-btn--expanded': isRowExpanded(record, rowIndex) }"
                  :aria-label="isRowExpanded(record, rowIndex) ? resolvedLocale.collapse : resolvedLocale.expand"
                  :aria-expanded="isRowExpanded(record, rowIndex) ? 'true' : 'false'"
                  @click="toggleExpand(record, rowIndex, $event)"
                >
                  <svg class="b-table__expand-icon" viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                    <path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 0 0 302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 0 0 0-50.4z" />
                  </svg>
                </button>
              </td>

              <!-- Data cells -->
              <td
                v-for="(col, ci) in flatColumns"
                :key="getColumnKey(col, ci)"
                class="b-table__td"
                :class="{
                  [`b-table__td--align-${col.align ?? 'left'}`]: true,
                  'b-table__td--ellipsis': getEllipsis(col),
                  [col.className ?? '']: !!col.className,
                }"
                :style="[colWidthStyle(col), getCellStyle(col, record, rowIndex)]"
              >
                <!-- Slot-based rendering (by column key) -->
                <slot
                  v-if="$slots[String(getColumnKey(col, ci))]"
                  :name="String(getColumnKey(col, ci))"
                  :value="getCellValue(record, col)"
                  :record="record"
                  :index="rowIndex"
                  :column="col"
                />
                <!-- customRender function -->
                <component
                  v-else-if="col.customRender"
                  :is="() => col.customRender!({ value: getCellValue(record, col), record, index: rowIndex, column: col })"
                />
                <!-- Default: raw cell value -->
                <template v-else>
                  <span
                    v-if="getEllipsis(col)"
                    class="b-table__cell-ellipsis"
                    :title="typeof (col.ellipsis) === 'object' && col.ellipsis.showTitle !== false ? String(getCellValue(record, col) ?? '') : undefined"
                  >{{ getCellValue(record, col) }}</span>
                  <template v-else>{{ getCellValue(record, col) }}</template>
                </template>
              </td>
            </tr>

            <!-- Expanded row content -->
            <tr
              v-if="expandable && isRowExpanded(record, rowIndex)"
              class="b-table__tr b-table__tr--expanded-content"
              :key="`${getRowKey(record, rowIndex)}-expanded`"
            >
              <td
                :colspan="flatColumns.length + (rowSelection ? 1 : 0) + (expandable && expandable.showExpandColumn !== false ? 1 : 0)"
                class="b-table__td b-table__td--expanded"
              >
                <component
                  v-if="expandable.expandedRowRender"
                  :is="() => expandable.expandedRowRender!(record, rowIndex, 0, isRowExpanded(record, rowIndex))"
                />
                <slot v-else name="expandedRow" :record="record" :index="rowIndex" />
              </td>
            </tr>
          </template>

          <!-- Summary slot -->
          <slot name="summary" :page-data="processedData" />
        </tbody>
      </table>
    </div>

    <!-- Footer slot -->
    <div
      v-if="$slots.footer"
      class="b-table__footer"
      :aria-hidden="loading ? 'true' : undefined"
      :style="loading ? { visibility: 'hidden' } : {}"
    >
      <slot name="footer" />
    </div>

    <!-- Pagination -->
    <div
      v-if="pagination !== false && filteredData.length > 0"
      class="b-table__pagination"
      role="navigation"
      aria-label="Table pagination"
      :aria-hidden="loading ? 'true' : undefined"
      :style="loading ? { visibility: 'hidden' } : {}"
    >
      <!-- Total info -->
      <span v-if="typeof pagination === 'object' && pagination.showTotal" class="b-table__pagination-total">
        {{ pagination.showTotal(filteredData.length, [(currentPage - 1) * currentPageSize + 1, Math.min(currentPage * currentPageSize, filteredData.length)]) }}
      </span>

      <div class="b-table__pagination-controls">
        <!-- Prev -->
        <button
          type="button"
          class="b-table__page-btn"
          :disabled="currentPage <= 1"
          :aria-label="'Previous page'"
          @click="goToPage(currentPage - 1)"
        >
          <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.96 31.96 0 0 0 0 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z" /></svg>
        </button>

        <!-- Page numbers -->
        <template v-for="page in totalPages" :key="page">
          <button
            v-if="totalPages <= 7 || page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1"
            type="button"
            class="b-table__page-btn"
            :class="{ 'b-table__page-btn--active': page === currentPage }"
            :aria-label="`Page ${page}`"
            :aria-current="page === currentPage ? 'page' : undefined"
            @click="goToPage(page)"
          >{{ page }}</button>
          <span
            v-else-if="page === 2 && currentPage > 4"
            class="b-table__page-ellipsis"
            aria-hidden="true"
          >…</span>
          <span
            v-else-if="page === totalPages - 1 && currentPage < totalPages - 3"
            class="b-table__page-ellipsis"
            aria-hidden="true"
          >…</span>
        </template>

        <!-- Next -->
        <button
          type="button"
          class="b-table__page-btn"
          :disabled="currentPage >= totalPages"
          :aria-label="'Next page'"
          @click="goToPage(currentPage + 1)"
        >
          <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 0 0 302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 0 0 0-50.4z" /></svg>
        </button>

        <!-- Page size changer -->
        <select
          v-if="typeof pagination === 'object' && pagination.showSizeChanger"
          class="b-table__page-size"
          :value="currentPageSize"
          :aria-label="'Rows per page'"
          @change="changePageSize(Number(($event.target as HTMLSelectElement).value))"
        >
          <option v-for="ps in pageSizeOptions" :key="ps" :value="ps">{{ ps }} / page</option>
        </select>

        <!-- Quick jump -->
        <span v-if="typeof pagination === 'object' && pagination.showQuickJumper" class="b-table__page-jump">
          Go to
          <input
            v-model="jumpInput"
            type="number"
            class="b-table__page-jump-input"
            :min="1"
            :max="totalPages"
            aria-label="Go to page"
            @keydown="handleJumpKeydown"
          />
        </span>
      </div>
    </div>
  </div>
</template>

<style>
/* ─────────────────────────────────────────────
   BTable - CSS custom properties (scoped to root)
   ───────────────────────────────────────────── */
.b-table {
  /* Colors */
  --b-table-bg: oklch(100% 0 0);
  --b-table-color: oklch(20% 0.02 260);
  --b-table-border-color: oklch(88% 0.01 260);
  --b-table-header-bg: oklch(97% 0.005 260);
  --b-table-header-color: oklch(30% 0.02 260);
  --b-table-row-hover-bg: oklch(96% 0.01 260);
  --b-table-row-selected-bg: oklch(94% 0.03 262);
  --b-table-row-expanded-bg: oklch(98% 0.005 260);
  --b-table-empty-color: oklch(48% 0.01 260);
  --b-table-footer-bg: oklch(97% 0.005 260);
  --b-table-loading-overlay-bg: oklch(100% 0 0);
  --b-table-sticky-z-index: 2;

  /* Sort / filter */
  --b-table-sorter-color: oklch(65% 0.01 260);
  --b-table-sorter-active-color: oklch(54.6% 0.245 262.881);
  --b-table-filter-active-color: oklch(54.6% 0.245 262.881);
  --b-table-filter-dropdown-bg: oklch(100% 0 0);
  --b-table-filter-dropdown-shadow: 0 6px 16px oklch(0% 0 0 / 8%), 0 3px 6px oklch(0% 0 0 / 4%);

  /* Checkbox */
  --b-table-checkbox-size: 16px;
  --b-table-checkbox-border: 1px solid oklch(75% 0.01 260);
  --b-table-checkbox-checked-bg: oklch(54.6% 0.245 262.881);
  --b-table-checkbox-checked-border: oklch(54.6% 0.245 262.881);
  --b-table-checkbox-radius: 4px;

  /* Expand */
  --b-table-expand-icon-size: 17px;
  --b-table-expand-icon-color: oklch(45% 0.02 260);
  --b-table-expand-icon-hover-color: oklch(54.6% 0.245 262.881);

  /* Spacing */
  --b-table-cell-padding: 12px 16px;
  --b-table-cell-padding-middle: 8px 16px;
  --b-table-cell-padding-small: 4px 8px;
  --b-table-font-size: 14px;
  --b-table-border-radius: 8px;

  /* Pagination */
  --b-table-pagination-color: oklch(30% 0.02 260);
  --b-table-pagination-btn-size: 32px;
  --b-table-pagination-btn-radius: 6px;
  --b-table-pagination-btn-border: 1px solid oklch(88% 0.01 260);
  --b-table-pagination-btn-active-bg: oklch(54.6% 0.245 262.881);
  --b-table-pagination-btn-active-color: oklch(100% 0 0);
  --b-table-pagination-btn-hover-bg: oklch(95% 0.01 262);

  /* Spin */
  --b-table-spin-color: oklch(54.6% 0.245 262.881);
  --b-table-spin-size: 32px;

  /* Transition */
  --b-table-transition-duration: 200ms;

  position: relative;
  font-size: var(--b-table-font-size);
  color: var(--b-table-color);
  background: var(--b-table-bg);
  border-radius: var(--b-table-border-radius);
  line-height: 1.5715;
  box-sizing: border-box;
}

/* ── Scroll wrapper ── */
.b-table__scroll-wrapper {
  width: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--b-table-bg);
}

.b-table__scroll-wrapper:focus-visible {
  outline: 2px solid oklch(54.6% 0.245 262.881);
  outline-offset: -2px;
}

/* ── Table element ── */
.b-table__table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
  background: var(--b-table-bg);
}

/* ── Caption ── */
.b-table__caption {
  /* Visually hidden - accessible label is surfaced via aria-label on the region landmark */
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
  background: var(--b-table-bg);
}

/* ── Header ── */
.b-table__thead {
  background: var(--b-table-header-bg);
}

/* Explicit background on every header <tr> so axe's elementsFromPoint algorithm
   can resolve the background when a rowspan-2 th's text sits on the row boundary
   and the sibling <tr> appears as a non-ancestor in the z-stack. */
.b-table__tr--header {
  background: var(--b-table-header-bg);
}

.b-table__th {
  padding: var(--b-table-cell-padding);
  font-weight: 600;
  color: var(--b-table-header-color);
  text-align: left;
  vertical-align: top;
  white-space: nowrap;
  border-bottom: 1px solid var(--b-table-border-color);
  box-sizing: border-box;
  background: var(--b-table-header-bg);
}

.b-table--middle .b-table__th {
  padding: var(--b-table-cell-padding-middle);
}

.b-table--small .b-table__th {
  padding: var(--b-table-cell-padding-small);
}

.b-table__th--align-center { text-align: center; }
.b-table__th--align-right  { text-align: right;  }

.b-table__th-inner {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  background: var(--b-table-header-bg);
}

.b-table__col-title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: var(--b-table-header-bg);
}

/* Rowspan headers span multiple rows; removing overflow:hidden prevents axe's
   elementsFromPoint from finding the sibling <tr> as an unresolvable overlay. */
.b-table__col-title--rowspan {
  overflow: visible;
}

/* ── Sorter ── */
.b-table__sorter {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: var(--b-table-sorter-color);
  background: none;
  border: none;
  padding: 0;
  gap: 0;
  flex-shrink: 0;
  transition: color var(--b-table-transition-duration);
}

.b-table__sorter:hover,
.b-table__th--sorted .b-table__sorter {
  color: var(--b-table-sorter-active-color);
}

.b-table__sorter-inner {
  display: flex;
  flex-direction: column;
  line-height: 1;
}

.b-table__sort-up,
.b-table__sort-down {
  display: block;
  width: 11px;
  height: 7px;
  color: var(--b-table-sorter-color);
  transition: color var(--b-table-transition-duration);
}

.b-table__sort-up.active  { color: var(--b-table-sorter-active-color); }
.b-table__sort-down.active { color: var(--b-table-sorter-active-color); }

/* ── Filter ── */
.b-table__filter-trigger {
  position: relative;
  display: inline-flex;
  flex-shrink: 0;
}

.b-table__filter-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--b-table-sorter-color);
  background: none;
  border: none;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color var(--b-table-transition-duration), background var(--b-table-transition-duration);
}

.b-table__filter-btn:hover,
.b-table__filter-trigger--active .b-table__filter-btn {
  color: var(--b-table-filter-active-color);
  background: oklch(94% 0.02 262);
}

.b-table__filter-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 10;
  min-width: 160px;
  background: var(--b-table-filter-dropdown-bg);
  border-radius: 8px;
  box-shadow: var(--b-table-filter-dropdown-shadow);
  padding: 4px 0;
  outline: none;
}

.b-table__filter-search {
  padding: 8px 12px;
  border-bottom: 1px solid var(--b-table-border-color);
}

.b-table__filter-search-input {
  width: 100%;
  border: 1px solid var(--b-table-border-color);
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  outline: none;
  background: var(--b-table-bg);
  color: var(--b-table-color);
  box-sizing: border-box;
}

.b-table__filter-search-input:focus {
  border-color: var(--b-table-sorter-active-color);
  box-shadow: 0 0 0 2px oklch(54.6% 0.245 262.881 / 20%);
}

.b-table__filter-list {
  list-style: none;
  margin: 0;
  padding: 4px 0;
  max-height: 200px;
  overflow-y: auto;
}

.b-table__filter-item {
  padding: 0;
}

.b-table__filter-item-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 13px;
  transition: background var(--b-table-transition-duration);
}

.b-table__filter-item-label:hover {
  background: var(--b-table-row-hover-bg);
}

.b-table__filter-item-input {
  accent-color: var(--b-table-sorter-active-color);
}

.b-table__filter-actions {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  border-top: 1px solid var(--b-table-border-color);
  gap: 8px;
}

.b-table__filter-reset {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 13px;
  color: var(--b-table-color);
  padding: 4px 8px;
  border-radius: 4px;
  transition: background var(--b-table-transition-duration);
}

.b-table__filter-reset:hover { background: var(--b-table-row-hover-bg); }

.b-table__filter-confirm {
  background: oklch(54.6% 0.245 262.881);
  color: oklch(100% 0 0);
  border: none;
  cursor: pointer;
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 4px;
  transition: background var(--b-table-transition-duration);
}

.b-table__filter-confirm:hover { background: oklch(49% 0.24 262.881); }

/* ── Selection cells ── */
.b-table__th--selection,
.b-table__td--selection {
  text-align: center;
  padding: 0 !important;
  width: 48px;
}

.b-table__checkbox-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  padding: 0 8px;
  height: 100%;
}

.b-table__checkbox {
  /* Visually hidden but accessible */
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
}

.b-table__checkbox:focus-visible + .b-table__checkbox-inner {
  outline: 2px solid oklch(54.6% 0.245 262.881);
  outline-offset: 2px;
}

.b-table__checkbox-inner {
  display: inline-block;
  width: var(--b-table-checkbox-size);
  height: var(--b-table-checkbox-size);
  border: var(--b-table-checkbox-border);
  border-radius: var(--b-table-checkbox-radius);
  background: var(--b-table-bg);
  transition:
    border-color var(--b-table-transition-duration),
    background var(--b-table-transition-duration);
  position: relative;
  flex-shrink: 0;
}

.b-table__checkbox-inner--checked {
  background: var(--b-table-checkbox-checked-bg);
  border-color: var(--b-table-checkbox-checked-border);
}

/* Checkmark */
.b-table__checkbox-inner--checked::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 5px;
  width: 4px;
  height: 8px;
  border: 2px solid oklch(100% 0 0);
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}

/* Indeterminate dash */
.b-table__checkbox-inner--indeterminate {
  background: var(--b-table-checkbox-checked-bg);
  border-color: var(--b-table-checkbox-checked-border);
}

.b-table__checkbox-inner--indeterminate::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 2px;
  background: oklch(100% 0 0);
  transform: translate(-50%, -50%);
  border: none;
}

/* ── Expand toggle cell ── */
.b-table__th--expand,
.b-table__td--expand {
  text-align: center;
  width: 48px;
  padding: 0 !important;
}

.b-table__expand-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--b-table-expand-icon-size);
  height: var(--b-table-expand-icon-size);
  border: 1px solid var(--b-table-border-color);
  border-radius: 4px;
  background: var(--b-table-bg);
  cursor: pointer;
  color: var(--b-table-expand-icon-color);
  padding: 0;
  transition: color var(--b-table-transition-duration), border-color var(--b-table-transition-duration);
}

.b-table__expand-btn:hover { color: var(--b-table-expand-icon-hover-color); border-color: var(--b-table-expand-icon-hover-color); }

.b-table__expand-icon {
  transition: transform var(--b-table-transition-duration);
}

.b-table__expand-btn--expanded .b-table__expand-icon {
  transform: rotate(90deg);
}

/* ── Body cells ── */
.b-table__td {
  padding: var(--b-table-cell-padding);
  border-bottom: 1px solid var(--b-table-border-color);
  background: var(--b-table-bg);
  color: var(--b-table-color);
  box-sizing: border-box;
  vertical-align: middle;
  transition: background var(--b-table-transition-duration);
}

.b-table--middle .b-table__td { padding: var(--b-table-cell-padding-middle); }
.b-table--small  .b-table__td { padding: var(--b-table-cell-padding-small); }

.b-table__td--align-center { text-align: center; }
.b-table__td--align-right  { text-align: right;  }

.b-table__td--ellipsis { overflow: hidden; }

.b-table__cell-ellipsis {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Row states ── */
.b-table__tr--data:hover > .b-table__td {
  background: var(--b-table-row-hover-bg);
}

.b-table__tr--selected > .b-table__td {
  background: var(--b-table-row-selected-bg);
}

.b-table__tr--expanded-content > .b-table__td--expanded {
  background: var(--b-table-row-expanded-bg);
}

/* ── Bordered ── */
.b-table--bordered {
  border: 1px solid var(--b-table-border-color);
  border-radius: var(--b-table-border-radius);
  overflow: hidden;
}

.b-table--bordered .b-table__th,
.b-table--bordered .b-table__td {
  border-right: 1px solid var(--b-table-border-color);
}

.b-table--bordered .b-table__th:last-child,
.b-table--bordered .b-table__td:last-child {
  border-right: none;
}

/* ── Empty ── */
.b-table__td--empty {
  padding: 48px 16px;
  text-align: center;
  border-bottom: none;
}

.b-table__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.b-table__empty-icon {
  width: 64px;
  height: 41px;
  color: var(--b-table-empty-color);
}

.b-table__empty-text {
  margin: 0;
  color: var(--b-table-empty-color);
  font-size: 14px;
}

/* ── Title / Footer ── */
.b-table__title,
.b-table__footer {
  padding: 12px 16px;
  background: var(--b-table-footer-bg);
  border: 1px solid var(--b-table-border-color);
}

.b-table__title { border-bottom: none; border-radius: var(--b-table-border-radius) var(--b-table-border-radius) 0 0; }
.b-table__footer { border-top: none; border-radius: 0 0 var(--b-table-border-radius) var(--b-table-border-radius); }

/* ── Loading ── */
.b-table__loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--b-table-loading-overlay-bg);
  border-radius: var(--b-table-border-radius);
}

.b-table__spin {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}

.b-table__spin-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--b-table-spin-color);
  animation: b-table-spin-bounce 1.2s ease-in-out infinite;
}

.b-table__spin-dot:nth-child(1) { animation-delay: 0ms; }
.b-table__spin-dot:nth-child(2) { animation-delay: 160ms; }
.b-table__spin-dot:nth-child(3) { animation-delay: 320ms; }
.b-table__spin-dot:nth-child(4) { animation-delay: 480ms; }

@keyframes b-table-spin-bounce {
  0%, 60%, 100% { transform: scale(1);   opacity: 0.5; }
  30%            { transform: scale(1.4); opacity: 1;   }
}

/* ── Pagination ── */
.b-table__pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 0 4px;
  flex-wrap: wrap;
  color: var(--b-table-pagination-color);
  font-size: 14px;
}

.b-table__pagination-total { margin-right: auto; }

.b-table__pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}

.b-table__page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--b-table-pagination-btn-size);
  height: var(--b-table-pagination-btn-size);
  padding: 0 8px;
  border: var(--b-table-pagination-btn-border);
  border-radius: var(--b-table-pagination-btn-radius);
  background: var(--b-table-bg);
  color: var(--b-table-pagination-color);
  cursor: pointer;
  font-size: 14px;
  transition: background var(--b-table-transition-duration), border-color var(--b-table-transition-duration), color var(--b-table-transition-duration);
}

.b-table__page-btn:hover:not(:disabled) {
  background: var(--b-table-pagination-btn-hover-bg);
  border-color: oklch(54.6% 0.245 262.881);
  color: oklch(54.6% 0.245 262.881);
}

.b-table__page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.b-table__page-btn--active {
  background: var(--b-table-pagination-btn-active-bg);
  border-color: var(--b-table-pagination-btn-active-bg);
  color: var(--b-table-pagination-btn-active-color);
  font-weight: 600;
}

.b-table__page-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--b-table-pagination-btn-size);
  height: var(--b-table-pagination-btn-size);
  font-size: 14px;
  color: var(--b-table-empty-color);
  letter-spacing: 2px;
}

.b-table__page-size {
  height: var(--b-table-pagination-btn-size);
  border: var(--b-table-pagination-btn-border);
  border-radius: var(--b-table-pagination-btn-radius);
  background: var(--b-table-bg);
  color: var(--b-table-pagination-color);
  padding: 0 24px 0 8px;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  appearance: auto;
}

.b-table__page-jump {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}

.b-table__page-jump-input {
  width: 48px;
  height: var(--b-table-pagination-btn-size);
  border: var(--b-table-pagination-btn-border);
  border-radius: var(--b-table-pagination-btn-radius);
  text-align: center;
  font-size: 14px;
  padding: 0 4px;
  background: var(--b-table-bg);
  color: var(--b-table-pagination-color);
  outline: none;
  box-sizing: border-box;
}

.b-table__page-jump-input:focus {
  border-color: oklch(54.6% 0.245 262.881);
  box-shadow: 0 0 0 2px oklch(54.6% 0.245 262.881 / 20%);
}

/* ── Sticky header ── */
.b-table--sticky .b-table__thead {
  position: sticky;
  top: 0;
  z-index: var(--b-table-sticky-z-index);
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-table {
  --b-table-bg: oklch(18% 0.015 260);
  --b-table-color: oklch(88% 0.01 260);
  --b-table-border-color: oklch(32% 0.02 260);
  --b-table-header-bg: oklch(22% 0.02 260);
  --b-table-header-color: oklch(85% 0.01 260);
  --b-table-row-hover-bg: oklch(25% 0.02 260);
  --b-table-row-selected-bg: oklch(26% 0.04 262);
  --b-table-row-expanded-bg: oklch(21% 0.015 260);
  --b-table-empty-color: oklch(55% 0.01 260);
  --b-table-footer-bg: oklch(22% 0.02 260);
  --b-table-loading-overlay-bg: oklch(18% 0.015 260);
  --b-table-filter-dropdown-bg: oklch(22% 0.02 260);
  --b-table-filter-dropdown-shadow: 0 6px 16px oklch(0% 0 0 / 30%), 0 3px 6px oklch(0% 0 0 / 20%);
  --b-table-checkbox-border: 1px solid oklch(48% 0.02 260);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-table {
    --b-table-transition-duration: 0ms;
  }

  .b-table__spin-dot {
    animation: none;
  }

  .b-table__expand-icon {
    transition: none;
  }
}
</style>
