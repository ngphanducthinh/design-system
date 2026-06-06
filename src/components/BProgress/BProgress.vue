<script setup lang="ts">
import { BCommonColor, BCommonSize } from '@/types.ts';
import { computed } from 'vue';

/** Visual shape — circular ring or horizontal linear bar. */
export type BProgressShape = 'linear' | 'circle';

/** Semantic status — non-`normal` values override `color` with a matching theme color. */
export type BProgressStatus = 'normal' | 'success' | 'error' | 'warning';

const {
  percent,
  max = 100,
  shape = 'circle',
  size = BCommonSize.Medium,
  color = BCommonColor.Primary,
  status = 'normal',
  showLabel = true,
  indeterminate = false,
  strokeWidth,
  formatter,
} = defineProps<{
  /**
   * Current progress value (uncontrolled fallback when `v-model` is not used).
   * Clamped to `[0, max]`.
   */
  percent?: number;
  /**
   * Maximum value of the progress range. The displayed percentage is
   * `(value / max) * 100`. Defaults to `100` so a raw `percent` works as a percentage.
   */
  max?: number;
  /** Visual shape — circular ring or horizontal bar. Default `'circle'`. */
  shape?: BProgressShape;
  /** Size preset. Affects diameter for `circle` and track height for `linear`. */
  size?: `${BCommonSize}`;
  /** Color family for the filled portion. Overridden by `status` when not `'normal'`. */
  color?: `${BCommonColor}`;
  /** Semantic status. Maps to: `success`→success, `error`→failure, `warning`→warning. */
  status?: BProgressStatus;
  /** Whether to render the textual progress label. Default `true`. */
  showLabel?: boolean;
  /**
   * Render an indefinite-duration animation instead of a value-driven fill.
   * `aria-valuenow` is omitted while indeterminate, per ARIA spec.
   */
  indeterminate?: boolean;
  /** Override for the bar / ring thickness. Numeric values are treated as `px`. */
  strokeWidth?: string | number;
  /**
   * Custom label formatter — receives `(value, max, percentage)`.
   * Defaults to `${Math.round(percentage)}%`.
   */
  formatter?: (value: number, max: number, percentage: number) => string;
}>();

/** Two-way bound progress value. Falls back to the `percent` prop when not bound. */
const model = defineModel<number>();

const rawValue = computed(() => model.value ?? percent ?? 0);
const clamped = computed(() => Math.min(max, Math.max(0, rawValue.value)));
const percentage = computed(() => (max <= 0 ? 0 : (clamped.value / max) * 100));
const percentString = computed(() => `${percentage.value}%`);

const isComplete = computed(() => !indeterminate && percentage.value >= 100);

/**
 * `aria-busy` is true while indeterminate or actively progressing (0 < value < max).
 * It is false at idle (0) and complete (max), so screen readers do not vocalise
 * every intermediate update.
 * https://www.w3.org/TR/wai-aria-1.2/#aria-busy
 */
const isBusy = computed(
  () => indeterminate || (percentage.value > 0 && percentage.value < 100),
);

const effectiveColor = computed<`${BCommonColor}`>(() => {
  switch (status) {
    case 'success':
      return BCommonColor.Success;
    case 'error':
      return BCommonColor.Failure;
    case 'warning':
      return BCommonColor.Warning;
    default:
      return color;
  }
});

const labelText = computed(() => {
  if (formatter) return formatter(clamped.value, max, percentage.value);
  return `${Math.round(percentage.value)}%`;
});

const rootStyle = computed(() => {
  const style: Record<string, string> = {
    '--b-progress-percent': percentString.value,
  };
  if (strokeWidth !== undefined) {
    style['--b-progress-bar-width'] =
      typeof strokeWidth === 'number' ? `${strokeWidth}px` : strokeWidth;
  }
  return style;
});
</script>

<template>
  <div
    role="progressbar"
    class="b-progress"
    :class="[
      `b-progress--${shape}`,
      `b-progress--${size}`,
      `b-progress--${effectiveColor}`,
      {
        'b-progress--indeterminate': indeterminate,
        'b-progress--complete': isComplete,
        'b-progress--with-label': showLabel,
      },
    ]"
    :aria-valuenow="indeterminate ? undefined : Math.round(clamped)"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-busy="isBusy"
    :style="rootStyle"
  >
    <!-- Linear -->
    <template v-if="shape === 'linear'">
      <div class="b-progress__track">
        <div class="b-progress__fill" />
      </div>
      <span v-if="showLabel" class="b-progress__label">{{ labelText }}</span>
    </template>

    <!-- Circle -->
    <template v-else>
      <!--
        The inner disc is a real element (not ::after) so axe-core can trace
        the label's effective background through the DOM. Pseudo-element
        backgrounds break the contrast analyzer with "Element's background
        color could not be determined due to a pseudo element".
      -->
      <div class="b-progress__inner" aria-hidden="true" />
      <span v-if="showLabel" class="b-progress__label">{{ labelText }}</span>
    </template>
  </div>
</template>

<style>
/*
 * Animate the percentage stop with @property so conic-gradient (circle) and
 * width (linear) transition smoothly. The component reads --b-progress-percent
 * from inline style and CSS resolves it.
 * https://developer.mozilla.org/en-US/docs/Web/CSS/@property
 */
@property --b-progress-percent {
  syntax: '<percentage>';
  inherits: true;
  initial-value: 0%;
}

.b-progress {
  /* ── Component tokens (root only — never on :root) ─────────────────────── */
  --b-progress-size: 6rem;
  --b-progress-bar-width: 0.75rem;
  --b-progress-font-size: 1rem;
  --b-progress-track-color: oklch(92% 0.004 286.32);
  --b-progress-fill-color: var(--color-primary, oklch(55% 0.169 237.323));
  --b-progress-label-color: oklch(0 0 0 / 0.85);
  --b-progress-bg-color: white;
  --b-progress-radius: 999px;
  --b-progress-transition-duration: 0.5s;
  --b-progress-percent: 0%;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--b-progress-label-color);
  font-size: var(--b-progress-font-size);
}

/* ── Color families — map to global theme tokens ────────────────────────── */
.b-progress--primary {
  --b-progress-fill-color: var(--color-primary, oklch(55% 0.169 237.323));
}
.b-progress--secondary {
  --b-progress-fill-color: var(--color-secondary, oklch(60% 0.004 286.32));
}
.b-progress--success {
  --b-progress-fill-color: var(--color-success, oklch(50% 0.17 149.579));
}
.b-progress--failure {
  --b-progress-fill-color: var(--color-failure, oklch(55% 0.22 25.331));
}
.b-progress--warning {
  --b-progress-fill-color: var(--color-warning, oklch(55% 0.16 55.934));
}
.b-progress--info {
  --b-progress-fill-color: var(--color-info, oklch(55% 0.2 259.815));
}

/* ── Sizes — circle ─────────────────────────── */
.b-progress--circle.b-progress--sm {
  --b-progress-size: 4rem;
  --b-progress-bar-width: 0.5rem;
  --b-progress-font-size: 0.75rem;
}
.b-progress--circle.b-progress--md {
  --b-progress-size: 6rem;
  --b-progress-bar-width: 0.75rem;
  --b-progress-font-size: 1rem;
}
.b-progress--circle.b-progress--lg {
  --b-progress-size: 8rem;
  --b-progress-bar-width: 1rem;
  --b-progress-font-size: 1.25rem;
}

/* ── Sizes — linear (track height + label) ───────────────────────────────── */
.b-progress--linear.b-progress--sm {
  --b-progress-bar-width: 0.375rem;
  --b-progress-font-size: 0.75rem;
}
.b-progress--linear.b-progress--md {
  --b-progress-bar-width: 0.625rem;
  --b-progress-font-size: 0.875rem;
}
.b-progress--linear.b-progress--lg {
  --b-progress-bar-width: 0.875rem;
  --b-progress-font-size: 1rem;
}

/* ── Linear shape ───────────────────────────────────────────────────────── */
.b-progress--linear {
  width: 100%;
  gap: 0.5rem;
}

.b-progress--linear .b-progress__track {
  flex: 1;
  position: relative;
  height: var(--b-progress-bar-width);
  background: var(--b-progress-track-color);
  border-radius: var(--b-progress-radius);
  overflow: hidden;
}

.b-progress--linear .b-progress__fill {
  height: 100%;
  width: var(--b-progress-percent);
  background: var(--b-progress-fill-color);
  border-radius: inherit;
  transition: width var(--b-progress-transition-duration) ease;
}

.b-progress--linear .b-progress__label {
  flex: 0 0 auto;
  min-width: 2.5rem;
  text-align: right;
  font-size: inherit;
  font-variant-numeric: tabular-nums;
}

/* ── Circle shape ───────────────────────────────────────────────────────── */
.b-progress--circle {
  width: var(--b-progress-size);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background: conic-gradient(
    var(--b-progress-fill-color) var(--b-progress-percent),
    var(--b-progress-track-color) 0%
  );
  transition: --b-progress-percent var(--b-progress-transition-duration) linear;
  display: grid;
  place-items: center;
  position: relative;
}

/* The inner disc cuts a ring out of the conic-gradient. Rendered as a real
 * element (not ::after) so axe-core can trace the label's background. */
.b-progress--circle .b-progress__inner {
  position: absolute;
  inset: var(--b-progress-bar-width);
  background: var(--b-progress-bg-color);
  border-radius: inherit;
}

.b-progress--circle .b-progress__label {
  position: relative;
  z-index: 1;
  font-size: var(--b-progress-font-size);
  font-variant-numeric: tabular-nums;
}

/* ── Indeterminate ──────────────────────────────────────────────────────── */
.b-progress--indeterminate.b-progress--linear .b-progress__fill {
  width: 40%;
  animation: b-progress-linear-indeterminate 1.4s ease-in-out infinite;
}

@keyframes b-progress-linear-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(250%);
  }
}

.b-progress--indeterminate.b-progress--circle {
  background: conic-gradient(
    var(--b-progress-fill-color) 0% 25%,
    var(--b-progress-track-color) 25% 100%
  );
  animation: b-progress-circle-indeterminate 1s linear infinite;
  transition: none;
}

@keyframes b-progress-circle-indeterminate {
  to {
    transform: rotate(360deg);
  }
}

.b-progress--indeterminate .b-progress__label {
  visibility: hidden;
}

/* ── Reduced motion ─────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-progress--circle,
  .b-progress--linear .b-progress__fill,
  .b-progress--indeterminate.b-progress--circle,
  .b-progress--indeterminate.b-progress--linear .b-progress__fill {
    transition: none;
    animation: none;
  }
}

/* ── Dark mode (reassign existing vars; never introduce new ones) ───────── */
[data-prefers-color='dark'] .b-progress {
  --b-progress-track-color: oklch(28% 0.005 286);
  --b-progress-bg-color: oklch(18% 0.005 286);
  --b-progress-label-color: oklch(96% 0.002 286);
}

/* `[data-prefers-color='system']` follows the OS — but only when the user has
 * actively chosen "system". Without this scoping, the @media query would
 * override an explicit light choice on a dark-mode OS. */
@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-progress {
    --b-progress-track-color: oklch(28% 0.005 286);
    --b-progress-bg-color: oklch(18% 0.005 286);
    --b-progress-label-color: oklch(96% 0.002 286);
  }
}
</style>
