<script setup lang="ts">
import { BBadgeSize, BBadgeStatus } from '@/types.ts';
import { computed, ref, useId, watch } from 'vue';

// ─────────────────────────────────────────────
// Props & emits
// ─────────────────────────────────────────────
const {
  count = undefined,
  dot = false,
  offset,
  overflowCount = 99,
  showZero = false,
  size = BBadgeSize.Default,
  status,
  color,
  text,
  title,
} = defineProps<{
  /**
   * Number to show in badge.
   */
  count?: number | string;
  /**
   * Whether to display a red dot instead of count.
   * @default false
   */
  dot?: boolean;
  /**
   * Set offset of the badge dot: [left, top].
   */
  offset?: [number | string, number | string];
  /**
   * Max count to show. Values above display as `{overflowCount}+`.
   * @default 99
   */
  overflowCount?: number;
  /**
   * Whether to show badge when count is zero.
   * @default false
   */
  showZero?: boolean;
  /**
   * Size of the badge. Only works with count (not dot or status).
   * @default 'default'
   */
  size?: `${BBadgeSize}`;
  /**
   * Set Badge as a status dot. One of 'success' | 'processing' | 'default' | 'error' | 'warning'.
   */
  status?: `${BBadgeStatus}`;
  /**
   * Custom badge color. If set, renders as a colored dot (like status) or colored count badge.
   */
  color?: string;
  /**
   * Text to display next to a status dot or color dot.
   */
  text?: string;
  /**
   * Custom hover title for the badge.
   */
  title?: string;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
const slots = defineSlots<{
  /** Wrapped element (the thing being badged). */
  default?(): unknown;
  /** Custom count content (replaces the number). */
  count?(): unknown;
}>();

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const badgeId = useId();
const isHidden = ref(false);
const prevCount = ref<number | string | undefined>(count);

// ─────────────────────────────────────────────
// Derived state
// ─────────────────────────────────────────────
const PRESET_COLORS = [
  'pink',
  'red',
  'yellow',
  'orange',
  'cyan',
  'green',
  'blue',
  'purple',
  'geekblue',
  'magenta',
  'volcano',
  'gold',
  'lime',
] as const;

const isPresetColor = computed(() =>
  color ? (PRESET_COLORS as readonly string[]).includes(color) : false,
);

const isCustomColor = computed(() => (color ? !isPresetColor.value : false));

const isStatusMode = computed(() => {
  // Status mode: explicit status prop, or color-only without count/dot (standalone color dot)
  if (status) return true;
  if (color && !hasCount.value && !dot && !slots.count) return true;
  return false;
});

const isStandalone = computed(() => !slots.default);

const hasCount = computed(() => count !== undefined && count !== null);

const numericCount = computed(() => {
  if (typeof count === 'number') return count;
  if (typeof count === 'string') {
    const n = Number(count);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
});

const displayCount = computed(() => {
  if (slots.count) return undefined;
  if (numericCount.value !== undefined) {
    return numericCount.value > overflowCount ? `${overflowCount}+` : `${numericCount.value}`;
  }
  if (typeof count === 'string') return count;
  return undefined;
});

const shouldShowBadge = computed(() => {
  if (dot) {
    return hasCount.value ? numericCount.value !== 0 || showZero : true;
  }
  if (hasCount.value) {
    if (numericCount.value === 0) return showZero;
    return true;
  }
  if (slots.count) return true;
  return false;
});

const badgeTitle = computed(() => {
  if (title !== undefined) return title;
  if (typeof count === 'number' || typeof count === 'string') return String(count);
  return undefined;
});

const offsetStyle = computed(() => {
  if (!offset) return undefined;
  const [right, top] = offset;
  const r = typeof right === 'number' ? `${right}px` : right;
  const t = typeof top === 'number' ? `${top}px` : top;
  return {
    right: `-${r}`,
    marginTop: t,
  };
});

const statusColorStyle = computed(() => {
  if (isCustomColor.value) {
    return { backgroundColor: color };
  }
  return undefined;
});

const countColorStyle = computed(() => {
  if (isCustomColor.value) {
    return { backgroundColor: color };
  }
  return undefined;
});

// ─────────────────────────────────────────────
// Animation: track count changes for scroll
// ─────────────────────────────────────────────
watch(
  () => count,
  (newVal) => {
    prevCount.value = newVal;
  },
);

watch(
  () => {
    if (dot) return hasCount.value ? numericCount.value !== 0 || showZero : true;
    if (hasCount.value) {
      if (numericCount.value === 0) return showZero;
      return true;
    }
    return !!slots.count;
  },
  (visible) => {
    isHidden.value = !visible;
  },
);
</script>

<template>
  <!-- Status/color dot mode (standalone, no children) -->
  <span
    v-if="isStatusMode && isStandalone"
    :id="badgeId"
    class="b-badge b-badge--status"
    :class="[
      status ? `b-badge--status-${status}` : undefined,
      isPresetColor ? `b-badge--color-${color}` : undefined,
    ]"
  >
    <span
      class="b-badge__status-dot"
      :class="[
        status ? `b-badge__status-dot--${status}` : undefined,
        isPresetColor ? `b-badge__status-dot--${color}` : undefined,
      ]"
      :style="statusColorStyle"
      role="img"
      :aria-label="text || status || 'status'"
    />
    <span v-if="text" class="b-badge__status-text">{{ text }}</span>
  </span>

  <!-- Normal wrapper mode -->
  <span v-else :id="badgeId" class="b-badge" :class="[{ 'b-badge--no-wrapper': isStandalone }]">
    <slot />

    <!-- Dot indicator -->
    <sup
      v-if="dot && shouldShowBadge"
      class="b-badge__dot"
      :class="[
        isPresetColor ? `b-badge__dot--${color}` : undefined,
        {
          'b-badge__dot--custom-color': isCustomColor,
          'b-badge--motionless': false,
        },
      ]"
      :style="{ ...offsetStyle, ...countColorStyle }"
      :title="badgeTitle"
      role="status"
      :aria-label="`${badgeTitle ?? 'notification indicator'}`"
    />

    <!-- Count badge -->
    <sup
      v-else-if="shouldShowBadge && !isStatusMode"
      class="b-badge__count"
      :class="[
        {
          'b-badge__count--small': size === 'small',
          'b-badge__count--custom-color': isCustomColor,
        },
        isPresetColor ? `b-badge__count--${color}` : undefined,
      ]"
      :style="{ ...offsetStyle, ...countColorStyle }"
      :title="badgeTitle"
      role="status"
      :aria-label="`${displayCount ?? ''} ${text ?? ''}`.trim() || 'notification count'"
    >
      <slot name="count">
        {{ displayCount }}
      </slot>
    </sup>

    <!-- Status dot overlaying children -->
    <sup
      v-else-if="isStatusMode && !isStandalone && shouldShowBadge"
      class="b-badge__dot"
      :class="[
        status ? `b-badge__dot--${status}` : undefined,
        isPresetColor ? `b-badge__dot--${color}` : undefined,
        { 'b-badge__dot--custom-color': isCustomColor },
      ]"
      :style="{ ...offsetStyle, ...statusColorStyle }"
      :title="badgeTitle"
      role="status"
      :aria-label="text || status || 'status'"
    />
  </span>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (tokens)
   ──────────────────────────────────────────── */
.b-badge {
  /* Count badge */
  --b-badge-color: oklch(100% 0 0);
  --b-badge-bg: oklch(57.7% 0.245 27.325);
  --b-badge-font-size: 12px;
  --b-badge-font-size-small: 10px;
  --b-badge-font-weight: 500;
  --b-badge-height: 20px;
  --b-badge-height-small: 14px;
  --b-badge-min-width: 20px;
  --b-badge-min-width-small: 14px;
  --b-badge-padding-inline: 6px;
  --b-badge-padding-inline-small: 4px;
  --b-badge-border-radius: 10px;
  --b-badge-shadow: 0 0 0 1px oklch(100% 0 0);

  /* Dot */
  --b-badge-dot-size: 8px;
  --b-badge-dot-bg: oklch(57.7% 0.245 27.325);

  /* Status dot */
  --b-badge-status-dot-size: 8px;
  --b-badge-status-success: oklch(62.7% 0.194 149.214);
  --b-badge-status-processing: oklch(54.6% 0.245 262.881);
  --b-badge-status-default: oklch(70% 0.01 260);
  --b-badge-status-error: oklch(57.7% 0.245 27.325);
  --b-badge-status-warning: oklch(72.6% 0.191 68.916);

  /* Text */
  --b-badge-status-text-color: oklch(27% 0.01 260);
  --b-badge-status-text-font-size: 14px;

  /* Preset colors */
  --b-badge-color-pink: oklch(53% 0.2 0);
  --b-badge-color-red: oklch(57.7% 0.245 27.325);
  --b-badge-color-yellow: oklch(53% 0.13 90);
  --b-badge-color-orange: oklch(53% 0.16 55);
  --b-badge-color-cyan: oklch(50% 0.1 200);
  --b-badge-color-green: oklch(50% 0.15 149.214);
  --b-badge-color-blue: oklch(54.6% 0.245 262.881);
  --b-badge-color-purple: oklch(54% 0.22 290);
  --b-badge-color-geekblue: oklch(50% 0.22 270);
  --b-badge-color-magenta: oklch(57% 0.24 350);
  --b-badge-color-volcano: oklch(53% 0.18 30);
  --b-badge-color-gold: oklch(53% 0.13 75);
  --b-badge-color-lime: oklch(50% 0.14 125);

  /* Animation */
  --b-badge-animation-duration: 300ms;

  /* Z-index */
  --b-badge-z-index: auto;
}

/* ── Dark mode ───────────────────────────────── */
[data-prefers-color='dark'] .b-badge {
  --b-badge-shadow: 0 0 0 1px oklch(20% 0.01 260);
  --b-badge-status-text-color: oklch(85% 0.01 260);
  --b-badge-status-default: oklch(50% 0.01 260);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-badge {
    --b-badge-shadow: 0 0 0 1px oklch(20% 0.01 260);
    --b-badge-status-text-color: oklch(85% 0.01 260);
    --b-badge-status-default: oklch(50% 0.01 260);
  }
}

/* ─────────────────────────────────────────────
   Base layout
   ───────────────────────────────────────────── */
.b-badge {
  position: relative;
  display: inline-flex;
  vertical-align: middle;
  line-height: 1;
  box-sizing: border-box;
}

.b-badge--no-wrapper {
  /* Standalone badges don't need positioning context */
}

/* ─────────────────────────────────────────────
   Count badge (number)
   ───────────────────────────────────────────── */
.b-badge__count {
  position: absolute;
  top: 0;
  inset-inline-end: 0;
  transform: translate(50%, -50%);
  transform-origin: 100% 0%;
  z-index: var(--b-badge-z-index);

  display: inline-flex;
  align-items: center;
  justify-content: center;

  min-width: var(--b-badge-min-width);
  height: var(--b-badge-height);
  padding: 0 var(--b-badge-padding-inline);
  border-radius: var(--b-badge-border-radius);
  box-shadow: var(--b-badge-shadow);

  font-size: var(--b-badge-font-size);
  font-weight: var(--b-badge-font-weight);
  font-family: inherit;
  color: var(--b-badge-color);
  background: var(--b-badge-bg);
  white-space: nowrap;
  text-align: center;
  line-height: var(--b-badge-height);
  box-sizing: border-box;
  cursor: default;

  animation: b-badge-zoom-in var(--b-badge-animation-duration) ease both;
}

.b-badge__count--small {
  min-width: var(--b-badge-min-width-small);
  height: var(--b-badge-height-small);
  padding: 0 var(--b-badge-padding-inline-small);
  font-size: var(--b-badge-font-size-small);
  line-height: var(--b-badge-height-small);
  border-radius: calc(var(--b-badge-height-small) / 2);
}

/* ─────────────────────────────────────────────
   Dot indicator
   ───────────────────────────────────────────── */
.b-badge__dot {
  position: absolute;
  top: 0;
  inset-inline-end: 0;
  transform: translate(50%, -50%);
  transform-origin: 100% 0%;
  z-index: var(--b-badge-z-index);

  width: var(--b-badge-dot-size);
  height: var(--b-badge-dot-size);
  border-radius: 50%;
  background: var(--b-badge-dot-bg);
  box-shadow: var(--b-badge-shadow);
  cursor: default;
  pointer-events: none;

  animation: b-badge-zoom-in var(--b-badge-animation-duration) ease both;
}

/* ─────────────────────────────────────────────
   Status mode (standalone)
   ───────────────────────────────────────────── */
.b-badge--status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  line-height: 1;
  vertical-align: middle;
}

.b-badge__status-dot {
  display: inline-block;
  width: var(--b-badge-status-dot-size);
  height: var(--b-badge-status-dot-size);
  border-radius: 50%;
  flex-shrink: 0;
}

.b-badge__status-dot--success {
  background-color: var(--b-badge-status-success);
}

.b-badge__status-dot--processing {
  background-color: var(--b-badge-status-processing);
}

.b-badge__status-dot--default {
  background-color: var(--b-badge-status-default);
}

.b-badge__status-dot--error {
  background-color: var(--b-badge-status-error);
}

.b-badge__status-dot--warning {
  background-color: var(--b-badge-status-warning);
}

/* Processing animation */
.b-badge__status-dot--processing::after {
  content: '';
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid var(--b-badge-status-processing);
  animation: b-badge-processing 1.2s ease-in-out infinite;
}

.b-badge__status-dot--processing {
  position: relative;
}

.b-badge__status-text {
  color: var(--b-badge-status-text-color);
  font-size: var(--b-badge-status-text-font-size);
  line-height: 1;
}

/* ─────────────────────────────────────────────
   Preset colors for dots and counts
   ───────────────────────────────────────────── */
.b-badge__dot--pink,
.b-badge__count--pink,
.b-badge__status-dot--pink {
  background-color: var(--b-badge-color-pink);
}

.b-badge__dot--red,
.b-badge__count--red,
.b-badge__status-dot--red {
  background-color: var(--b-badge-color-red);
}

.b-badge__dot--yellow,
.b-badge__count--yellow,
.b-badge__status-dot--yellow {
  background-color: var(--b-badge-color-yellow);
}

.b-badge__dot--orange,
.b-badge__count--orange,
.b-badge__status-dot--orange {
  background-color: var(--b-badge-color-orange);
}

.b-badge__dot--cyan,
.b-badge__count--cyan,
.b-badge__status-dot--cyan {
  background-color: var(--b-badge-color-cyan);
}

.b-badge__dot--green,
.b-badge__count--green,
.b-badge__status-dot--green {
  background-color: var(--b-badge-color-green);
}

.b-badge__dot--blue,
.b-badge__count--blue,
.b-badge__status-dot--blue {
  background-color: var(--b-badge-color-blue);
}

.b-badge__dot--purple,
.b-badge__count--purple,
.b-badge__status-dot--purple {
  background-color: var(--b-badge-color-purple);
}

.b-badge__dot--geekblue,
.b-badge__count--geekblue,
.b-badge__status-dot--geekblue {
  background-color: var(--b-badge-color-geekblue);
}

.b-badge__dot--magenta,
.b-badge__count--magenta,
.b-badge__status-dot--magenta {
  background-color: var(--b-badge-color-magenta);
}

.b-badge__dot--volcano,
.b-badge__count--volcano,
.b-badge__status-dot--volcano {
  background-color: var(--b-badge-color-volcano);
}

.b-badge__dot--gold,
.b-badge__count--gold,
.b-badge__status-dot--gold {
  background-color: var(--b-badge-color-gold);
}

.b-badge__dot--lime,
.b-badge__count--lime,
.b-badge__status-dot--lime {
  background-color: var(--b-badge-color-lime);
}

/* Custom color via style binding */
.b-badge__dot--custom-color,
.b-badge__count--custom-color {
  /* backgroundColor set via inline style */
}

/* ─────────────────────────────────────────────
   Animations
   ───────────────────────────────────────────── */
@keyframes b-badge-zoom-in {
  0% {
    opacity: 0;
    transform: translate(50%, -50%) scale(0);
  }
  100% {
    opacity: 1;
    transform: translate(50%, -50%) scale(1);
  }
}

@keyframes b-badge-processing {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
}

/* ─────────────────────────────────────────────
   Reduced motion
   ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-badge__count,
  .b-badge__dot {
    animation: none;
  }

  .b-badge__status-dot--processing::after {
    animation: none;
  }
}
</style>
