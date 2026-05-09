<script setup lang="ts">
import { computed, inject } from 'vue';

import type { BTimelineItemColor, BTimelineItemPlacement, BTimelineVariant } from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  color = 'blue',
  icon,
  loading = false,
  placement,
} = defineProps<{
  /**
   * Dot color - preset (`blue` | `red` | `green` | `gray`) or any CSS color.
   * @default 'blue'
   */
  color?: BTimelineItemColor;
  /**
   * Custom dot content string/emoji. Use the `#icon` slot for rich content.
   */
  icon?: string;
  /**
   * Shows a spinner on this item's dot - use for in-progress items.
   * @default false
   */
  loading?: boolean;
  /**
   * Override the parent timeline's mode for this item only.
   * Pins the item to the `'start'` or `'end'` side regardless of mode.
   */
  placement?: BTimelineItemPlacement;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /** Main content of the timeline item. */
  default?(): unknown;
  /** Custom dot/icon content - fully replaces the standard circle. */
  icon?(): unknown;
  /** Label shown on the opposing side in alternate/end mode. */
  label?(): unknown;
}>();

// ─────────────────────────────────────────────
// Context from parent (mode + item index + variant)
// ─────────────────────────────────────────────
const timelineMode = inject<'start' | 'alternate' | 'end'>('b-timeline-mode', 'start');
const timelineIndex = inject<number>('b-timeline-item-index', 0);
const timelineVariant = inject<BTimelineVariant>('b-timeline-variant', 'filled');

// ─────────────────────────────────────────────
// Color helpers
// ─────────────────────────────────────────────
const PRESET_COLORS: string[] = ['blue', 'red', 'green', 'gray'];

const isPreset = computed(() => PRESET_COLORS.includes(color));

const colorClass = computed(() =>
  isPreset.value ? `b-timeline-item--${color}` : 'b-timeline-item--custom',
);

const colorStyle = computed<Record<string, string> | undefined>(() =>
  !isPreset.value ? { '--b-timeline-item-dot-color': color } : undefined,
);

// ─────────────────────────────────────────────
// Position class
// ─────────────────────────────────────────────
const positionClass = computed(() => {
  // Per-item placement overrides the global mode
  if (placement) {
    return placement === 'end' ? 'b-timeline-item--right' : 'b-timeline-item--left';
  }
  if (timelineMode === 'alternate') {
    return timelineIndex % 2 === 0 ? 'b-timeline-item--left' : 'b-timeline-item--right';
  }
  return timelineMode === 'end' ? 'b-timeline-item--right' : 'b-timeline-item--left';
});

// ─────────────────────────────────────────────
// Root classes
// ─────────────────────────────────────────────
const rootClasses = computed(() => [
  'b-timeline-item',
  colorClass.value,
  positionClass.value,
  { 'b-timeline-item--pending': loading },
]);

// ─────────────────────────────────────────────
// Variant (injected from parent BTimeline)
// ─────────────────────────────────────────────
const variantClass = computed(() =>
  timelineVariant === 'outlined' ? 'b-timeline-item__dot--outlined' : undefined,
);
</script>

<template>
  <li
    :class="rootClasses"
    :style="colorStyle"
  >
    <!-- Label - always rendered as a structural spacer; CSS hides it in start mode -->
    <span class="b-timeline-item__label">
      <slot name="label" />
    </span>

    <!-- Tail (connecting line) -->
    <div class="b-timeline-item__tail" aria-hidden="true" />

    <!-- Dot -->
    <div class="b-timeline-item__dot-wrapper" aria-hidden="true">
      <slot name="icon">
        <template v-if="icon">
          <span class="b-timeline-item__dot b-timeline-item__dot--custom" :data-icon="icon" aria-hidden="true" />
        </template>
        <template v-else-if="loading">
          <span class="b-timeline-item__dot--pending-spinner" />
        </template>
        <template v-else>
          <span class="b-timeline-item__dot" :class="variantClass" />
        </template>
      </slot>
    </div>

    <!-- Content -->
    <div class="b-timeline-item__content">
      <slot />
    </div>
  </li>
</template>
