<script setup lang="ts">
import { BAlertType } from '@/types.ts';
import { computed, ref, useId } from 'vue';

// ─────────────────────────────────────────────
// Props & emits
// ─────────────────────────────────────────────
const {
  type = BAlertType.Info,
  message = '',
  description = '',
  showIcon = false,
  closable = false,
  banner = false,
  action = '',
  modelValue = undefined,
} = defineProps<{
  /**
   * Alert type - maps to role / colour scheme.
   * @default 'info'
   */
  type?: `${BAlertType}`;
  /** Primary message text (also accepts the default slot). */
  message?: string;
  /** Secondary description text (also accepts the `description` slot). */
  description?: string;
  /** Show the built-in status icon. */
  showIcon?: boolean;
  /** Show the close button. */
  closable?: boolean;
  /** Render as a top banner (no border-radius, full-width). */
  banner?: boolean;
  /**
   * Text for the action area (also accepts the `action` slot).
   * Displayed in the top-right area next to the close button.
   */
  action?: string;
  /**
   * Controlled visibility - when provided the component operates in
   * controlled mode; otherwise it manages its own visibility.
   * Bind with `v-model`.
   */
  modelValue?: boolean;
}>();

const emit = defineEmits<{
  /** Fired synchronously when the close button is activated. */
  (e: 'close', event: MouseEvent | KeyboardEvent): void;
  /** Fired after the leave-transition fully completes. */
  (e: 'afterClose'): void;
  /** v-model support */
  (e: 'update:modelValue', value: boolean): void;
}>();

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const descriptionId = useId();

/** Uncontrolled visibility flag. */
const internalVisible = ref(true);

/**
 * Effective visibility:
 *  - controlled  → honour `modelValue`
 *  - uncontrolled → use `internalVisible`
 */
const isVisible = computed(() =>
  modelValue !== undefined ? modelValue : internalVisible.value,
);

// ─────────────────────────────────────────────
// Derived state
// ─────────────────────────────────────────────
const hasDescription = computed(() => Boolean(description || slots.description));
const hasAction = computed(() => Boolean(action || slots.action));

/** ARIA role: 'alert' for errors/warnings (assertive), 'status' for others. */
const ariaRole = computed<'alert' | 'status'>(() =>
  type === BAlertType.Error || type === BAlertType.Warning ? 'alert' : 'status',
);

/** Map type → inline SVG path for the status icon. */
const iconPath = computed(() => {
  switch (type) {
    case BAlertType.Success:
      // circle-check
      return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z';
    case BAlertType.Warning:
      // triangle-exclamation
      return 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z';
    case BAlertType.Error:
      // circle-xmark
      return 'M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z';
    default:
      // circle-info
      return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z';
  }
});

/** Expose slots ref for slot-presence detection. */
const slots = defineSlots<{
  /** Overrides the `message` prop. */
  default?(): unknown;
  /** Overrides the `description` prop. */
  description?(): unknown;
  /** Overrides the `action` prop. */
  action?(): unknown;
  /** Overrides the built-in close icon. */
  closeIcon?(): unknown;
  /** Overrides the built-in status icon. */
  icon?(): unknown;
}>();

// ─────────────────────────────────────────────
// Behaviour
// ─────────────────────────────────────────────
function handleClose(event: MouseEvent | KeyboardEvent) {
  emit('close', event);
  if (modelValue !== undefined) {
    emit('update:modelValue', false);
  } else {
    internalVisible.value = false;
  }
}

function onCloseClick(event: MouseEvent) {
  handleClose(event);
}

function onCloseKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
    event.preventDefault();
    handleClose(event);
  }
}

function onAfterLeave() {
  emit('afterClose');
}
</script>

<template>
  <Transition name="b-alert-fade" @after-leave="onAfterLeave">
    <div
      v-if="isVisible"
      class="b-alert"
      :class="[
        `b-alert--${type}`,
        {
          'b-alert--with-description': hasDescription,
          'b-alert--banner': banner,
          'b-alert--with-icon': showIcon,
          'b-alert--closable': closable,
        },
      ]"
      :role="ariaRole"
      :aria-live="ariaRole === 'alert' ? 'assertive' : 'polite'"
      :aria-atomic="true"
      :aria-describedby="hasDescription ? descriptionId : undefined"
    >
      <!-- Status icon -->
      <span
        v-if="showIcon"
        class="b-alert__icon"
        aria-hidden="true"
      >
        <slot name="icon">
          <svg
            class="b-alert__icon-svg"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            focusable="false"
          >
            <path :d="iconPath" />
          </svg>
        </slot>
      </span>

      <!-- Content -->
      <div class="b-alert__content">
        <!-- Message -->
        <div class="b-alert__message">
          <slot>{{ message }}</slot>
        </div>

        <!-- Description -->
        <div
          v-if="hasDescription"
          :id="descriptionId"
          class="b-alert__description"
        >
          <slot name="description">{{ description }}</slot>
        </div>
      </div>

      <!-- Action + Close -->
      <div v-if="hasAction || closable" class="b-alert__extra">
        <!-- Action slot -->
        <span v-if="hasAction" class="b-alert__action">
          <slot name="action">{{ action }}</slot>
        </span>

        <!-- Close button -->
        <button
          v-if="closable"
          type="button"
          class="b-alert__close"
          aria-label="Close alert"
          @click="onCloseClick"
          @keydown="onCloseKeydown"
        >
          <slot name="closeIcon">
            <svg
              class="b-alert__close-icon"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </slot>
        </button>
      </div>
    </div>
  </Transition>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (tokens)
   ──────────────────────────────────────────── */
.b-alert {
  /* Layout */
  --b-alert-padding-v: 0.5rem;
  --b-alert-padding-h: 1rem;
  --b-alert-border-width: 1px;
  --b-alert-border-radius: 0.5rem;
  --b-alert-icon-size: 1rem;
  --b-alert-icon-size-with-desc: 1.5rem;
  --b-alert-gap: 0.5rem;

  /* Colours - info (default) */
  --b-alert-bg: oklch(95% 0.04 240);
  --b-alert-border-color: oklch(80% 0.1 240);
  --b-alert-color: oklch(35% 0.12 240);
  --b-alert-icon-color: oklch(62.3% 0.214 259.815); /* --color-info */
  --b-alert-close-color: oklch(50% 0.05 240);
  --b-alert-close-hover-color: oklch(35% 0.12 240);

  /* Animation */
  --b-alert-transition-duration: 300ms;
}

/* ── Variant colour tokens ── */
.b-alert--success {
  --b-alert-bg: oklch(95% 0.05 145);
  --b-alert-border-color: oklch(80% 0.12 149);
  --b-alert-color: oklch(32% 0.1 149);
  --b-alert-icon-color: oklch(72.3% 0.219 149.579); /* --color-success */
  --b-alert-close-color: oklch(50% 0.08 149);
  --b-alert-close-hover-color: oklch(32% 0.1 149);
}

.b-alert--warning {
  --b-alert-bg: oklch(97% 0.06 75);
  --b-alert-border-color: oklch(85% 0.14 60);
  --b-alert-color: oklch(35% 0.1 55);
  --b-alert-icon-color: oklch(75% 0.183 55.934); /* --color-warning */
  --b-alert-close-color: oklch(55% 0.08 55);
  --b-alert-close-hover-color: oklch(35% 0.1 55);
}

.b-alert--error {
  --b-alert-bg: oklch(96% 0.04 20);
  --b-alert-border-color: oklch(80% 0.12 20);
  --b-alert-color: oklch(35% 0.12 20);
  --b-alert-icon-color: oklch(63.7% 0.237 25.331); /* --color-failure */
  --b-alert-close-color: oklch(55% 0.08 20);
  --b-alert-close-hover-color: oklch(35% 0.12 20);
}

/* ── Dark mode (mirrors Ant Design pattern) ──────────────────────────────
   The <html> element carries data-prefers-color="dark"|"light".
   color-scheme is set on html itself (see main.css / preview.ts decorator).
   Component styles only need the attribute selector - no @media needed.
   ──────────────────────────────────────────────────────────────────────── */
[data-prefers-color='dark'] .b-alert {
  --b-alert-bg: oklch(20% 0.04 240);
  --b-alert-border-color: oklch(35% 0.1 240);
  --b-alert-color: oklch(85% 0.05 240);
  --b-alert-close-color: oklch(65% 0.04 240);
  --b-alert-close-hover-color: oklch(85% 0.05 240);
}

[data-prefers-color='dark'] .b-alert--success {
  --b-alert-bg: oklch(18% 0.05 149);
  --b-alert-border-color: oklch(35% 0.12 149);
  --b-alert-color: oklch(82% 0.07 149);
  --b-alert-close-color: oklch(60% 0.06 149);
  --b-alert-close-hover-color: oklch(82% 0.07 149);
}

[data-prefers-color='dark'] .b-alert--warning {
  --b-alert-bg: oklch(18% 0.05 55);
  --b-alert-border-color: oklch(38% 0.14 55);
  --b-alert-color: oklch(88% 0.08 55);
  --b-alert-close-color: oklch(62% 0.06 55);
  --b-alert-close-hover-color: oklch(88% 0.08 55);
}

[data-prefers-color='dark'] .b-alert--error {
  --b-alert-bg: oklch(18% 0.04 20);
  --b-alert-border-color: oklch(35% 0.12 20);
  --b-alert-color: oklch(85% 0.07 20);
  --b-alert-close-color: oklch(62% 0.06 20);
  --b-alert-close-hover-color: oklch(85% 0.07 20);
}

/* ─────────────────────────────────────────────
   Base layout
   ───────────────────────────────────────────── */
.b-alert {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--b-alert-gap);
  padding: var(--b-alert-padding-v) var(--b-alert-padding-h);
  border: var(--b-alert-border-width) solid var(--b-alert-border-color);
  border-radius: var(--b-alert-border-radius);
  background-color: var(--b-alert-bg);
  color: var(--b-alert-color);
  box-sizing: border-box;
  word-break: break-word;
}

/* Banner variant: no border-radius, no top/bottom borders, full width */
.b-alert--banner {
  border-radius: 0;
  border-left: none;
  border-right: none;
}

/* ── Icon ── */
.b-alert__icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  color: var(--b-alert-icon-color);
  font-size: var(--b-alert-icon-size);
  line-height: 1;
  /* align icon with single-line message */
  margin-top: 0.15em;
}

.b-alert--with-description .b-alert__icon {
  font-size: var(--b-alert-icon-size-with-desc);
  margin-top: 0;
}

.b-alert__icon-svg {
  width: 1em;
  height: 1em;
  fill: currentColor;
  display: block;
}

/* ── Content ── */
.b-alert__content {
  flex: 1;
  min-width: 0;
}

.b-alert__message {
  font-size: 0.875rem;
  line-height: 1.5;
}

.b-alert--with-description .b-alert__message {
  font-weight: 600;
  font-size: 1rem;
}

.b-alert__description {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  line-height: 1.5;
  opacity: 0.85;
}

/* ── Extra (action + close) ── */
.b-alert__extra {
  display: inline-flex;
  flex-shrink: 0;
  align-items: flex-start;
  gap: 0.5rem;
  /* align with message baseline */
  margin-top: 0.1em;
}

.b-alert__action {
  font-size: 0.875rem;
  line-height: 1.5;
  color: inherit;
}

/* ── Close button ── */
.b-alert__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 0.25rem;
  background: transparent;
  color: var(--b-alert-close-color);
  cursor: pointer;
  line-height: 1;
  font-size: 1rem;
  /* match icon-only click area */
  width: 1.25rem;
  height: 1.25rem;
  transition: color var(--b-alert-transition-duration) ease;
}

.b-alert__close:hover {
  color: var(--b-alert-close-hover-color);
}

.b-alert__close:focus-visible {
  outline: 2px solid var(--b-alert-icon-color);
  outline-offset: 2px;
}

.b-alert__close-icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  display: block;
}

/* ─────────────────────────────────────────────
   Transition (fade + collapse)
   ───────────────────────────────────────────── */
.b-alert-fade-enter-active,
.b-alert-fade-leave-active {
  transition:
    opacity var(--b-alert-transition-duration) ease,
    max-height var(--b-alert-transition-duration) ease,
    margin-bottom var(--b-alert-transition-duration) ease,
    padding-top var(--b-alert-transition-duration) ease,
    padding-bottom var(--b-alert-transition-duration) ease;
  max-height: 200px;
  overflow: hidden;
}

.b-alert-fade-enter-from,
.b-alert-fade-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .b-alert-fade-enter-active,
  .b-alert-fade-leave-active {
    transition: opacity var(--b-alert-transition-duration) ease;
    max-height: none;
    overflow: visible;
  }
}
</style>


