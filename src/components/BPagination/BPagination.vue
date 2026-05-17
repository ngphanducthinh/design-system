<script setup lang="ts">
import { BIcon } from '@/components';
import { computed, ref, watch } from 'vue';

import type {
  BPaginationAlign,
  BPaginationQuickJumper,
  BPaginationShowTotal,
  BPaginationSimple,
  BPaginationSize,
} from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    /** Current page number (controlled). */
    current?: number;
    /** Default initial page number (uncontrolled). @default 1 */
    defaultCurrent?: number;
    /** Default number of items per page. @default 10 */
    defaultPageSize?: number;
    /** Number of items per page (controlled). */
    pageSize?: number;
    /** Available page size options. @default [10, 20, 50, 100] */
    pageSizeOptions?: number[];
    /** Total number of data items. @default 0 */
    total?: number;
    /** Disable pagination. @default false */
    disabled?: boolean;
    /** Hide on single page. @default false */
    hideOnSinglePage?: boolean;
    /** Show less page items. @default false */
    showLessItems?: boolean;
    /** Show quick jumper input. @default false */
    showQuickJumper?: BPaginationQuickJumper;
    /** Show page size changer. Auto-shown when total > totalBoundaryShowSizeChanger. */
    showSizeChanger?: boolean;
    /** Show title attribute on page items. @default true */
    showTitle?: boolean;
    /** Show total number and range. */
    showTotal?: BPaginationShowTotal;
    /** Simple mode. @default false */
    simple?: BPaginationSimple;
    /** Size of the pagination. @default 'default' */
    size?: BPaginationSize;
    /** Alignment of pagination within container. @default 'start' */
    align?: BPaginationAlign;
    /** When total exceeds this value, showSizeChanger defaults to true. @default 50 */
    totalBoundaryShowSizeChanger?: number;
    /** Custom aria-label for the nav element. @default 'Pagination' */
    ariaLabel?: string;
  }>(),
  {
    defaultCurrent: 1,
    defaultPageSize: 10,
    pageSizeOptions: () => [10, 20, 50, 100],
    total: 0,
    disabled: false,
    hideOnSinglePage: false,
    showLessItems: false,
    showQuickJumper: false,
    showSizeChanger: undefined,
    showTitle: true,
    simple: false,
    size: 'default',
    align: 'start',
    totalBoundaryShowSizeChanger: 50,
    ariaLabel: 'Pagination',
  },
);

// ─────────────────────────────────────────────
// Emits
// ─────────────────────────────────────────────
const emit = defineEmits<{
  /** Fires when page number or page size changes. */
  (e: 'change', page: number, pageSize: number): void;
  /** Fires when page size changes. */
  (e: 'showSizeChange', current: number, size: number): void;
  /** v-model:current binding. */
  (e: 'update:current', page: number): void;
  /** v-model:pageSize binding. */
  (e: 'update:pageSize', size: number): void;
}>();

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const internalCurrent = ref(props.current ?? props.defaultCurrent);
const internalPageSize = ref(props.pageSize ?? props.defaultPageSize);

const isCurrentControlled = computed(() => props.current !== undefined);
const isPageSizeControlled = computed(() => props.pageSize !== undefined);

watch(
  () => props.current,
  (val) => {
    if (val !== undefined) internalCurrent.value = val;
  },
);

watch(
  () => props.pageSize,
  (val) => {
    if (val !== undefined) internalPageSize.value = val;
  },
);

const activePage = computed(() =>
  isCurrentControlled.value ? props.current! : internalCurrent.value,
);
const activePageSize = computed(() =>
  isPageSizeControlled.value ? props.pageSize! : internalPageSize.value,
);

// ─────────────────────────────────────────────
// Derived
// ─────────────────────────────────────────────
const totalPages = computed(() => {
  if (props.total <= 0 || activePageSize.value <= 0) return 0;
  return Math.ceil(props.total / activePageSize.value);
});

const shouldHide = computed(() => props.hideOnSinglePage && totalPages.value <= 1);

const computedShowSizeChanger = computed(() => {
  if (props.showSizeChanger !== undefined) return props.showSizeChanger;
  return props.total > props.totalBoundaryShowSizeChanger;
});

const isSimple = computed(() => !!props.simple);
const isSimpleReadOnly = computed(
  () => typeof props.simple === 'object' && props.simple.readOnly === true,
);

const totalRangeText = computed(() => {
  if (!props.showTotal) return '';
  const start = (activePage.value - 1) * activePageSize.value + 1;
  const end = Math.min(activePage.value * activePageSize.value, props.total);
  return props.showTotal(props.total, [start, end]);
});

// ─────────────────────────────────────────────
// Page list computation
// ─────────────────────────────────────────────
const pageList = computed(() => {
  const tp = totalPages.value;
  if (tp <= 0) return [];

  const siblingCount = props.showLessItems ? 1 : 2;
  const cur = activePage.value;

  const items: Array<{ type: 'page' | 'prev-ellipsis' | 'next-ellipsis'; page: number }> = [];

  items.push({ type: 'page', page: 1 });

  if (tp <= (props.showLessItems ? 4 : 6) + 2) {
    for (let i = 2; i <= tp; i++) {
      items.push({ type: 'page', page: i });
    }
    return items;
  }

  const left = Math.max(2, cur - siblingCount);
  const right = Math.min(tp - 1, cur + siblingCount);

  if (left > 2) {
    items.push({ type: 'prev-ellipsis', page: Math.max(1, cur - (props.showLessItems ? 3 : 5)) });
  }

  for (let i = left; i <= right; i++) {
    items.push({ type: 'page', page: i });
  }

  if (right < tp - 1) {
    items.push({
      type: 'next-ellipsis',
      page: Math.min(tp, cur + (props.showLessItems ? 3 : 5)),
    });
  }

  if (tp > 1) {
    items.push({ type: 'page', page: tp });
  }

  return items;
});

// ─────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────
function setPage(page: number) {
  if (props.disabled) return;
  const clamped = Math.max(1, Math.min(page, totalPages.value));
  if (clamped === activePage.value) return;

  if (!isCurrentControlled.value) {
    internalCurrent.value = clamped;
  }
  emit('update:current', clamped);
  emit('change', clamped, activePageSize.value);
}

function setPageSize(newSize: number) {
  if (props.disabled) return;
  if (newSize === activePageSize.value) return;

  const newTotalPages = Math.ceil(props.total / newSize);
  const newCurrent = Math.min(activePage.value, newTotalPages) || 1;

  if (!isPageSizeControlled.value) {
    internalPageSize.value = newSize;
  }
  if (!isCurrentControlled.value) {
    internalCurrent.value = newCurrent;
  }

  emit('update:pageSize', newSize);
  emit('update:current', newCurrent);
  emit('showSizeChange', newCurrent, newSize);
  emit('change', newCurrent, newSize);
}

function goPrev() {
  setPage(activePage.value - 1);
}

function goNext() {
  setPage(activePage.value + 1);
}

// ─────────────────────────────────────────────
// Quick jumper
// ─────────────────────────────────────────────
const jumperValue = ref('');

function handleJumperKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    submitJumper();
  }
}

function submitJumper() {
  const val = parseInt(jumperValue.value, 10);
  if (!isNaN(val) && val >= 1 && val <= totalPages.value) {
    setPage(val);
  }
  jumperValue.value = '';
}

// ─────────────────────────────────────────────
// Simple mode input
// ─────────────────────────────────────────────
const simpleInputValue = ref(String(activePage.value));

watch(activePage, (val) => {
  simpleInputValue.value = String(val);
});

function handleSimpleInputKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    const val = parseInt(simpleInputValue.value, 10);
    if (!isNaN(val)) {
      setPage(val);
    } else {
      simpleInputValue.value = String(activePage.value);
    }
  }
}

function handleSimpleInputBlur() {
  const val = parseInt(simpleInputValue.value, 10);
  if (!isNaN(val) && val >= 1 && val <= totalPages.value) {
    setPage(val);
  } else {
    simpleInputValue.value = String(activePage.value);
  }
}

// ─────────────────────────────────────────────
// Classes
// ─────────────────────────────────────────────
const rootClasses = computed(() => [
  'b-pagination',
  {
    'b-pagination--disabled': props.disabled,
    'b-pagination--simple': isSimple.value,
    'b-pagination--small': props.size === 'small',
    'b-pagination--large': props.size === 'large',
    'b-pagination--align-start': props.align === 'start',
    'b-pagination--align-center': props.align === 'center',
    'b-pagination--align-end': props.align === 'end',
  },
]);
</script>

<template>
  <nav v-if="!shouldHide" :class="rootClasses" role="navigation" :aria-label="props.ariaLabel">
    <!-- Total display -->
    <span v-if="props.showTotal" class="b-pagination__total">
      {{ totalRangeText }}
    </span>

    <!-- Simple mode -->
    <template v-if="isSimple">
      <!-- Prev -->
      <button
        class="b-pagination__item b-pagination__prev"
        type="button"
        :disabled="props.disabled || activePage <= 1"
        :aria-disabled="props.disabled || activePage <= 1 ? 'true' : undefined"
        :title="props.showTitle ? 'Previous Page' : undefined"
        aria-label="Previous Page"
        @click="goPrev"
      >
        <BIcon icon="chevron-left" aria-hidden="true" />
      </button>

      <!-- Simple input -->
      <span class="b-pagination__simple-pager">
        <input
          v-if="!isSimpleReadOnly"
          class="b-pagination__simple-input"
          type="text"
          inputmode="numeric"
          :value="simpleInputValue"
          :disabled="props.disabled"
          :aria-label="`Page ${activePage} of ${totalPages}`"
          @input="simpleInputValue = ($event.target as HTMLInputElement).value"
          @keydown="handleSimpleInputKeydown"
          @blur="handleSimpleInputBlur"
        />
        <span v-else class="b-pagination__simple-current" aria-current="page">
          {{ activePage }}
        </span>
        <span class="b-pagination__simple-separator" aria-hidden="true">/</span>
        <span class="b-pagination__simple-total">{{ totalPages }}</span>
      </span>

      <!-- Next -->
      <button
        class="b-pagination__item b-pagination__next"
        type="button"
        :disabled="props.disabled || activePage >= totalPages"
        :aria-disabled="props.disabled || activePage >= totalPages ? 'true' : undefined"
        :title="props.showTitle ? 'Next Page' : undefined"
        aria-label="Next Page"
        @click="goNext"
      >
        <BIcon icon="chevron-right" aria-hidden="true" />
      </button>
    </template>

    <!-- Normal mode -->
    <template v-else>
      <!-- Prev -->
      <button
        class="b-pagination__item b-pagination__prev"
        type="button"
        :disabled="props.disabled || activePage <= 1"
        :aria-disabled="props.disabled || activePage <= 1 ? 'true' : undefined"
        :title="props.showTitle ? 'Previous Page' : undefined"
        aria-label="Previous Page"
        @click="goPrev"
      >
        <BIcon icon="chevron-left" aria-hidden="true" />
      </button>

      <!-- Page items -->
      <template v-for="item in pageList" :key="`${item.type}-${item.page}`">
        <!-- Ellipsis -->
        <button
          v-if="item.type === 'prev-ellipsis' || item.type === 'next-ellipsis'"
          class="b-pagination__item b-pagination__ellipsis"
          type="button"
          :disabled="props.disabled"
          :title="
            props.showTitle
              ? item.type === 'prev-ellipsis'
                ? 'Previous 5 Pages'
                : 'Next 5 Pages'
              : undefined
          "
          :aria-label="item.type === 'prev-ellipsis' ? 'Previous 5 Pages' : 'Next 5 Pages'"
          @click="setPage(item.page)"
        >
          <span aria-hidden="true">•••</span>
        </button>

        <!-- Page number -->
        <button
          v-else
          class="b-pagination__item b-pagination__page"
          :class="{ 'b-pagination__page--active': item.page === activePage }"
          type="button"
          :disabled="props.disabled"
          :aria-current="item.page === activePage ? 'page' : undefined"
          :aria-label="`Page ${item.page}`"
          :title="props.showTitle ? `${item.page}` : undefined"
          @click="setPage(item.page)"
        >
          {{ item.page }}
        </button>
      </template>

      <!-- Next -->
      <button
        class="b-pagination__item b-pagination__next"
        type="button"
        :disabled="props.disabled || activePage >= totalPages"
        :aria-disabled="props.disabled || activePage >= totalPages ? 'true' : undefined"
        :title="props.showTitle ? 'Next Page' : undefined"
        aria-label="Next Page"
        @click="goNext"
      >
        <BIcon icon="chevron-right" aria-hidden="true" />
      </button>
    </template>

    <!-- Size changer -->
    <select
      v-if="computedShowSizeChanger && !isSimple"
      class="b-pagination__size-changer"
      :value="activePageSize"
      :disabled="props.disabled"
      aria-label="Items per page"
      @change="setPageSize(Number(($event.target as HTMLSelectElement).value))"
    >
      <option v-for="opt in pageSizeOptions" :key="opt" :value="opt">{{ opt }} / page</option>
    </select>

    <!-- Quick jumper -->
    <span v-if="props.showQuickJumper && !isSimple" class="b-pagination__quick-jumper">
      <span>Go to</span>
      <input
        class="b-pagination__jumper-input"
        type="text"
        inputmode="numeric"
        :value="jumperValue"
        :disabled="props.disabled"
        aria-label="Go to page"
        @input="jumperValue = ($event.target as HTMLInputElement).value"
        @keydown="handleJumperKeydown"
      />
    </span>
  </nav>
</template>

<style>
/* ─────────────────────────────────────────────
   BPagination - CSS custom properties
   ───────────────────────────────────────────── */
.b-pagination {
  /* Item */
  --b-pagination-item-bg: #ffffff;
  --b-pagination-item-bg-hover: rgba(0, 0, 0, 0.04);
  --b-pagination-item-size: 32px;
  --b-pagination-item-size-sm: 24px;
  --b-pagination-item-size-lg: 40px;
  --b-pagination-item-border-radius: 6px;
  --b-pagination-item-font-size: 14px;

  /* Active */
  --b-pagination-item-active-bg: #ffffff;
  --b-pagination-item-active-color: #0958d9;
  --b-pagination-item-active-border-color: #0958d9;
  --b-pagination-item-active-color-hover: #1677ff;
  --b-pagination-item-active-border-color-hover: #1677ff;

  /* Disabled */
  --b-pagination-item-active-bg-disabled: rgba(0, 0, 0, 0.15);
  --b-pagination-item-active-color-disabled: rgba(0, 0, 0, 0.25);
  --b-pagination-item-color-disabled: rgba(0, 0, 0, 0.25);

  /* Input */
  --b-pagination-item-input-bg: #ffffff;

  /* Link */
  --b-pagination-item-link-bg: #ffffff;

  /* Layout */
  --b-pagination-gap: 8px;
  --b-pagination-color: rgba(0, 0, 0, 0.88);
  --b-pagination-font-family: inherit;
  --b-pagination-mini-options-size-changer-top: 0px;

  /* Focus */
  --b-pagination-focus-ring: 0 0 0 2px rgba(22, 119, 255, 0.2);

  /* ── Layout ── */
  display: flex;
  align-items: center;
  gap: var(--b-pagination-gap);
  font-family: var(--b-pagination-font-family);
  font-size: var(--b-pagination-item-font-size);
  color: var(--b-pagination-color);
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
  margin: 0;
}

/* ── Alignment ── */
.b-pagination--align-start {
  justify-content: flex-start;
}

.b-pagination--align-center {
  justify-content: center;
}

.b-pagination--align-end {
  justify-content: flex-end;
}

/* ── Size variants ── */
.b-pagination--small {
  --b-pagination-item-size: var(--b-pagination-item-size-sm);
  --b-pagination-item-font-size: 12px;
  --b-pagination-gap: 4px;
}

.b-pagination--large {
  --b-pagination-item-size: var(--b-pagination-item-size-lg);
  --b-pagination-item-font-size: 16px;
  --b-pagination-gap: 10px;
}

/* ── Item (shared styles for page, prev, next, ellipsis) ── */
.b-pagination__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: var(--b-pagination-item-size);
  height: var(--b-pagination-item-size);
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: var(--b-pagination-item-border-radius);
  background: var(--b-pagination-item-bg);
  color: var(--b-pagination-color);
  font-size: var(--b-pagination-item-font-size);
  font-family: inherit;
  line-height: 1;
  text-align: center;
  cursor: pointer;
  user-select: none;
  transition:
    color 200ms,
    border-color 200ms,
    background 200ms;
  outline: none;
  box-sizing: border-box;
}

.b-pagination__item:hover:not(:disabled):not(.b-pagination__page--active) {
  background: var(--b-pagination-item-bg-hover);
  color: var(--b-pagination-item-active-color);
}

.b-pagination__item:focus-visible {
  box-shadow: var(--b-pagination-focus-ring);
}

.b-pagination__item:disabled {
  color: var(--b-pagination-item-color-disabled);
  cursor: not-allowed;
  background: transparent;
}

/* ── Active page ── */
.b-pagination__page--active {
  background: var(--b-pagination-item-active-bg);
  color: var(--b-pagination-item-active-color);
  border-color: var(--b-pagination-item-active-border-color);
  font-weight: 500;
  cursor: default;
}

.b-pagination__page--active:hover:not(:disabled) {
  color: var(--b-pagination-item-active-color-hover);
  border-color: var(--b-pagination-item-active-border-color-hover);
  background: var(--b-pagination-item-active-bg);
}

.b-pagination__page--active:disabled {
  background: var(--b-pagination-item-active-bg-disabled);
  color: var(--b-pagination-item-active-color-disabled);
  border-color: transparent;
}

/* ── Ellipsis ── */
.b-pagination__ellipsis {
  border-color: transparent;
  letter-spacing: 1px;
  color: rgba(0, 0, 0, 0.25);
}

.b-pagination__ellipsis:hover:not(:disabled) {
  color: var(--b-pagination-item-active-color);
  background: transparent;
}

/* ── Prev/Next arrows ── */
.b-pagination__prev,
.b-pagination__next {
  background: var(--b-pagination-item-link-bg);
}

/* ── Total ── */
.b-pagination__total {
  white-space: nowrap;
  font-size: var(--b-pagination-item-font-size);
}

/* ── Simple mode ── */
.b-pagination--simple .b-pagination__simple-pager {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.b-pagination__simple-input {
  width: 48px;
  height: var(--b-pagination-item-size);
  padding: 0 6px;
  border: 1px solid #d9d9d9;
  border-radius: var(--b-pagination-item-border-radius);
  background: var(--b-pagination-item-input-bg);
  color: var(--b-pagination-color);
  font-size: var(--b-pagination-item-font-size);
  text-align: center;
  outline: none;
  box-sizing: border-box;
  transition: border-color 200ms;
}

.b-pagination__simple-input:focus {
  border-color: var(--b-pagination-item-active-border-color);
  box-shadow: var(--b-pagination-focus-ring);
}

.b-pagination__simple-input:disabled {
  background: rgba(0, 0, 0, 0.04);
  color: var(--b-pagination-item-color-disabled);
  cursor: not-allowed;
}

.b-pagination__simple-separator {
  color: rgba(0, 0, 0, 0.25);
  padding: 0 2px;
}

.b-pagination__simple-current {
  font-weight: 500;
  color: var(--b-pagination-item-active-color);
}

/* ── Size changer ── */
.b-pagination__size-changer {
  height: var(--b-pagination-item-size);
  padding: 0 8px;
  border: 1px solid #d9d9d9;
  border-radius: var(--b-pagination-item-border-radius);
  background: var(--b-pagination-item-input-bg);
  color: var(--b-pagination-color);
  font-size: var(--b-pagination-item-font-size);
  font-family: inherit;
  cursor: pointer;
  outline: none;
  box-sizing: border-box;
  margin-top: var(--b-pagination-mini-options-size-changer-top);
  transition: border-color 200ms;
}

.b-pagination__size-changer:focus {
  border-color: var(--b-pagination-item-active-border-color);
  box-shadow: var(--b-pagination-focus-ring);
}

.b-pagination__size-changer:disabled {
  background: rgba(0, 0, 0, 0.04);
  color: var(--b-pagination-item-color-disabled);
  cursor: not-allowed;
}

/* ── Quick jumper ── */
.b-pagination__quick-jumper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--b-pagination-item-font-size);
  white-space: nowrap;
}

.b-pagination__jumper-input {
  width: 50px;
  height: var(--b-pagination-item-size);
  padding: 0 6px;
  border: 1px solid #d9d9d9;
  border-radius: var(--b-pagination-item-border-radius);
  background: var(--b-pagination-item-input-bg);
  color: var(--b-pagination-color);
  font-size: var(--b-pagination-item-font-size);
  text-align: center;
  outline: none;
  box-sizing: border-box;
  transition: border-color 200ms;
}

.b-pagination__jumper-input:focus {
  border-color: var(--b-pagination-item-active-border-color);
  box-shadow: var(--b-pagination-focus-ring);
}

.b-pagination__jumper-input:disabled {
  background: rgba(0, 0, 0, 0.04);
  color: var(--b-pagination-item-color-disabled);
  cursor: not-allowed;
}

/* ── Disabled state (entire control) ── */
.b-pagination--disabled {
  opacity: 0.65;
  pointer-events: none;
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-pagination,
@media (prefers-color-scheme: dark) {
  .b-pagination {
    --b-pagination-item-bg: #1d1d1d;
    --b-pagination-item-bg-hover: rgba(255, 255, 255, 0.08);
    --b-pagination-item-active-bg: #1d1d1d;
    --b-pagination-item-active-color: #4096ff;
    --b-pagination-item-active-border-color: #4096ff;
    --b-pagination-item-active-color-hover: #69b1ff;
    --b-pagination-item-active-border-color-hover: #69b1ff;
    --b-pagination-item-active-bg-disabled: rgba(255, 255, 255, 0.08);
    --b-pagination-item-active-color-disabled: rgba(255, 255, 255, 0.3);
    --b-pagination-item-color-disabled: rgba(255, 255, 255, 0.3);
    --b-pagination-item-input-bg: #1d1d1d;
    --b-pagination-item-link-bg: #1d1d1d;
    --b-pagination-color: rgba(255, 255, 255, 0.88);
    --b-pagination-focus-ring: 0 0 0 2px rgba(64, 150, 255, 0.25);
  }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-pagination__item,
  .b-pagination__simple-input,
  .b-pagination__size-changer,
  .b-pagination__jumper-input {
    transition: none;
  }
}
</style>
