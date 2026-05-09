<script setup lang="ts">
import { computed, provide } from 'vue';

import type {
  BTimelineItem,
  BTimelineItemColor,
  BTimelineItemPlacement,
  BTimelineMode,
  BTimelineOrientation,
  BTimelineVariant,
} from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  mode = 'start',
  variant = 'filled',
  orientation = 'vertical',
  pending = false,
  pendingDot,
  reverse = false,
  items,
} = defineProps<{
  /**
   * Controls which side labels appear on.
   * - `'start'`     - all content on the right of the line (default)
   * - `'end'`       - all content on the left of the line
   * - `'alternate'` - content alternates left/right
   * @default 'start'
   */
  mode?: BTimelineMode;
  /**
   * Dot style.
   * - `'filled'`   - solid filled circle (default)
   * - `'outlined'` - hollow ring with colored border
   * @default 'filled'
   */
  variant?: BTimelineVariant;
  /**
   * Layout direction.
   * - `'vertical'`   - items stacked top-to-bottom (default)
   * - `'horizontal'` - items laid out left-to-right
   * @default 'vertical'
   */
  orientation?: BTimelineOrientation;
  /**
   * Whether to show a pending (ghost) item at the bottom.
   * Pass `true` for the default spinner, or a string for custom content.
   * @default false
   */
  pending?: boolean | string;
  /**
   * Custom dot for the pending item. Overridden by the `#pendingDot` slot.
   */
  pendingDot?: string;
  /**
   * Whether to reverse the order of items (newest first).
   * @default false
   */
  reverse?: boolean;
  /**
   * Data-driven items. When provided, slot-based BTimelineItem children are
   * ignored. Use this for simple, data-only timelines.
   */
  items?: BTimelineItem[];
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /**
   * Default slot: place `<BTimelineItem>` children here.
   * Ignored when `items` prop is provided.
   */
  default?(): unknown;
  /** Custom dot for the pending ghost item. */
  pendingDot?(): unknown;
}>();

// Provide mode to slot-based BTimelineItem children
provide('b-timeline-mode', mode);
provide('b-timeline-variant', variant);

// ─────────────────────────────────────────────
// Pending item helpers
// ─────────────────────────────────────────────
const hasPending = computed(() => !!pending);
const pendingContent = computed(() => (pending !== true && pending ? pending : ''));

// ─────────────────────────────────────────────
// Reversed items (data-driven)
// ─────────────────────────────────────────────
const orderedItems = computed<BTimelineItem[]>(() => {
  if (!items) return [];
  return reverse ? [...items].reverse() : items;
});

// ─────────────────────────────────────────────
// CSS-var dot color helper
// ─────────────────────────────────────────────
const PRESET_COLORS: BTimelineItemColor[] = ['blue', 'red', 'green', 'gray'];

function isPresetColor(color?: BTimelineItemColor): boolean {
  return !color || PRESET_COLORS.includes(color as string);
}

function dotColorStyle(color?: BTimelineItemColor): Record<string, string> | undefined {
  if (!color || isPresetColor(color)) return undefined;
  return { '--b-timeline-item-dot-color': color };
}

function dotColorClass(color?: BTimelineItemColor): string {
  const c = color ?? 'blue';
  return isPresetColor(c) ? `b-timeline-item--${c}` : 'b-timeline-item--custom';
}

// ─────────────────────────────────────────────
// Root classes
// ─────────────────────────────────────────────
const rootClasses = computed(() => [
  'b-timeline',
  `b-timeline--${mode}`,
  `b-timeline--${variant}`,
  `b-timeline--${orientation}`,
  {
    'b-timeline--pending': hasPending.value,
    'b-timeline--reverse': reverse,
  },
]);

// ─────────────────────────────────────────────
// Item position helper
// ─────────────────────────────────────────────
function itemPositionClass(index: number, placement?: BTimelineItemPlacement): string {
  // Per-item placement overrides the global mode
  if (placement) {
    return placement === 'end' ? 'b-timeline-item--right' : 'b-timeline-item--left';
  }
  if (mode === 'alternate') {
    return index % 2 === 0 ? 'b-timeline-item--left' : 'b-timeline-item--right';
  }
  return mode === 'end' ? 'b-timeline-item--right' : 'b-timeline-item--left';
}
</script>

<template>
  <ol :class="rootClasses" aria-label="Timeline">
    <!-- ── Data-driven items ── -->
    <template v-if="items && items.length">
      <li
        v-for="(item, i) in orderedItems"
        :key="i"
        class="b-timeline-item"
        :class="[
          dotColorClass(item.color),
          itemPositionClass(i, item.placement),
          { 'b-timeline-item--pending': item.loading },
          item.className,
        ]"
        :style="[dotColorStyle(item.color), typeof item.style === 'string' ? item.style : item.style]"
      >
        <!-- Label / title (opposing side) - always rendered as structural spacer; CSS hides in start mode -->
        <span class="b-timeline-item__label">{{ item.title ?? '' }}</span>

        <!-- Line + dot -->
        <div class="b-timeline-item__tail" aria-hidden="true" />
        <div class="b-timeline-item__dot-wrapper" aria-hidden="true">
          <template v-if="item.icon">
            <span class="b-timeline-item__dot--custom" :data-icon="item.icon" aria-hidden="true" />
          </template>
          <template v-else-if="item.loading">
            <span class="b-timeline-item__dot--pending-spinner" />
          </template>
          <template v-else>
            <span class="b-timeline-item__dot" />
          </template>
        </div>

        <!-- Content -->
        <div class="b-timeline-item__content">{{ item.content }}</div>
      </li>
    </template>

    <!-- ── Slot-based items (default slot children) ── -->
    <template v-else>
      <slot />
    </template>

    <!-- ── Pending ghost item ── -->
    <li
      v-if="hasPending"
      class="b-timeline-item b-timeline-item--pending"
      :class="[itemPositionClass(items ? orderedItems.length : 0)]"
      aria-label="Pending"
    >
      <!-- Label spacer (structural; hidden in start mode via CSS) -->
      <span class="b-timeline-item__label" />
      <div class="b-timeline-item__tail" aria-hidden="true" />
      <div class="b-timeline-item__dot-wrapper" aria-hidden="true">
        <slot name="pendingDot">
          <span v-if="pendingDot" class="b-timeline-item__dot--custom" :data-icon="pendingDot" aria-hidden="true" />
          <span v-else class="b-timeline-item__dot--pending-spinner" aria-hidden="true" />
        </slot>
      </div>
      <div class="b-timeline-item__content">{{ pendingContent }}</div>
    </li>
  </ol>
</template>

<style>
/* ─────────────────────────────────────────────
   BTimeline - CSS custom properties (scoped to root)
   ───────────────────────────────────────────── */
.b-timeline {
  /* ── Structural ── */
  --b-timeline-line-width: 2px;
  --b-timeline-line-color: oklch(90% 0.005 260);
  --b-timeline-item-padding-bottom: 20px;

  /* ── Dot ── */
  --b-timeline-dot-size: 10px;
  --b-timeline-dot-offset: 0px;       /* fine-tune vertical alignment */
  --b-timeline-dot-border-width: 2px;
  --b-timeline-custom-dot-font-size: 20px; /* emoji / text custom dots */

  /* ── Blue (default) ── */
  --b-timeline-color-blue: oklch(54.6% 0.245 262.881);
  /* ── Green ── */
  --b-timeline-color-green: oklch(52% 0.17 145);
  /* ── Red ── */
  --b-timeline-color-red: oklch(50% 0.2 20);
  /* ── Gray ── */
  --b-timeline-color-gray: oklch(68% 0.01 260);

  /* ── Content text ── */
  --b-timeline-content-color: oklch(32% 0.02 260);
  --b-timeline-content-font-size: 14px;

  /* ── Label text ── */
  --b-timeline-label-color: oklch(52% 0.01 260);
  --b-timeline-label-font-size: 14px;

  /* ── Pending ── */
  --b-timeline-pending-line-style: dashed;
  --b-timeline-pending-dot-color: oklch(70% 0.01 260);

  /* ── Spinner ── */
  --b-timeline-spinner-size: 14px;
  --b-timeline-spinner-border-color: oklch(54.6% 0.245 262.881 / 20%);
  --b-timeline-spinner-accent-color: oklch(54.6% 0.245 262.881);
  --b-timeline-spinner-duration: 700ms;

  /* ── Transition ── */
  --b-timeline-transition-duration: 200ms;

  /* ── Layout ── */
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: var(--b-timeline-content-font-size);
  line-height: 1.5;
  color: var(--b-timeline-content-color);
}

/* ─────────────────────────────────────────────
   Item
   ───────────────────────────────────────────── */
.b-timeline-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding-bottom: var(--b-timeline-item-padding-bottom);
  margin: 0;
  list-style: none;
}

/* last item - hide tail, collapse bottom padding */
.b-timeline-item:last-child {
  padding-bottom: 0;
}

.b-timeline-item:last-child .b-timeline-item__tail {
  display: none;
}

/* ── Tail (vertical line) ── */
.b-timeline-item__tail {
  position: absolute;
  top: calc(var(--b-timeline-dot-size) + 4px);
  left: calc((var(--b-timeline-dot-size) / 2) - (var(--b-timeline-line-width) / 2)); /* overridden per-mode */
  height: calc(100% - var(--b-timeline-dot-size) - 4px);
  width: var(--b-timeline-line-width);
  background: var(--b-timeline-line-color);
  transition: background var(--b-timeline-transition-duration);
}

/* ── Dot wrapper ── */
.b-timeline-item__dot-wrapper {
  position: relative;
  flex-shrink: 0;
  width: var(--b-timeline-dot-size);
  height: var(--b-timeline-dot-size);
  margin-top: var(--b-timeline-dot-offset);
  z-index: 1;
  overflow: visible;
}

/* ── Standard dot ── */
.b-timeline-item__dot {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--b-timeline-item-current-color, var(--b-timeline-color-blue));
  box-sizing: border-box;
}

/* ── Custom dot (icon / text) ── */
.b-timeline-item__dot--custom {
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--b-timeline-custom-dot-font-size);
  line-height: 1;
  width: var(--b-timeline-custom-dot-font-size);
  height: var(--b-timeline-custom-dot-font-size);
  /* shift left/up so the icon stays centred over the dot position */
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--b-timeline-item-current-color, var(--b-timeline-color-blue));
}

/* Symbol rendered via ::before so no text node exists - avoids axe non-text-char rule */
.b-timeline-item__dot--custom::before {
  content: attr(data-icon);
}

/* ─────────────────────────────────────────────
   Preset colors - set --b-timeline-item-current-color
   ───────────────────────────────────────────── */
.b-timeline-item--blue {
  --b-timeline-item-current-color: var(--b-timeline-color-blue);
}

.b-timeline-item--green {
  --b-timeline-item-current-color: var(--b-timeline-color-green);
}

.b-timeline-item--red {
  --b-timeline-item-current-color: var(--b-timeline-color-red);
}

.b-timeline-item--gray {
  --b-timeline-item-current-color: var(--b-timeline-color-gray);
}

/* Custom (non-preset) color: provided via inline var */
.b-timeline-item--custom {
  --b-timeline-item-current-color: var(--b-timeline-item-dot-color);
}

/* ─────────────────────────────────────────────
   Content & Label
   ───────────────────────────────────────────── */
.b-timeline-item__content {
  flex: 1;
  padding-left: 12px;
  color: var(--b-timeline-content-color);
  font-size: var(--b-timeline-content-font-size);
  word-break: break-word;
}

.b-timeline-item__label {
  display: none; /* hidden in start mode; shown in alternate/end */
  color: var(--b-timeline-label-color);
  font-size: var(--b-timeline-label-font-size);
  text-align: right;
  flex-shrink: 0;
}

/* ─────────────────────────────────────────────
   Mode: start (default) - content right of line
   Each item: [dot] [content]
   ───────────────────────────────────────────── */
.b-timeline--start .b-timeline-item {
  flex-direction: row;
}

.b-timeline--start .b-timeline-item__tail {
  left: calc((var(--b-timeline-dot-size) / 2) - (var(--b-timeline-line-width) / 2));
}

.b-timeline--start .b-timeline-item__label {
  display: none;
}

/* ─────────────────────────────────────────────
   Mode: end - content left of line
   Each item: [content] [dot]
   ───────────────────────────────────────────── */
.b-timeline--end .b-timeline-item {
  flex-direction: row-reverse;
}

.b-timeline--end .b-timeline-item__content {
  padding-left: 0;
  padding-right: 12px;
  text-align: right;
}

.b-timeline--end .b-timeline-item__tail {
  right: calc((var(--b-timeline-dot-size) / 2) - (var(--b-timeline-line-width) / 2));
  left: auto;
}

.b-timeline--end .b-timeline-item__label {
  display: none;
}

/* ─────────────────────────────────────────────
   Mode: alternate
   Each row is always: [left-half][dot][right-half]
   Left items  (even): left-half = label (right-aligned)
                       right-half = content (left-aligned)
   Right items (odd):  left-half = content (right-aligned)
                       right-half = label (left-aligned)
   We use CSS `order` to swap - never flex-direction:row-reverse,
   which would flip the padding direction and break the gap.
   ───────────────────────────────────────────── */

/* Label: always rendered as a structural spacer; hidden in start mode */
.b-timeline--alternate .b-timeline-item__label {
  display: block;
  /* Each half = 50% of the row minus half the dot width.
     box-sizing:border-box means padding is included in this width,
     so the dot centre lands exactly at 50% of the row. */
  flex: 0 0 calc(50% - var(--b-timeline-dot-size) / 2);
  box-sizing: border-box;
  font-size: var(--b-timeline-label-font-size);
  color: var(--b-timeline-label-color);
  word-break: break-word;
}

/* Content: same symmetric half-width */
.b-timeline--alternate .b-timeline-item__content {
  flex: 0 0 calc(50% - var(--b-timeline-dot-size) / 2);
  box-sizing: border-box;
}

/* Tail: always at exactly 50% of the row, regardless of which items have labels */
.b-timeline--alternate .b-timeline-item__tail {
  left: calc(50% - var(--b-timeline-line-width) / 2);
  transform: none;
}

/* ── Left items (even): label LEFT → dot → content RIGHT ── */
/* DOM order: label(1) tail(abs) dot(2) content(3) - already correct, no reordering needed */
.b-timeline--alternate .b-timeline-item--left .b-timeline-item__label {
  order: 1;
  text-align: right;
  padding-right: 12px;
  padding-left: 0;
}

.b-timeline--alternate .b-timeline-item--left .b-timeline-item__dot-wrapper {
  order: 2;
}

.b-timeline--alternate .b-timeline-item--left .b-timeline-item__content {
  order: 3;
  text-align: left;
  padding-left: 12px;
  padding-right: 0;
}

/* ── Right items (odd): content LEFT → dot → label RIGHT ── */
/* Use `order` to pull content before dot, push label after dot */
.b-timeline--alternate .b-timeline-item--right .b-timeline-item__content {
  order: 1;
  text-align: right;
  padding-right: 12px;
  padding-left: 0;
}

.b-timeline--alternate .b-timeline-item--right .b-timeline-item__dot-wrapper {
  order: 2;
}

.b-timeline--alternate .b-timeline-item--right .b-timeline-item__label {
  order: 3;
  text-align: left;
  padding-left: 12px;
  padding-right: 0;
}

/* ─────────────────────────────────────────────
   Variant: outlined - hollow ring dot
   ───────────────────────────────────────────── */
.b-timeline--outlined .b-timeline-item__dot {
  background: transparent;
  border: var(--b-timeline-dot-border-width) solid
    var(--b-timeline-item-current-color, var(--b-timeline-color-blue));
}

/* ─────────────────────────────────────────────
   Orientation: horizontal
   Items laid out left-to-right; tail becomes a
   horizontal bar running to the right.
   ───────────────────────────────────────────── */
.b-timeline--horizontal {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  overflow-x: auto;
}

.b-timeline--horizontal.b-timeline--start .b-timeline-item,
.b-timeline--horizontal.b-timeline--end .b-timeline-item {
  flex-direction: column;
  align-items: center;
  flex: 1;
  padding-bottom: 0;
  padding-right: 0;
  min-width: 80px;
}

/* Horizontal tail: runs right from the dot */
.b-timeline--horizontal .b-timeline-item__tail {
  top: calc(var(--b-timeline-dot-size) / 2 - var(--b-timeline-line-width) / 2);
  left: calc(var(--b-timeline-dot-size) + 4px);
  width: calc(100% - var(--b-timeline-dot-size) - 4px);
  height: var(--b-timeline-line-width);
  right: auto;
  bottom: auto;
}

/* In horizontal mode the last item still hides its tail */
.b-timeline--horizontal .b-timeline-item:last-child .b-timeline-item__tail {
  display: none;
}

/* Dot: centred horizontally above content */
.b-timeline--horizontal .b-timeline-item__dot-wrapper {
  margin-top: 0;
  flex-shrink: 0;
}

/* Content sits below the dot row */
.b-timeline--horizontal .b-timeline-item__content {
  padding-left: 0;
  padding-top: 8px;
  text-align: center;
  width: 100%;
}

/* Label sits above the dot row (for start mode) */
.b-timeline--horizontal.b-timeline--start .b-timeline-item__label {
  display: block;
  text-align: center;
  padding-bottom: 8px;
  order: 1;
}

.b-timeline--horizontal.b-timeline--start .b-timeline-item__dot-wrapper {
  order: 2;
}

.b-timeline--horizontal.b-timeline--start .b-timeline-item__content {
  order: 3;
}

/* For end mode, label goes below content */
.b-timeline--horizontal.b-timeline--end .b-timeline-item__content {
  order: 1;
  padding-top: 8px;
  padding-right: 0;
  text-align: center;
}

.b-timeline--horizontal.b-timeline--end .b-timeline-item__dot-wrapper {
  order: 2;
}

.b-timeline--horizontal.b-timeline--end .b-timeline-item__label {
  display: block;
  text-align: center;
  padding-top: 8px;
  order: 3;
}

/* ─────────────────────────────────────────────
   Pending item
   ───────────────────────────────────────────── */
.b-timeline-item--pending .b-timeline-item__tail {
  border-left: var(--b-timeline-line-width) var(--b-timeline-pending-line-style) var(--b-timeline-line-color);
  background: transparent;
}

.b-timeline--start .b-timeline-item--pending .b-timeline-item__tail {
  /* override the absolute left, matches .b-timeline--start logic */
  left: calc((var(--b-timeline-dot-size) / 2) - (var(--b-timeline-line-width) / 2));
}

/* Horizontal pending tail */
.b-timeline--horizontal .b-timeline-item--pending .b-timeline-item__tail {
  border-left: none;
  border-top: var(--b-timeline-line-width) var(--b-timeline-pending-line-style) var(--b-timeline-line-color);
  background: transparent;
  height: 0;
}

/* ── Default pending spinner ── */
.b-timeline-item__dot--pending-spinner {
  display: block;
  width: var(--b-timeline-spinner-size);
  height: var(--b-timeline-spinner-size);
  margin-left: calc((var(--b-timeline-dot-size) - var(--b-timeline-spinner-size)) / 2);
  border-radius: 50%;
  border: var(--b-timeline-dot-border-width) solid var(--b-timeline-spinner-border-color);
  border-top-color: var(--b-timeline-spinner-accent-color);
  animation: b-timeline-spin var(--b-timeline-spinner-duration) linear infinite;
}

@keyframes b-timeline-spin {
  to { transform: rotate(360deg); }
}

/* ─────────────────────────────────────────────
   Dark mode
   ───────────────────────────────────────────── */
[data-prefers-color='dark'] .b-timeline {
  --b-timeline-line-color: oklch(32% 0.012 260);
  --b-timeline-content-color: oklch(82% 0.01 260);
  --b-timeline-label-color: oklch(60% 0.01 260);
  --b-timeline-color-gray: oklch(50% 0.01 260);
  --b-timeline-spinner-border-color: oklch(54.6% 0.245 262.881 / 15%);
}

/* ─────────────────────────────────────────────
   Reduced motion
   ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-timeline {
    --b-timeline-transition-duration: 0ms;
    --b-timeline-spinner-duration: 0ms;
  }

  .b-timeline-item__dot--pending-spinner {
    animation: none;
    border-top-color: var(--b-timeline-spinner-border-color);
    opacity: 0.6;
  }
}
</style>
