<script setup lang="ts">
import { BSpinSize } from '@/types.ts';
import { computed, ref, useId, watch } from 'vue';

// ─────────────────────────────────────────────
// Props & emits
// ─────────────────────────────────────────────
const {
  spinning = true,
  size = BSpinSize.Default,
  tip = '',
  delay = 0,
  fullscreen = false,
} = defineProps<{
  /**
   * Whether the Spin indicator is active.
   * @default true
   */
  spinning?: boolean;
  /**
   * Size of the spinner - small, default, or large.
   * @default 'default'
   */
  size?: `${BSpinSize}`;
  /**
   * Descriptive text displayed below the spinning indicator.
   */
  tip?: string;
  /**
   * Delay in milliseconds before the spinner shows after `spinning` becomes true.
   * Prevents flicker for fast operations. Does not apply to hiding.
   * @default 0
   */
  delay?: number;
  /**
   * Display as fullscreen overlay (fixed, covers the entire viewport).
   * @default false
   */
  fullscreen?: boolean;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
const slots = defineSlots<{
  /** Content to wrap with a spinning overlay. */
  default?(): unknown;
  /** Custom spinner indicator (replaces the default dots). */
  indicator?(): unknown;
  /** Custom tip content (replaces the `tip` prop text). */
  tip?(): unknown;
}>();

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const tipId = useId();

/** Delayed spinning state - respects `delay` prop. */
const shouldShow = ref(false);
let delayTimer: ReturnType<typeof setTimeout> | undefined;

function applySpinning(value: boolean) {
  clearTimeout(delayTimer);
  if (value && delay > 0) {
    delayTimer = setTimeout(() => {
      shouldShow.value = true;
    }, delay);
  } else {
    shouldShow.value = value;
  }
}

// Run immediately on mount, then watch for changes
applySpinning(spinning);

watch(() => spinning, applySpinning);

// ─────────────────────────────────────────────
// Derived state
// ─────────────────────────────────────────────
const isNested = computed(() => Boolean(slots.default));
const hasTip = computed(() => Boolean(tip || slots.tip));

const rootClasses = computed(() => [
  'b-spin',
  `b-spin--${size}`,
  {
    'b-spin--spinning': shouldShow.value,
    'b-spin--nested': isNested.value,
    'b-spin--has-tip': hasTip.value,
    'b-spin--fullscreen': fullscreen,
  },
]);
</script>

<template>
  <!-- Fullscreen mode: uses Teleport to <body> -->
  <Teleport v-if="fullscreen" to="body">
    <Transition name="b-spin-fade">
      <div
        v-if="shouldShow"
        class="b-spin b-spin--fullscreen"
        :class="[`b-spin--${size}`, { 'b-spin--spinning': shouldShow, 'b-spin--has-tip': hasTip }]"
        role="status"
        :aria-label="hasTip ? undefined : 'Loading'"
        :aria-describedby="hasTip ? tipId : undefined"
      >
        <div class="b-spin__indicator" aria-hidden="true">
          <slot name="indicator">
            <span class="b-spin__dot">
              <i class="b-spin__dot-item" />
              <i class="b-spin__dot-item" />
              <i class="b-spin__dot-item" />
              <i class="b-spin__dot-item" />
            </span>
          </slot>
        </div>
        <div v-if="hasTip" :id="tipId" class="b-spin__tip">
          <slot name="tip">{{ tip }}</slot>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Standalone (no children) -->
  <template v-else-if="!isNested">
    <div
      v-if="shouldShow"
      :class="rootClasses"
      role="status"
      :aria-label="hasTip ? undefined : 'Loading'"
      :aria-describedby="hasTip ? tipId : undefined"
    >
      <div class="b-spin__indicator" aria-hidden="true">
        <slot name="indicator">
          <span class="b-spin__dot">
            <i class="b-spin__dot-item" />
            <i class="b-spin__dot-item" />
            <i class="b-spin__dot-item" />
            <i class="b-spin__dot-item" />
          </span>
        </slot>
      </div>
      <div v-if="hasTip" :id="tipId" class="b-spin__tip">
        <slot name="tip">{{ tip }}</slot>
      </div>
    </div>
  </template>

  <!-- Nested (wraps children) -->
  <div v-else :class="rootClasses">
    <div
      v-if="shouldShow"
      class="b-spin__overlay-container"
      role="status"
      :aria-label="hasTip ? undefined : 'Loading'"
      :aria-describedby="hasTip ? tipId : undefined"
    >
      <div class="b-spin__indicator" aria-hidden="true">
        <slot name="indicator">
          <span class="b-spin__dot">
            <i class="b-spin__dot-item" />
            <i class="b-spin__dot-item" />
            <i class="b-spin__dot-item" />
            <i class="b-spin__dot-item" />
          </span>
        </slot>
      </div>
      <div v-if="hasTip" :id="tipId" class="b-spin__tip">
        <slot name="tip">{{ tip }}</slot>
      </div>
    </div>
    <div
      class="b-spin__content"
      :class="{ 'b-spin__content--blurred': shouldShow }"
      :aria-busy="shouldShow"
      :inert="shouldShow"
    >
      <slot />
    </div>
  </div>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (tokens)
   ──────────────────────────────────────────── */
.b-spin {
  /* Dot sizes per variant */
  --b-spin-dot-size-small: 14px;
  --b-spin-dot-size-default: 20px;
  --b-spin-dot-size-large: 32px;

  /* Dot colour */
  --b-spin-dot-color: oklch(50% 0.169 237.323); /* primary – darkened for AA contrast */

  /* Tip text */
  --b-spin-tip-color: oklch(50% 0.169 237.323);
  --b-spin-tip-font-size: 0.875rem;

  /* Overlay */
  --b-spin-overlay-bg: oklch(100% 0 0 / 0.6);
  --b-spin-content-blur: 0.5px;

  /* Fullscreen */
  --b-spin-fullscreen-bg: oklch(100% 0 0 / 0.75);

  /* Animation */
  --b-spin-animation-duration: 1.2s;
  --b-spin-transition-duration: 300ms;
}

/* ── Dark mode ───────────────────────────────── */
[data-prefers-color='dark'] .b-spin {
  --b-spin-dot-color: oklch(72% 0.14 237);
  --b-spin-tip-color: oklch(72% 0.14 237);
  --b-spin-overlay-bg: oklch(15% 0 0 / 0.6);
  --b-spin-fullscreen-bg: oklch(15% 0 0 / 0.75);
}

/* ─────────────────────────────────────────────
   Base layout
   ───────────────────────────────────────────── */
.b-spin {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-sizing: border-box;
  font-family: inherit;
}

/* Nested wrapper needs relative positioning for overlay */
.b-spin--nested {
  position: relative;
  display: block;
}

/* ── Overlay container (nested mode) ── */
.b-spin__overlay-container {
  position: absolute;
  inset: 0;
  z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--b-spin-overlay-bg);
  border-radius: inherit;
  transition: opacity var(--b-spin-transition-duration) ease;
}

/* ── Content (nested) ── */
.b-spin__content {
  transition:
    opacity var(--b-spin-transition-duration) ease,
    filter var(--b-spin-transition-duration) ease;
}

.b-spin__content--blurred {
  opacity: 0.5;
  filter: blur(var(--b-spin-content-blur));
  pointer-events: none;
  user-select: none;
}

/* ── Fullscreen ── */
.b-spin--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1070;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--b-spin-fullscreen-bg);
}

/* ── Dot indicator ── */
.b-spin__indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.b-spin__dot {
  position: relative;
  display: inline-block;
  font-size: var(--b-spin-dot-size-default);
  width: 1em;
  height: 1em;
  animation: b-spin-rotate var(--b-spin-animation-duration) linear infinite;
}

.b-spin--small .b-spin__dot {
  font-size: var(--b-spin-dot-size-small);
}

.b-spin--large .b-spin__dot {
  font-size: var(--b-spin-dot-size-large);
}

.b-spin__dot-item {
  position: absolute;
  display: block;
  width: calc(1em * 0.45);
  height: calc(1em * 0.45);
  background-color: var(--b-spin-dot-color);
  border-radius: 50%;
  opacity: 0.3;
  animation: b-spin-bounce var(--b-spin-animation-duration) ease-in-out infinite;
  transform: scale(0.75);
}

.b-spin__dot-item:nth-child(1) {
  top: 0;
  left: 0;
}

.b-spin__dot-item:nth-child(2) {
  top: 0;
  right: 0;
  animation-delay: 0.4s;
}

.b-spin__dot-item:nth-child(3) {
  right: 0;
  bottom: 0;
  animation-delay: 0.8s;
}

.b-spin__dot-item:nth-child(4) {
  bottom: 0;
  left: 0;
  animation-delay: 1.2s;
}

/* ── Tip ── */
.b-spin__tip {
  color: var(--b-spin-tip-color);
  font-size: var(--b-spin-tip-font-size);
  text-align: center;
}

/* ─────────────────────────────────────────────
   Keyframes
   ───────────────────────────────────────────── */
@keyframes b-spin-rotate {
  to {
    transform: rotate(405deg);
  }
}

@keyframes b-spin-bounce {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(0.75);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

/* ─────────────────────────────────────────────
   Fade transition (fullscreen)
   ───────────────────────────────────────────── */
.b-spin-fade-enter-active,
.b-spin-fade-leave-active {
  transition: opacity var(--b-spin-transition-duration) ease;
}

.b-spin-fade-enter-from,
.b-spin-fade-leave-to {
  opacity: 0;
}

/* ─────────────────────────────────────────────
   Reduced motion
   ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-spin__dot {
    animation: none;
  }

  .b-spin__dot-item {
    animation: none;
    opacity: 0.8;
    transform: scale(1);
  }

  .b-spin-fade-enter-active,
  .b-spin-fade-leave-active {
    transition: none;
  }

  .b-spin__content {
    transition: none;
  }
}
</style>
