<script setup lang="ts">
import { computed, useSlots } from 'vue';

import type { BStatisticFormatter, BStatisticValue } from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  title,
  value,
  prefix,
  suffix,
  precision,
  decimalSeparator = '.',
  groupSeparator = ',',
  loading = false,
  valueStyle,
  formatter,
} = defineProps<{
  /** Display title shown above the value. Use `#title` slot for richer content. */
  title?: string;
  /** Display value. Numbers are formatted; strings render as-is. */
  value: BStatisticValue;
  /** Prefix text before the value. Use `#prefix` slot for richer content. */
  prefix?: string;
  /** Suffix text after the value. Use `#suffix` slot for richer content. */
  suffix?: string;
  /** Number of digits after the decimal point. Applied only to numeric values. */
  precision?: number;
  /** Character used as the decimal separator. @default '.' */
  decimalSeparator?: string;
  /** Character used as the thousands group separator. @default ',' */
  groupSeparator?: string;
  /** Show a skeleton placeholder instead of the value. @default false */
  loading?: boolean;
  /** Inline style applied to the value element. */
  valueStyle?: string | Record<string, string | number>;
  /** Function that returns a custom display string. Overridden by `#formatter` slot. */
  formatter?: BStatisticFormatter;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /** Custom title content; overrides `title` prop. */
  title?(): unknown;
  /** Prefix content; overrides `prefix` prop. */
  prefix?(): unknown;
  /** Suffix content; overrides `suffix` prop. */
  suffix?(): unknown;
  /** Custom value renderer; receives `{ value }`. Overrides `formatter` prop. */
  formatter?(payload: { value: BStatisticValue }): unknown;
}>();

const slots = useSlots();

// ─────────────────────────────────────────────
// Number formatting
// ─────────────────────────────────────────────
const formattedValue = computed<string>(() => {
  if (formatter) return String(formatter(value));
  if (typeof value !== 'number') return String(value ?? '');
  if (Number.isNaN(value)) return 'NaN';
  if (!Number.isFinite(value)) return String(value);

  const negative = value < 0;
  const abs = Math.abs(value);

  let str: string;
  if (precision != null && precision >= 0) {
    str = abs.toFixed(precision);
  } else {
    str = String(abs);
  }

  const [intPart, decPart] = str.split('.');
  const intWithGroups = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
  const result = decPart != null ? `${intWithGroups}${decimalSeparator}${decPart}` : intWithGroups;
  return negative ? `-${result}` : result;
});

const hasTitle = computed(() => !!slots.title || (title != null && title !== ''));
const hasPrefix = computed(() => !!slots.prefix || (prefix != null && prefix !== ''));
const hasSuffix = computed(() => !!slots.suffix || (suffix != null && suffix !== ''));
</script>

<template>
  <div class="b-statistic" :class="{ 'b-statistic--loading': loading }">
    <div v-if="hasTitle" class="b-statistic__title">
      <slot name="title">{{ title }}</slot>
    </div>
    <div class="b-statistic__content" :style="valueStyle" aria-live="polite">
      <span
        v-if="loading"
        class="b-statistic__skeleton"
        role="status"
        aria-busy="true"
        aria-label="Loading"
      />
      <template v-else>
        <span v-if="hasPrefix" class="b-statistic__prefix" aria-hidden="true">
          <slot name="prefix">{{ prefix }}</slot>
        </span>
        <span class="b-statistic__value">
          <slot name="formatter" :value="value">{{ formattedValue }}</slot>
        </span>
        <span v-if="hasSuffix" class="b-statistic__suffix" aria-hidden="true">
          <slot name="suffix">{{ suffix }}</slot>
        </span>
      </template>
    </div>
  </div>
</template>

<style>
/* ─────────────────────────────────────────────
   BStatistic - CSS custom properties (scoped to root)
   ───────────────────────────────────────────── */
.b-statistic {
  /* ── Title ── */
  --b-statistic-title-color: oklch(45% 0.02 260);
  --b-statistic-title-font-size: 14px;
  --b-statistic-title-line-height: 1.5715;
  --b-statistic-title-margin-bottom: 4px;

  /* ── Content (value) ── */
  --b-statistic-content-color: oklch(20% 0.02 260);
  --b-statistic-content-font-size: 24px;
  --b-statistic-content-line-height: 1.5;
  --b-statistic-content-font-family: inherit;
  --b-statistic-content-font-weight: 400;

  /* ── Prefix / Suffix ── */
  --b-statistic-prefix-color: inherit;
  --b-statistic-prefix-font-size: inherit;
  --b-statistic-prefix-margin-end: 4px;
  --b-statistic-suffix-color: inherit;
  --b-statistic-suffix-font-size: inherit;
  --b-statistic-suffix-margin-start: 4px;

  /* ── Skeleton ── */
  --b-statistic-skeleton-color: oklch(92% 0.005 260);
  --b-statistic-skeleton-highlight: oklch(96% 0.003 260);
  --b-statistic-skeleton-width: 96px;
  --b-statistic-skeleton-height: 1em;
  --b-statistic-skeleton-radius: 4px;
  --b-statistic-skeleton-duration: 1.4s;

  font-family: var(--b-statistic-content-font-family);
  color: var(--b-statistic-content-color);
}

/* ─────────────────────────────────────────────
   Title
   ───────────────────────────────────────────── */
.b-statistic__title {
  margin-bottom: var(--b-statistic-title-margin-bottom);
  color: var(--b-statistic-title-color);
  font-size: var(--b-statistic-title-font-size);
  line-height: var(--b-statistic-title-line-height);
}

/* ─────────────────────────────────────────────
   Content / value
   ───────────────────────────────────────────── */
.b-statistic__content {
  display: inline-flex;
  align-items: baseline;
  color: var(--b-statistic-content-color);
  font-size: var(--b-statistic-content-font-size);
  font-weight: var(--b-statistic-content-font-weight);
  line-height: var(--b-statistic-content-line-height);
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
  word-break: break-word;
  max-width: 100%;
}

.b-statistic__value {
  display: inline-block;
}

.b-statistic__prefix {
  display: inline-flex;
  align-items: center;
  margin-inline-end: var(--b-statistic-prefix-margin-end);
  color: var(--b-statistic-prefix-color);
  font-size: var(--b-statistic-prefix-font-size);
}

.b-statistic__suffix {
  display: inline-flex;
  align-items: center;
  margin-inline-start: var(--b-statistic-suffix-margin-start);
  color: var(--b-statistic-suffix-color);
  font-size: var(--b-statistic-suffix-font-size);
}

/* ─────────────────────────────────────────────
   Loading skeleton
   ───────────────────────────────────────────── */
.b-statistic__skeleton {
  display: inline-block;
  width: var(--b-statistic-skeleton-width);
  height: var(--b-statistic-skeleton-height);
  border-radius: var(--b-statistic-skeleton-radius);
  background: linear-gradient(
    90deg,
    var(--b-statistic-skeleton-color) 25%,
    var(--b-statistic-skeleton-highlight) 37%,
    var(--b-statistic-skeleton-color) 63%
  );
  background-size: 400% 100%;
  animation: b-statistic-shimmer var(--b-statistic-skeleton-duration) ease infinite;
}

@keyframes b-statistic-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

/* ─────────────────────────────────────────────
   Dark mode
   ───────────────────────────────────────────── */
[data-prefers-color='dark'] .b-statistic {
  --b-statistic-title-color: oklch(70% 0.01 260);
  --b-statistic-content-color: oklch(92% 0.01 260);
  --b-statistic-skeleton-color: oklch(28% 0.01 260);
  --b-statistic-skeleton-highlight: oklch(35% 0.01 260);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-statistic {
    --b-statistic-title-color: oklch(70% 0.01 260);
    --b-statistic-content-color: oklch(92% 0.01 260);
    --b-statistic-skeleton-color: oklch(28% 0.01 260);
    --b-statistic-skeleton-highlight: oklch(35% 0.01 260);
  }
}

/* ─────────────────────────────────────────────
   Reduced motion
   ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-statistic {
    --b-statistic-skeleton-duration: 0ms;
  }
  .b-statistic__skeleton {
    animation: none;
    opacity: 0.6;
  }
}
</style>
