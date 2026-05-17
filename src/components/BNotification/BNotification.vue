<script setup lang="ts">
import { BNotificationPlacement, BNotificationType } from '@/types.ts';
import { computed, nextTick, onUnmounted, ref, useId, watch } from 'vue';

// ─────────────────────────────────────────────
// Props & emits
// ─────────────────────────────────────────────
const {
  type = BNotificationType.Info,
  message = '',
  description = '',
  placement = BNotificationPlacement.TopRight,
  duration = 4.5,
  closable = true,
  showIcon = true,
  icon,
  closeIcon,
  btn,
  modelValue = undefined,
} = defineProps<{
  /**
   * Notification type - controls the icon and colour scheme.
   * When omitted no type-colour is applied (plain notification).
   */
  type?: `${BNotificationType}`;
  /** Short title / heading of the notification. */
  message?: string;
  /** Optional detailed description below the title. */
  description?: string;
  /**
   * Placement of the notification on the viewport.
   * @default 'top-right'
   */
  placement?: `${BNotificationPlacement}`;
  /**
   * Auto-close delay in seconds. Set to `0` to disable auto-close.
   * @default 4.5
   */
  duration?: number;
  /** Show the close button. @default true */
  closable?: boolean;
  /** Show the built-in status icon when `type` is set. @default true */
  showIcon?: boolean;
  /**
   * Custom icon content - overrides the built-in type icon.
   * Also accepts the `icon` slot.
   */
  icon?: string;
  /**
   * Custom close-icon content.
   * Also accepts the `closeIcon` slot.
   */
  closeIcon?: string;
  /**
   * Custom action button area content.
   * Also accepts the `btn` slot.
   */
  btn?: string;
  /**
   * Controlled visibility - when provided the component operates in
   * controlled mode; otherwise it manages its own visibility.
   * Bind with `v-model`.
   */
  modelValue?: boolean;
}>();

const emit = defineEmits<{
  /** Fired synchronously when the notification starts closing. */
  (e: 'close'): void;
  /** Fired after the leave-transition fully completes. */
  (e: 'afterClose'): void;
  /** v-model support */
  (e: 'update:modelValue', value: boolean): void;
}>();

defineSlots<{
  /** Overrides the `message` prop - the notification title. */
  message?(): unknown;
  /** Overrides the `description` prop. */
  description?(): unknown;
  /** Overrides the built-in status icon. */
  icon?(): unknown;
  /** Overrides the default close icon. */
  closeIcon?(): unknown;
  /** Action button area rendered below the description. */
  btn?(): unknown;
}>();

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const notificationId = useId();
const titleId = `${notificationId}-title`;
const descId = `${notificationId}-desc`;

/** Uncontrolled visibility flag - default closed. */
const internalVisible = ref(false);

/** Ref to the notification DOM element for focus return. */
const notificationRef = ref<HTMLElement | null>(null);

/** Element that had focus before the notification appeared. */
const previousFocusRef = ref<HTMLElement | null>(null);

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
  type === BNotificationType.Error || type === BNotificationType.Warning ? 'alert' : 'status',
);

/** aria-live polarity mirrors the role. */
const ariaLive = computed(() => (ariaRole.value === 'alert' ? 'assertive' : 'polite'));

/** Whether to show the icon area (needs type and showIcon). */
const showIconArea = computed(() => Boolean(type && showIcon) || Boolean(icon) || false);

/** Whether the description is provided via prop or slot. */
const hasDescription = computed(() => Boolean(description));

/** Built-in SVG path for the status icon. */
const iconPath = computed(() => {
  switch (type) {
    case BNotificationType.Success:
      return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z';
    case BNotificationType.Warning:
      return 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z';
    case BNotificationType.Error:
      return 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z';
    default:
      // info (also fallback)
      return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z';
  }
});

// Close icon SVG path (× mark)
const closeIconPath =
  'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z';

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
  // Return focus to the previously-focused element
  if (previousFocusRef.value && document.contains(previousFocusRef.value)) {
    previousFocusRef.value.focus();
    previousFocusRef.value = null;
  }
  emit('afterClose');
}

function onMouseEnter() {
  clearTimer();
}

function onMouseLeave() {
  startTimer();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && closable) {
    event.stopPropagation();
    close();
  }
}

// ─────────────────────────────────────────────
// Visibility watcher - manage timer + focus
// ─────────────────────────────────────────────
watch(
  isVisible,
  async (visible) => {
    if (visible) {
      // Capture current focus for return-on-close
      previousFocusRef.value = document.activeElement as HTMLElement | null;
      startTimer();
      // Focus the close button (if closable) once the DOM updates
      if (closable) {
        await nextTick();
        const closeBtn =
          notificationRef.value?.querySelector<HTMLElement>('.b-notification__close');
        closeBtn?.focus();
      }
    } else {
      clearTimer();
    }
  },
  { immediate: true },
);

// ─────────────────────────────────────────────
// Lifecycle
// ─────────────────────────────────────────────
onUnmounted(() => {
  clearTimer();
});

// Expose open & close for imperative usage
defineExpose({ open, close });
</script>

<template>
  <Teleport to="body">
    <Transition name="b-notification-fade" @after-leave="onAfterLeave">
      <div
        v-if="isVisible"
        :id="notificationId"
        ref="notificationRef"
        class="b-notification"
        :class="[
          placement && `b-notification--${placement}`,
          type && `b-notification--${type}`,
          {
            'b-notification--with-icon': showIconArea,
            'b-notification--with-description': hasDescription,
          },
        ]"
        :role="ariaRole"
        :aria-live="ariaLive"
        :aria-atomic="true"
        :aria-labelledby="titleId"
        :aria-describedby="hasDescription ? descId : undefined"
        @mouseenter="onMouseEnter"
        @mouseleave="onMouseLeave"
        @keydown="onKeydown"
      >
        <!-- Icon area -->
        <span v-if="showIconArea" class="b-notification__icon" aria-hidden="true">
          <slot name="icon">
            <!-- Custom icon prop as raw HTML (consumer's responsibility) -->
            <span v-if="icon" v-html="icon" />
            <!-- Built-in type icon -->
            <svg
              v-else-if="type"
              class="b-notification__icon-svg"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              focusable="false"
              aria-hidden="true"
            >
              <path :d="iconPath" />
            </svg>
          </slot>
        </span>

        <!-- Body -->
        <div class="b-notification__body">
          <!-- Title -->
          <div :id="titleId" class="b-notification__message">
            <slot name="message">{{ message }}</slot>
          </div>

          <!-- Description -->
          <div
            v-if="hasDescription || $slots.description"
            :id="descId"
            class="b-notification__description"
          >
            <slot name="description">{{ description }}</slot>
          </div>

          <!-- Action button area -->
          <div v-if="btn || $slots.btn" class="b-notification__btn">
            <slot name="btn">{{ btn }}</slot>
          </div>
        </div>

        <!-- Close button -->
        <button
          v-if="closable"
          type="button"
          class="b-notification__close"
          aria-label="Close notification"
          @click="close"
        >
          <slot name="closeIcon">
            <span v-if="closeIcon" v-html="closeIcon" />
            <svg
              v-else
              class="b-notification__close-svg"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              focusable="false"
              aria-hidden="true"
            >
              <path :d="closeIconPath" />
            </svg>
          </slot>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (tokens)
   ──────────────────────────────────────────── */
.b-notification {
  /* Layout */
  --b-notification-width: 22rem;
  --b-notification-padding-v: 1rem;
  --b-notification-padding-h: 1.5rem;
  --b-notification-border-radius: 0.5rem;
  --b-notification-icon-size: 1.5rem;
  --b-notification-gap: 0.75rem;
  --b-notification-close-size: 1rem;
  --b-notification-font-size-title: 1rem;
  --b-notification-font-size-desc: 0.875rem;
  --b-notification-line-height: 1.5;
  --b-notification-z-index: 1010;

  /* Offset from viewport edge */
  --b-notification-offset: 1.5rem;

  /* Colours (default / plain) */
  --b-notification-bg: #ffffff;
  --b-notification-border-color: oklch(90% 0.02 240);
  --b-notification-title-color: oklch(20% 0.02 240);
  --b-notification-desc-color: oklch(45% 0.02 240);
  --b-notification-close-color: oklch(50% 0.02 240);
  --b-notification-close-hover-color: oklch(20% 0.02 240);
  --b-notification-icon-color: oklch(62.3% 0.214 259.815);
  --b-notification-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);

  /* Animation */
  --b-notification-transition-duration: 300ms;
}

/* ── Variant colour tokens ── */
.b-notification--success {
  --b-notification-icon-color: oklch(72.3% 0.219 149.579);
}

.b-notification--info {
  --b-notification-icon-color: oklch(62.3% 0.214 259.815);
}

.b-notification--warning {
  --b-notification-icon-color: oklch(75% 0.183 55.934);
}

.b-notification--error {
  --b-notification-icon-color: oklch(63.7% 0.237 25.331);
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-notification {
  --b-notification-bg: oklch(22% 0.02 240);
  --b-notification-border-color: oklch(35% 0.03 240);
  --b-notification-title-color: oklch(92% 0.02 240);
  --b-notification-desc-color: oklch(70% 0.02 240);
  --b-notification-close-color: oklch(60% 0.02 240);
  --b-notification-close-hover-color: oklch(90% 0.02 240);
  --b-notification-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.32), 0 3px 6px -4px rgba(0, 0, 0, 0.48),
    0 9px 28px 8px rgba(0, 0, 0, 0.2);
}

/* ─────────────────────────────────────────────
   Base layout
   ───────────────────────────────────────────── */
.b-notification {
  position: fixed;
  z-index: var(--b-notification-z-index);
  display: flex;
  align-items: flex-start;
  gap: var(--b-notification-gap);
  width: var(--b-notification-width);
  max-width: calc(100vw - 2 * var(--b-notification-offset));
  padding: var(--b-notification-padding-v) var(--b-notification-padding-h);
  border-radius: var(--b-notification-border-radius);
  background-color: var(--b-notification-bg);
  box-shadow: var(--b-notification-shadow);
  box-sizing: border-box;
  word-break: break-word;
  pointer-events: auto;
  outline: none;
}

/* ── Placement ── */
.b-notification--top-right {
  top: var(--b-notification-offset);
  right: var(--b-notification-offset);
}

.b-notification--top-left {
  top: var(--b-notification-offset);
  left: var(--b-notification-offset);
}

.b-notification--bottom-right {
  bottom: var(--b-notification-offset);
  right: var(--b-notification-offset);
}

.b-notification--bottom-left {
  bottom: var(--b-notification-offset);
  left: var(--b-notification-offset);
}

/* ── Icon area ── */
.b-notification__icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: flex-start;
  padding-top: 0.125rem;
  color: var(--b-notification-icon-color);
  line-height: 1;
}

.b-notification__icon-svg {
  width: var(--b-notification-icon-size);
  height: var(--b-notification-icon-size);
  fill: currentColor;
  display: block;
}

/* ── Body ── */
.b-notification__body {
  flex: 1;
  min-width: 0;
}

/* ── Title ── */
.b-notification__message {
  font-size: var(--b-notification-font-size-title);
  font-weight: 600;
  line-height: var(--b-notification-line-height);
  color: var(--b-notification-title-color);
  padding-right: 1.5rem; /* space for close button */
}

/* When no close button, remove the padding */
.b-notification:not(:has(.b-notification__close)) .b-notification__message {
  padding-right: 0;
}

/* ── Description ── */
.b-notification__description {
  margin-top: 0.375rem;
  font-size: var(--b-notification-font-size-desc);
  line-height: var(--b-notification-line-height);
  color: var(--b-notification-desc-color);
}

/* ── Action button area ── */
.b-notification__btn {
  margin-top: 0.75rem;
}

/* ── Close button ── */
.b-notification__close {
  position: absolute;
  top: 0.875rem;
  right: 1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.125rem;
  background: transparent;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  color: var(--b-notification-close-color);
  line-height: 1;
  transition: color var(--b-notification-transition-duration) ease;
}

.b-notification__close:hover {
  color: var(--b-notification-close-hover-color);
}

.b-notification__close:focus-visible {
  outline: 2px solid oklch(62.3% 0.214 259.815);
  outline-offset: 2px;
}

.b-notification__close-svg {
  width: var(--b-notification-close-size);
  height: var(--b-notification-close-size);
  fill: currentColor;
  display: block;
}

/* ─────────────────────────────────────────────
   Transition – slide-in + fade per placement
   ───────────────────────────────────────────── */
.b-notification-fade-enter-active,
.b-notification-fade-leave-active {
  transition:
    opacity var(--b-notification-transition-duration, 300ms) ease,
    transform var(--b-notification-transition-duration, 300ms) ease;
}

/* top-right / bottom-right - slide in from right */
.b-notification--top-right.b-notification-fade-enter-from,
.b-notification--bottom-right.b-notification-fade-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.b-notification--top-right.b-notification-fade-enter-to,
.b-notification--bottom-right.b-notification-fade-enter-to,
.b-notification--top-right.b-notification-fade-leave-from,
.b-notification--bottom-right.b-notification-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.b-notification--top-right.b-notification-fade-leave-to,
.b-notification--bottom-right.b-notification-fade-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* top-left / bottom-left - slide in from left */
.b-notification--top-left.b-notification-fade-enter-from,
.b-notification--bottom-left.b-notification-fade-enter-from {
  opacity: 0;
  transform: translateX(-100%);
}

.b-notification--top-left.b-notification-fade-enter-to,
.b-notification--bottom-left.b-notification-fade-enter-to,
.b-notification--top-left.b-notification-fade-leave-from,
.b-notification--bottom-left.b-notification-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.b-notification--top-left.b-notification-fade-leave-to,
.b-notification--bottom-left.b-notification-fade-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .b-notification-fade-enter-active,
  .b-notification-fade-leave-active {
    transition: opacity var(--b-notification-transition-duration, 300ms) ease;
  }

  .b-notification--top-right.b-notification-fade-enter-from,
  .b-notification--bottom-right.b-notification-fade-enter-from,
  .b-notification--top-left.b-notification-fade-enter-from,
  .b-notification--bottom-left.b-notification-fade-enter-from,
  .b-notification--top-right.b-notification-fade-leave-to,
  .b-notification--bottom-right.b-notification-fade-leave-to,
  .b-notification--top-left.b-notification-fade-leave-to,
  .b-notification--bottom-left.b-notification-fade-leave-to {
    transform: none;
  }
}
</style>
