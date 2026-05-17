<script setup lang="ts">
import { BMessageType } from '@/types.ts';
import { computed, onUnmounted, ref, useId, watch } from 'vue';

// ─────────────────────────────────────────────
// Props & emits
// ─────────────────────────────────────────────
const {
  type = BMessageType.Info,
  content = '',
  duration = 3,
  showIcon = true,
  modelValue = undefined,
} = defineProps<{
  /**
   * Message type - controls icon and colour scheme.
   * @default 'info'
   */
  type?: `${BMessageType}`;
  /** The message content text (also accepts the default slot). */
  content?: string;
  /**
   * Time (in seconds) before auto-close. Set to `0` to disable auto-close.
   * @default 3
   */
  duration?: number;
  /** Show the built-in status icon. @default true */
  showIcon?: boolean;
  /**
   * Controlled visibility - when provided the component operates in
   * controlled mode; otherwise it manages its own visibility.
   * Bind with `v-model`.
   */
  modelValue?: boolean;
}>();

const emit = defineEmits<{
  /** Fired synchronously when the message starts closing. */
  (e: 'close'): void;
  /** Fired after the leave-transition fully completes. */
  (e: 'afterClose'): void;
  /** v-model support */
  (e: 'update:modelValue', value: boolean): void;
}>();

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const messageId = useId();

/** Uncontrolled visibility flag - default closed. */
const internalVisible = ref(false);

/**
 * Effective visibility:
 *  - controlled  → honour `modelValue`
 *  - uncontrolled → use `internalVisible`
 */
const isVisible = computed(() => (modelValue !== undefined ? modelValue : internalVisible.value));

const isControlled = computed(() => modelValue !== undefined);

// ─────────────────────────────────────────────
// Derived state
// ─────────────────────────────────────────────
/** ARIA role: 'alert' for error/warning (assertive), 'status' for others. */
const ariaRole = computed<'alert' | 'status'>(() =>
  type === BMessageType.Error || type === BMessageType.Warning ? 'alert' : 'status',
);

/** Map type → inline SVG path for the status icon. */
const iconPath = computed(() => {
  switch (type) {
    case BMessageType.Success:
      // circle-check
      return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z';
    case BMessageType.Warning:
      // triangle-exclamation
      return 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z';
    case BMessageType.Error:
      // circle-xmark
      return 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z';
    case BMessageType.Loading:
      // spinner (circle arc)
      return 'M12 2a10 10 0 0 1 10 10h-2a8 8 0 0 0-8-8V2z';
    default:
      // circle-info
      return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z';
  }
});

defineSlots<{
  /** Overrides the `content` prop. */
  default?(): unknown;
  /** Overrides the built-in status icon. */
  icon?(): unknown;
}>();

// ─────────────────────────────────────────────
// Auto-close timer
// ─────────────────────────────────────────────
let timer: ReturnType<typeof setTimeout> | null = null;

function startTimer() {
  clearTimer();
  if (duration > 0) {
    timer = setTimeout(() => {
      close();
    }, duration * 1000);
  }
}

function clearTimer() {
  if (timer !== null) {
    clearTimeout(timer);
    timer = null;
  }
}

// ─────────────────────────────────────────────
// Behaviour
// ─────────────────────────────────────────────
function open() {
  if (isControlled.value) {
    emit('update:modelValue', true);
  } else {
    internalVisible.value = true;
  }
}

function close() {
  emit('close');
  if (isControlled.value) {
    emit('update:modelValue', false);
  } else {
    internalVisible.value = false;
  }
}

function onAfterLeave() {
  emit('afterClose');
}

function onMouseEnter() {
  clearTimer();
}

function onMouseLeave() {
  startTimer();
}

// ─────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────
onUnmounted(() => {
  clearTimer();
});

// Start / clear auto-close timer whenever visibility changes
watch(
  isVisible,
  (visible) => {
    if (visible) {
      startTimer();
    } else {
      clearTimer();
    }
  },
  { immediate: true },
);

// Expose open & close for imperative usage
defineExpose({ open, close });
</script>

<template>
  <Teleport to="body">
    <Transition name="b-message-fade" @after-leave="onAfterLeave">
      <div
        v-if="isVisible"
        :id="messageId"
        class="b-message"
        :class="[
          `b-message--${type}`,
          {
            'b-message--with-icon': showIcon,
          },
        ]"
        :role="ariaRole"
        :aria-live="ariaRole === 'alert' ? 'assertive' : 'polite'"
        :aria-atomic="true"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
      >
        <!-- Status icon -->
        <span v-if="showIcon" class="b-message__icon" aria-hidden="true">
          <slot name="icon">
            <svg
              class="b-message__icon-svg"
              :class="{ 'b-message__icon-svg--spin': type === 'loading' }"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              focusable="false"
            >
              <path :d="iconPath" />
            </svg>
          </slot>
        </span>

        <!-- Content -->
        <span class="b-message__content">
          <slot>{{ content }}</slot>
        </span>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (tokens)
   ──────────────────────────────────────────── */
.b-message {
  /* Layout */
  --b-message-padding-v: 0.625rem;
  --b-message-padding-h: 1rem;
  --b-message-border-radius: 0.5rem;
  --b-message-icon-size: 1rem;
  --b-message-gap: 0.5rem;
  --b-message-font-size: 0.875rem;
  --b-message-max-width: 32rem;

  /* Colours - info (default) */
  --b-message-bg: #ffffff;
  --b-message-border-color: oklch(90% 0.02 240);
  --b-message-color: oklch(30% 0.02 240);
  --b-message-icon-color: oklch(62.3% 0.214 259.815);
  --b-message-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);

  /* Animation */
  --b-message-transition-duration: 300ms;
  --b-message-top: 8px;
}

/* ── Variant colour tokens ── */
.b-message--success {
  --b-message-icon-color: oklch(72.3% 0.219 149.579);
}

.b-message--warning {
  --b-message-icon-color: oklch(75% 0.183 55.934);
}

.b-message--error {
  --b-message-icon-color: oklch(63.7% 0.237 25.331);
}

.b-message--loading {
  --b-message-icon-color: oklch(62.3% 0.214 259.815);
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-message {
  --b-message-bg: oklch(22% 0.02 240);
  --b-message-border-color: oklch(35% 0.03 240);
  --b-message-color: oklch(88% 0.02 240);
  --b-message-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 3px 6px -4px rgba(0, 0, 0, 0.48),
    0 9px 28px 8px rgba(0, 0, 0, 0.2);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-message {
    --b-message-bg: oklch(22% 0.02 240);
    --b-message-border-color: oklch(35% 0.03 240);
    --b-message-color: oklch(88% 0.02 240);
    --b-message-shadow:
      0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 3px 6px -4px rgba(0, 0, 0, 0.48),
      0 9px 28px 8px rgba(0, 0, 0, 0.2);
  }
}

/* ─────────────────────────────────────────────
   Base layout
   ───────────────────────────────────────────── */
.b-message {
  position: fixed;
  top: var(--b-message-top);
  left: 50%;
  transform: translateX(-50%);
  z-index: 1010;
  display: inline-flex;
  align-items: center;
  gap: var(--b-message-gap);
  padding: var(--b-message-padding-v) var(--b-message-padding-h);
  border-radius: var(--b-message-border-radius);
  background-color: var(--b-message-bg);
  color: var(--b-message-color);
  font-size: var(--b-message-font-size);
  line-height: 1.5;
  box-shadow: var(--b-message-shadow);
  box-sizing: border-box;
  max-width: var(--b-message-max-width);
  word-break: break-word;
  pointer-events: auto;
}

/* ── Icon ── */
.b-message__icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  color: var(--b-message-icon-color);
  line-height: 1;
}

.b-message__icon-svg {
  width: var(--b-message-icon-size);
  height: var(--b-message-icon-size);
  fill: currentColor;
  display: block;
}

/* Loading spinner animation */
.b-message__icon-svg--spin {
  animation: b-message-spin 1s linear infinite;
}

@keyframes b-message-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ── Content ── */
.b-message__content {
  flex: 1;
  min-width: 0;
}

/* ─────────────────────────────────────────────
   Transition (slide-down + fade)
   ───────────────────────────────────────────── */
.b-message-fade-enter-active,
.b-message-fade-leave-active {
  transition:
    opacity var(--b-message-transition-duration, 300ms) ease,
    transform var(--b-message-transition-duration, 300ms) ease;
}

.b-message-fade-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}

.b-message-fade-enter-to {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.b-message-fade-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.b-message-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%);
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .b-message-fade-enter-active,
  .b-message-fade-leave-active {
    transition: opacity var(--b-message-transition-duration, 300ms) ease;
  }

  .b-message-fade-enter-from,
  .b-message-fade-leave-to {
    transform: translateX(-50%);
  }

  .b-message__icon-svg--spin {
    animation: none;
  }
}
</style>
