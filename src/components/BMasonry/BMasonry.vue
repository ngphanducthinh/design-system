<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type {
  BMasonryBreakpoint,
  BMasonryClassNames,
  BMasonryItem,
  BMasonryLayoutChangePayload,
  BMasonryResponsive,
  BMasonryStyles,
} from './types';

// ─── Props ────────────────────────────────────────────────────────────────────

const {
  columns = 3,
  gutter = 0,
  items = [],
  fresh = false,
  classNames,
  styles,
} = defineProps<{
  /**
   * Number of columns. Accepts a fixed number or a breakpoint map.
   * @example 3
   * @example { xs: 1, sm: 2, md: 3, lg: 4 }
   * @default 3
   */
  columns?: BMasonryResponsive;

  /**
   * Gap between items in pixels. Accepts a fixed value, a [colGap, rowGap] tuple,
   * or a breakpoint map for responsive gaps.
   * @example 16
   * @example [16, 8]
   * @example { xs: 8, md: 16 }
   * @default 0
   */
  gutter?: BMasonryResponsive | [BMasonryResponsive, BMasonryResponsive];

  /**
   * Array of masonry items to render.
   * @default []
   */
  items?: BMasonryItem[];

  /**
   * When true, observe every item's size so the layout re-flows when children resize.
   * Requires ResizeObserver support; degrades gracefully when unavailable.
   * @default false
   */
  fresh?: boolean;

  /**
   * Customize CSS classes on semantic DOM elements (`root`, `column`, `item`).
   * Can be a plain object or a per-item function `(item, columnIndex) => classes`.
   */
  classNames?: BMasonryClassNames;

  /**
   * Customize inline styles on semantic DOM elements (`root`, `column`, `item`).
   * Can be a plain object or a per-item function `(item, columnIndex) => styles`.
   */
  styles?: BMasonryStyles;
}>();

// ─── Emits ────────────────────────────────────────────────────────────────────

const emit = defineEmits<{
  /**
   * Fires after each layout recalculation with the resolved column count and
   * the column assignment map (item key → 0-based column index).
   */
  layoutChange: [payload: BMasonryLayoutChangePayload];
}>();

// ─── Slots ────────────────────────────────────────────────────────────────────

defineSlots<{
  /**
   * Custom rendering for each item. Receives `{ item: BMasonryItem, index: number, column: number }`.
   */
  item?: (props: { item: BMasonryItem; index: number; column: number }) => unknown;

  /**
   * Default slot used when no `items` prop is provided — raw child nodes are
   * distributed across columns automatically.
   */
  default?: (props: Record<string, never>) => unknown;
}>();

// ─── Responsive helpers ───────────────────────────────────────────────────────

const BREAKPOINTS: Record<BMasonryBreakpoint, number> = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600,
};

function resolveResponsive(value: BMasonryResponsive, width: number): number {
  if (typeof value === 'number') return Math.max(1, value);

  // Breakpoint map — pick the largest breakpoint that still fits
  const keys = (Object.keys(BREAKPOINTS) as BMasonryBreakpoint[]).sort(
    (a, b) => BREAKPOINTS[b] - BREAKPOINTS[a],
  );

  for (const bp of keys) {
    if (width >= BREAKPOINTS[bp] && value[bp] !== undefined) {
      return Math.max(1, value[bp]!);
    }
  }
  // Fallback to smallest defined value
  const smallest = (Object.keys(value) as BMasonryBreakpoint[]).sort(
    (a, b) => BREAKPOINTS[a] - BREAKPOINTS[b],
  )[0];
  return smallest ? Math.max(1, value[smallest]!) : 1;
}

// ─── Container width tracking ─────────────────────────────────────────────────

const rootEl = ref<HTMLElement | null>(null);
const containerWidth = ref(0);

let containerObserver: ResizeObserver | null = null;

function updateWidth() {
  if (rootEl.value) {
    containerWidth.value = rootEl.value.offsetWidth;
  }
}

// ─── Item height tracking (fresh mode) ────────────────────────────────────────

const itemHeights = ref<Record<string | number, number>>({});
let itemObserver: ResizeObserver | null = null;
const itemEls = ref<Map<string | number, Element>>(new Map());

function registerItemEl(key: string | number, el: Element | null) {
  if (el) {
    itemEls.value.set(key, el);
    if (fresh && itemObserver) {
      itemObserver.observe(el);
    }
  } else {
    const old = itemEls.value.get(key);
    if (old && itemObserver) itemObserver.unobserve(old);
    itemEls.value.delete(key);
    const next = { ...itemHeights.value };
    delete next[key];
    itemHeights.value = next;
  }
}

function setupItemObserver() {
  if (!fresh || typeof ResizeObserver === 'undefined') return;
  itemObserver = new ResizeObserver((entries) => {
    let changed = false;
    for (const entry of entries) {
      const el = entry.target as HTMLElement;
      const key = el.dataset.masonryKey;
      if (key !== undefined) {
        const h = entry.contentRect.height;
        if (itemHeights.value[key] !== h) {
          itemHeights.value = { ...itemHeights.value, [key]: h };
          changed = true;
        }
      }
    }
    if (changed) {
      // trigger layout recompute (handled reactively via computed)
    }
  });
  // Observe any already-mounted elements
  itemEls.value.forEach((el) => itemObserver!.observe(el));
}

// ─── Core layout algorithm ────────────────────────────────────────────────────

const resolvedColumns = computed(() => resolveResponsive(columns, containerWidth.value));

const resolvedGutter = computed<[number, number]>(() => {
  const g = gutter;
  if (Array.isArray(g)) {
    const colGap = resolveResponsive(g[0] as BMasonryResponsive, containerWidth.value);
    const rowGap = resolveResponsive(g[1] as BMasonryResponsive, containerWidth.value);
    return [colGap, rowGap];
  }
  const v = resolveResponsive(g as BMasonryResponsive, containerWidth.value);
  return [v, v];
});

/** Distribute items across columns using the "shortest column first" strategy. */
const columnBuckets = computed<{ item: BMasonryItem; originalIndex: number }[][]>(() => {
  const cols = resolvedColumns.value;
  const buckets: { item: BMasonryItem; originalIndex: number }[][] = Array.from(
    { length: cols },
    () => [],
  );
  const heights = Array<number>(cols).fill(0);
  const [, rowGap] = resolvedGutter.value;

  const columnMap: Record<string | number, number> = {};

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let targetCol: number;

    if (item.column !== undefined) {
      // Pinned column (1-based → 0-based, clamped)
      targetCol = Math.max(0, Math.min(cols - 1, item.column - 1));
    } else {
      // Shortest column
      targetCol = heights.indexOf(Math.min(...heights));
    }

    buckets[targetCol].push({ item, originalIndex: i });
    const h = itemHeights.value[item.key] ?? item.height ?? 0;
    heights[targetCol] += h + (buckets[targetCol].length > 1 ? rowGap : 0);
    columnMap[item.key] = targetCol;
  }

  // Emit layout change (do it in a microtask to avoid mutating during render)
  Promise.resolve().then(() => {
    emit('layoutChange', { columns: cols, columnMap });
  });

  return buckets;
});

// ─── CSS class/style helpers ──────────────────────────────────────────────────

function getItemClasses(item: BMasonryItem, columnIndex: number) {
  const base = ['b-masonry__item'];
  if (!classNames) return base;

  if (typeof classNames === 'function') {
    const extra = classNames(item, columnIndex);
    if (extra) base.push(...(Array.isArray(extra) ? extra : [extra as string]));
  } else if (typeof classNames.item === 'function') {
    const extra = classNames.item(item, columnIndex);
    if (extra) base.push(...(Array.isArray(extra) ? extra : [extra as string]));
  } else if (typeof classNames.item === 'string') {
    base.push(classNames.item);
  }
  return base;
}

function getItemStyles(item: BMasonryItem, columnIndex: number): Record<string, string> {
  if (!styles) return {};
  if (typeof styles === 'function') return styles(item, columnIndex) ?? {};
  if (typeof styles.item === 'function') return styles.item(item, columnIndex) ?? {};
  if (styles.item && typeof styles.item === 'object') return styles.item as Record<string, string>;
  return {};
}

function getColumnClasses(colIndex: number): string[] {
  const base = ['b-masonry__column'];
  if (!classNames || typeof classNames === 'function') return base;
  if (classNames.column) base.push(classNames.column);
  return base;
}

function getColumnStyles(colIndex: number): Record<string, string> {
  if (!styles || typeof styles === 'function') return {};
  return (styles.column as Record<string, string>) ?? {};
}

const rootClasses = computed(() => {
  const base = ['b-masonry'];
  if (!classNames || typeof classNames === 'function') return base;
  if (classNames.root) base.push(classNames.root);
  return base;
});

const rootStyles = computed(() => {
  const base: Record<string, string> = {
    '--b-masonry-columns': String(resolvedColumns.value),
    '--b-masonry-col-gap': `${resolvedGutter.value[0]}px`,
    '--b-masonry-row-gap': `${resolvedGutter.value[1]}px`,
  };
  if (styles && typeof styles === 'object' && !('root' in styles) === false) {
    const s = styles as { root?: Record<string, string> };
    if (s.root) Object.assign(base, s.root);
  }
  return base;
});

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  updateWidth();

  if (typeof ResizeObserver !== 'undefined') {
    containerObserver = new ResizeObserver(() => updateWidth());
    if (rootEl.value) containerObserver.observe(rootEl.value);
  } else {
    // SSR / no ResizeObserver: listen to window resize
    window.addEventListener('resize', updateWidth);
  }

  if (fresh) setupItemObserver();
});

watch(
  () => fresh,
  (enabled) => {
    if (enabled) {
      setupItemObserver();
    } else {
      itemObserver?.disconnect();
      itemObserver = null;
      itemHeights.value = {};
    }
  },
);

onBeforeUnmount(() => {
  containerObserver?.disconnect();
  itemObserver?.disconnect();
  window.removeEventListener('resize', updateWidth);
});
</script>

<template>
  <!-- role="list" lets screen readers announce item count -->
  <div
    ref="rootEl"
    :class="rootClasses"
    :style="rootStyles"
    role="list"
    aria-label="Masonry layout"
  >
    <!-- Column-based layout: each column is a flex column -->
    <div
      v-for="(bucket, colIdx) in columnBuckets"
      :key="colIdx"
      :class="getColumnClasses(colIdx)"
      :style="getColumnStyles(colIdx)"
      role="presentation"
    >
      <div
        v-for="{ item, originalIndex } in bucket"
        :key="item.key"
        :ref="(el) => registerItemEl(item.key, el as Element | null)"
        :data-masonry-key="item.key"
        :class="getItemClasses(item, colIdx)"
        :style="getItemStyles(item, colIdx)"
        role="listitem"
      >
        <!-- Named item slot (prop-driven items) -->
        <slot v-if="$slots.item" name="item" :item="item" :index="originalIndex" :column="colIdx" />
        <!-- Default slot fallback when using raw children (no items prop) -->
        <template v-else>
          <slot />
        </template>
      </div>
    </div>
  </div>
</template>

<style>
/* ─────────────────────────────────────────────────────────────────────────────
   BMasonry — CSS custom properties (scoped to component root)
   ───────────────────────────────────────────────────────────────────────────── */
.b-masonry {
  /* Layout tokens */
  --b-masonry-columns: 3;
  --b-masonry-col-gap: 0px;
  --b-masonry-row-gap: 0px;

  /* Item tokens */
  --b-masonry-item-transition-duration: 200ms;
  --b-masonry-item-transition-timing: ease;
  --b-masonry-item-border-radius: 0px;
  --b-masonry-item-bg: transparent;

  /* ── Layout ── */
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: var(--b-masonry-col-gap);
  width: 100%;
  box-sizing: border-box;
}

/* ── Column ── */
.b-masonry__column {
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  flex-direction: column;
  gap: var(--b-masonry-row-gap);
}

/* ── Item ── */
.b-masonry__item {
  width: 100%;
  box-sizing: border-box;
  background: var(--b-masonry-item-bg);
  border-radius: var(--b-masonry-item-border-radius);
  transition:
    transform var(--b-masonry-item-transition-duration) var(--b-masonry-item-transition-timing),
    opacity var(--b-masonry-item-transition-duration) var(--b-masonry-item-transition-timing);
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-masonry {
  /* Tokens that shift in dark mode — override as needed by the consumer */
  --b-masonry-item-bg: transparent;
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-masonry {
    /* Tokens that shift in dark mode — override as needed by the consumer */
    --b-masonry-item-bg: transparent;
  }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-masonry {
    --b-masonry-item-transition-duration: 0ms;
  }
}
</style>
