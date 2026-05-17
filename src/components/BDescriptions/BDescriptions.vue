<script setup lang="ts">
import type { CSSProperties, VNode } from 'vue';
import { computed, Fragment, useSlots } from 'vue';

import type { BDescriptionsItem } from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  bordered = false,
  colon = true,
  column = 3,
  layout = 'horizontal',
  size = 'default',
  title,
  extra,
  items,
  labelStyle,
  contentStyle,
} = defineProps<{
  /** Whether to show border around the list. @default false */
  bordered?: boolean;
  /** Whether to show colon after the label. @default true */
  colon?: boolean;
  /** Number of columns per row. @default 3 */
  column?: number;
  /** Layout direction of description items. @default 'horizontal' */
  layout?: 'horizontal' | 'vertical';
  /** Size of the component. @default 'default' */
  size?: 'default' | 'middle' | 'small';
  /** Title of the descriptions block */
  title?: string;
  /** Extra content in the top-right corner */
  extra?: string;
  /** Description items data (alternative to slot-based usage) */
  items?: BDescriptionsItem[];
  /** Default style for all labels */
  labelStyle?: CSSProperties;
  /** Default style for all content cells */
  contentStyle?: CSSProperties;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /** BDescriptionsItem children */
  default?: (props: Record<string, never>) => unknown;
  /** Title area. Overrides the `title` prop */
  title?: (props: Record<string, never>) => unknown;
  /** Extra content area. Overrides the `extra` prop */
  extra?: (props: Record<string, never>) => unknown;
}>();

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const slots = useSlots();

// ─────────────────────────────────────────────
// Computed
// ─────────────────────────────────────────────
const hasHeader = computed(() => {
  return !!(title || slots.title || extra || slots.extra);
});

const rootClasses = computed(() => [
  'b-descriptions',
  {
    'b-descriptions--bordered': bordered,
    'b-descriptions--vertical': layout === 'vertical',
    'b-descriptions--horizontal': layout === 'horizontal',
    'b-descriptions--middle': size === 'middle',
    'b-descriptions--small': size === 'small',
    'b-descriptions--colon': colon,
  },
]);

/**
 * Collect items from the `items` prop or from slot children (BDescriptionsItem VNodes).
 * Each resolved item has: label, children, span, labelStyle, contentStyle, labelSlot, contentSlot.
 */
interface ResolvedItem {
  label?: string;
  children?: string;
  span: number;
  labelStyle?: CSSProperties;
  contentStyle?: CSSProperties;
  /** VNode array for the label slot (from BDescriptionsItem slot usage) */
  labelSlot?: VNode[];
  /** VNode array for the content slot (from BDescriptionsItem default slot) */
  contentSlot?: VNode[];
}

const resolvedItems = computed<ResolvedItem[]>(() => {
  // If items prop is provided, use it directly
  if (items && items.length > 0) {
    return items.map((item) => ({
      label: item.label,
      children: item.children,
      span: item.span ?? 1,
      labelStyle: item.labelStyle,
      contentStyle: item.contentStyle,
    }));
  }

  // Otherwise, extract from default slot VNodes (BDescriptionsItem instances)
  const defaultSlot = slots.default?.();
  if (!defaultSlot) return [];

  const result: ResolvedItem[] = [];

  function extractItems(vnodes: VNode[]) {
    for (const vnode of vnodes) {
      // Handle fragments (v-for, template wrappers)
      if (vnode.type === Fragment) {
        if (Array.isArray(vnode.children)) {
          extractItems(vnode.children as VNode[]);
        }
        continue;
      }

      const props = (vnode.props || {}) as Record<string, unknown>;
      const children = vnode.children as Record<
        string,
        (...args: unknown[]) => VNode | VNode[]
      > | null;

      const rawLabel = children?.label?.();
      const rawContent = children?.default?.();

      result.push({
        label: props.label as string | undefined,
        span: (props.span as number) ?? 1,
        labelStyle: props.labelStyle as CSSProperties | undefined,
        contentStyle: props.contentStyle as CSSProperties | undefined,
        labelSlot: rawLabel ? (Array.isArray(rawLabel) ? rawLabel : [rawLabel]) : undefined,
        contentSlot: rawContent
          ? Array.isArray(rawContent)
            ? rawContent
            : [rawContent]
          : undefined,
      });
    }
  }

  extractItems(defaultSlot);
  return result;
});

/**
 * Organize items into rows based on the column count.
 * The last item in each row gets its span extended to fill the remaining columns.
 */
interface RowData {
  items: Array<ResolvedItem & { effectiveSpan: number }>;
}

const rows = computed<RowData[]>(() => {
  const result: RowData[] = [];
  let currentRow: RowData = { items: [] };
  let colsUsed = 0;

  for (let i = 0; i < resolvedItems.value.length; i++) {
    const item = resolvedItems.value[i];
    const isLast = i === resolvedItems.value.length - 1;
    let span = Math.min(item.span, column);

    // If this item would exceed the row, start a new row
    if (colsUsed + span > column) {
      if (currentRow.items.length > 0) {
        // Fill remaining columns of the previous row
        const lastInRow = currentRow.items[currentRow.items.length - 1];
        lastInRow.effectiveSpan += column - colsUsed;
        result.push(currentRow);
        currentRow = { items: [] };
        colsUsed = 0;
      }
    }

    // If this is the last item, it takes up remaining space in the row
    if (isLast) {
      span = column - colsUsed;
    }

    currentRow.items.push({ ...item, effectiveSpan: span });
    colsUsed += span;

    if (colsUsed >= column) {
      result.push(currentRow);
      currentRow = { items: [] };
      colsUsed = 0;
    }
  }

  // Push any remaining items
  if (currentRow.items.length > 0) {
    const lastInRow = currentRow.items[currentRow.items.length - 1];
    lastInRow.effectiveSpan += column - colsUsed;
    result.push(currentRow);
  }

  return result;
});

/**
 * Merge global label/content styles with per-item styles.
 * Item-level styles override global styles.
 */
function mergedLabelStyle(item: ResolvedItem): CSSProperties | undefined {
  if (!labelStyle && !item.labelStyle) return undefined;
  return { ...labelStyle, ...item.labelStyle };
}

function mergedContentStyle(item: ResolvedItem): CSSProperties | undefined {
  if (!contentStyle && !item.contentStyle) return undefined;
  return { ...contentStyle, ...item.contentStyle };
}
</script>

<template>
  <div :class="rootClasses">
    <!-- Header -->
    <div v-if="hasHeader" class="b-descriptions__header">
      <div v-if="title || $slots.title" class="b-descriptions__title">
        <slot name="title">{{ title }}</slot>
      </div>
      <div v-if="extra || $slots.extra" class="b-descriptions__extra">
        <slot name="extra">{{ extra }}</slot>
      </div>
    </div>

    <!-- Body -->
    <div class="b-descriptions__body">
      <!-- Bordered: use a real <table> -->
      <table v-if="bordered" class="b-descriptions__table" role="presentation">
        <tbody>
          <!-- Horizontal layout with border -->
          <template v-if="layout === 'horizontal'">
            <tr v-for="(row, rowIndex) in rows" :key="rowIndex" class="b-descriptions__row">
              <template v-for="(item, itemIndex) in row.items" :key="itemIndex">
                <th
                  class="b-descriptions__item-label b-descriptions__item-label--bordered"
                  :style="mergedLabelStyle(item)"
                >
                  <component
                    v-if="item.labelSlot && item.labelSlot.length"
                    :is="() => item.labelSlot"
                  />
                  <template v-else>{{ item.label }}</template>
                </th>
                <td
                  class="b-descriptions__item-content b-descriptions__item-content--bordered"
                  :colspan="item.effectiveSpan * 2 - 1"
                  :style="mergedContentStyle(item)"
                >
                  <component
                    v-if="item.contentSlot && item.contentSlot.length"
                    :is="() => item.contentSlot"
                  />
                  <template v-else>{{ item.children }}</template>
                </td>
              </template>
            </tr>
          </template>

          <!-- Vertical layout with border -->
          <template v-else>
            <template v-for="(row, rowIndex) in rows" :key="rowIndex">
              <tr class="b-descriptions__row">
                <th
                  v-for="(item, itemIndex) in row.items"
                  :key="'label-' + itemIndex"
                  class="b-descriptions__item-label b-descriptions__item-label--bordered"
                  :colspan="item.effectiveSpan"
                  :style="mergedLabelStyle(item)"
                >
                  <component
                    v-if="item.labelSlot && item.labelSlot.length"
                    :is="() => item.labelSlot"
                  />
                  <template v-else>{{ item.label }}</template>
                </th>
              </tr>
              <tr class="b-descriptions__row">
                <td
                  v-for="(item, itemIndex) in row.items"
                  :key="'content-' + itemIndex"
                  class="b-descriptions__item-content b-descriptions__item-content--bordered"
                  :colspan="item.effectiveSpan"
                  :style="mergedContentStyle(item)"
                >
                  <component
                    v-if="item.contentSlot && item.contentSlot.length"
                    :is="() => item.contentSlot"
                  />
                  <template v-else>{{ item.children }}</template>
                </td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>

      <!-- Non-bordered: use a description list -->
      <table v-else class="b-descriptions__table" role="presentation">
        <tbody>
          <!-- Horizontal layout (default) -->
          <template v-if="layout === 'horizontal'">
            <tr v-for="(row, rowIndex) in rows" :key="rowIndex" class="b-descriptions__row">
              <td
                v-for="(item, itemIndex) in row.items"
                :key="itemIndex"
                class="b-descriptions__item"
                :colspan="item.effectiveSpan"
              >
                <span class="b-descriptions__item-label" :style="mergedLabelStyle(item)">
                  <component
                    v-if="item.labelSlot && item.labelSlot.length"
                    :is="() => item.labelSlot"
                  />
                  <template v-else>{{ item.label }}</template>
                </span>
                <span class="b-descriptions__item-content" :style="mergedContentStyle(item)">
                  <component
                    v-if="item.contentSlot && item.contentSlot.length"
                    :is="() => item.contentSlot"
                  />
                  <template v-else>{{ item.children }}</template>
                </span>
              </td>
            </tr>
          </template>

          <!-- Vertical layout -->
          <template v-else>
            <template v-for="(row, rowIndex) in rows" :key="rowIndex">
              <tr class="b-descriptions__row">
                <td
                  v-for="(item, itemIndex) in row.items"
                  :key="'label-' + itemIndex"
                  class="b-descriptions__item"
                  :colspan="item.effectiveSpan"
                >
                  <span class="b-descriptions__item-label" :style="mergedLabelStyle(item)">
                    <component
                      v-if="item.labelSlot && item.labelSlot.length"
                      :is="() => item.labelSlot"
                    />
                    <template v-else>{{ item.label }}</template>
                  </span>
                </td>
              </tr>
              <tr class="b-descriptions__row">
                <td
                  v-for="(item, itemIndex) in row.items"
                  :key="'content-' + itemIndex"
                  class="b-descriptions__item"
                  :colspan="item.effectiveSpan"
                >
                  <span class="b-descriptions__item-content" :style="mergedContentStyle(item)">
                    <component
                      v-if="item.contentSlot && item.contentSlot.length"
                      :is="() => item.contentSlot"
                    />
                    <template v-else>{{ item.children }}</template>
                  </span>
                </td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
/* ─────────────────────────────────────────────
   BDescriptions - CSS custom properties (scoped to root)
   ───────────────────────────────────────────── */
.b-descriptions {
  /* Surface */
  --b-descriptions-bg: oklch(100% 0 0);
  --b-descriptions-color: oklch(20% 0.02 260);
  --b-descriptions-border-color: oklch(88% 0.01 260);
  --b-descriptions-border-radius: 8px;
  --b-descriptions-transition-duration: 200ms;

  /* Title */
  --b-descriptions-title-color: oklch(20% 0.02 260);
  --b-descriptions-title-font-size: 16px;
  --b-descriptions-title-font-weight: 600;
  --b-descriptions-title-margin-bottom: 20px;

  /* Extra */
  --b-descriptions-extra-color: oklch(45% 0.02 260);
  --b-descriptions-extra-font-size: 14px;

  /* Label */
  --b-descriptions-label-color: oklch(40% 0.02 260);
  --b-descriptions-label-bg: oklch(97% 0.005 260);
  --b-descriptions-label-font-weight: 400;

  /* Content */
  --b-descriptions-content-color: oklch(20% 0.02 260);

  /* Item spacing */
  --b-descriptions-item-padding-bottom: 16px;
  --b-descriptions-item-padding-end: 16px;

  /* Colon */
  --b-descriptions-colon-margin-left: 2px;
  --b-descriptions-colon-margin-right: 8px;

  /* Bordered cell padding */
  --b-descriptions-cell-padding: 16px 24px;
  --b-descriptions-cell-padding-middle: 12px 20px;
  --b-descriptions-cell-padding-small: 8px 16px;

  /* Layout */
  color: var(--b-descriptions-color);
  font-size: 14px;
  line-height: 1.5715;
  box-sizing: border-box;
}

/* ── Header ── */
.b-descriptions__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--b-descriptions-title-margin-bottom);
  gap: 16px;
}

.b-descriptions__title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--b-descriptions-title-color);
  font-size: var(--b-descriptions-title-font-size);
  font-weight: var(--b-descriptions-title-font-weight);
  line-height: 1.5;
}

.b-descriptions__extra {
  flex: none;
  color: var(--b-descriptions-extra-color);
  font-size: var(--b-descriptions-extra-font-size);
}

/* ── Body ── */
.b-descriptions__body {
  width: 100%;
  overflow: hidden;
}

/* ── Table ── */
.b-descriptions__table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

/* ── Bordered table ── */
.b-descriptions--bordered .b-descriptions__table {
  border: 1px solid var(--b-descriptions-border-color);
  border-radius: var(--b-descriptions-border-radius);
  overflow: hidden;
}

.b-descriptions--bordered .b-descriptions__row > th,
.b-descriptions--bordered .b-descriptions__row > td {
  border-inline-end: 1px solid var(--b-descriptions-border-color);
  border-bottom: 1px solid var(--b-descriptions-border-color);
}

.b-descriptions--bordered .b-descriptions__row > th:last-child,
.b-descriptions--bordered .b-descriptions__row > td:last-child {
  border-inline-end: none;
}

.b-descriptions--bordered .b-descriptions__row:last-child > th,
.b-descriptions--bordered .b-descriptions__row:last-child > td {
  border-bottom: none;
}

.b-descriptions--bordered .b-descriptions__item-label--bordered {
  padding: var(--b-descriptions-cell-padding);
  background: var(--b-descriptions-label-bg);
  color: var(--b-descriptions-label-color);
  font-weight: var(--b-descriptions-label-font-weight);
  white-space: nowrap;
}

.b-descriptions--bordered .b-descriptions__item-content--bordered {
  padding: var(--b-descriptions-cell-padding);
  color: var(--b-descriptions-content-color);
}

/* ── Non-bordered items ── */
.b-descriptions__item {
  padding-bottom: var(--b-descriptions-item-padding-bottom);
  vertical-align: top;
}

.b-descriptions__item .b-descriptions__item-label {
  color: var(--b-descriptions-label-color);
  font-weight: var(--b-descriptions-label-font-weight);
  display: inline-block;
}

.b-descriptions__item .b-descriptions__item-content {
  color: var(--b-descriptions-content-color);
  display: inline-block;
}

/* ── Colon ── */
.b-descriptions--colon:not(.b-descriptions--vertical)
  .b-descriptions__item
  .b-descriptions__item-label::after {
  content: ':';
  position: relative;
  margin-inline-start: var(--b-descriptions-colon-margin-left);
  margin-inline-end: var(--b-descriptions-colon-margin-right);
}

.b-descriptions--colon.b-descriptions--bordered .b-descriptions__item-label--bordered::after {
  content: none;
}

/* ── Vertical layout ── */
.b-descriptions--vertical .b-descriptions__item .b-descriptions__item-label {
  display: block;
  padding-bottom: 4px;
}

.b-descriptions--vertical .b-descriptions__item .b-descriptions__item-content {
  display: block;
}

/* ── Size: middle ── */
.b-descriptions--middle .b-descriptions__item {
  padding-bottom: 12px;
}

.b-descriptions--middle.b-descriptions--bordered .b-descriptions__item-label--bordered,
.b-descriptions--middle.b-descriptions--bordered .b-descriptions__item-content--bordered {
  padding: var(--b-descriptions-cell-padding-middle);
}

/* ── Size: small ── */
.b-descriptions--small .b-descriptions__item {
  padding-bottom: 8px;
}

.b-descriptions--small.b-descriptions--bordered .b-descriptions__item-label--bordered,
.b-descriptions--small.b-descriptions--bordered .b-descriptions__item-content--bordered {
  padding: var(--b-descriptions-cell-padding-small);
}

.b-descriptions--small .b-descriptions__title {
  font-size: 14px;
}

.b-descriptions--middle .b-descriptions__title {
  font-size: 15px;
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-descriptions {
  --b-descriptions-bg: oklch(20% 0.02 260);
  --b-descriptions-color: oklch(88% 0.01 260);
  --b-descriptions-border-color: oklch(35% 0.02 260);
  --b-descriptions-title-color: oklch(92% 0.01 260);
  --b-descriptions-extra-color: oklch(65% 0.01 260);
  --b-descriptions-label-color: oklch(65% 0.01 260);
  --b-descriptions-label-bg: oklch(25% 0.02 260);
  --b-descriptions-content-color: oklch(88% 0.01 260);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-descriptions {
    --b-descriptions-transition-duration: 0ms;
  }
}
</style>
