<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue';
import type { BDrawerPlacement, BDrawerSize } from '@/types';

// ─────────────────────────────────────────────
// Props & emits
// ─────────────────────────────────────────────
const {
  placement = 'right',
  size = 'default',
  title = '',
  closable = true,
  mask = true,
  maskClosable = true,
  keyboard = true,
  destroyOnClose = false,
  width,
  height,
  zIndex = 1000,
  getContainer,
  autoFocus = true,
  modelValue = undefined,
  forceRender = false,
  extra = '',
  footer = '',
  loading = false,
  ariaLabel,
} = defineProps<{
  /** Direction from which the drawer slides in. */
  placement?: BDrawerPlacement;
  /** Preset width/height: 'default' (378px) or 'large' (736px). */
  size?: BDrawerSize;
  /** Drawer title. Also accepts the `title` slot. */
  title?: string;
  /** Whether to show the close button. */
  closable?: boolean;
  /** Whether to show the mask overlay. */
  mask?: boolean;
  /** Clicking the mask closes the drawer. */
  maskClosable?: boolean;
  /** Pressing Escape closes the drawer. */
  keyboard?: boolean;
  /** Destroy child components when closing. */
  destroyOnClose?: boolean;
  /** Custom width (overrides size) for left/right placement. */
  width?: string | number;
  /** Custom height (overrides size) for top/bottom placement. */
  height?: string | number;
  /** z-index of the drawer. */
  zIndex?: number;
  /**
   * CSS selector or element to teleport the drawer into.
   * Defaults to `body`.
   */
  getContainer?: string | HTMLElement;
  /** Whether to auto-focus the first focusable element when opened. */
  autoFocus?: boolean;
  /**
   * Controlled visibility - bind with `v-model`.
   * When not provided the drawer manages its own state.
   */
  modelValue?: boolean;
  /** Force render the drawer content even when hidden. */
  forceRender?: boolean;
  /** Extra content in the header right area (also accepts the `extra` slot). */
  extra?: string;
  /** Footer content (also accepts the `footer` slot). */
  footer?: string;
  /** Show loading spinner in body area. */
  loading?: boolean;
  /**
   * Accessible label for the dialog when no visible title is present.
   * Required when `closable=false` and no `title` prop or `#title` slot is used.
   */
  ariaLabel?: string;
}>();

const emit = defineEmits<{
  /** Fired when the user requests to close the drawer. */
  (e: 'close', event: MouseEvent | KeyboardEvent): void;
  /** Fired after the close transition completes. */
  (e: 'afterOpenChange', open: boolean): void;
  /** v-model support */
  (e: 'update:modelValue', value: boolean): void;
}>();

const slots = defineSlots<{
  /** Main content of the drawer. */
  default?(): unknown;
  /** Overrides the `title` prop. */
  title?(): unknown;
  /** Overrides the `extra` prop (right side of header). */
  extra?(): unknown;
  /** Overrides the `footer` prop. */
  footer?(): unknown;
  /** Custom close icon. */
  closeIcon?(): unknown;
}>();

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const titleId = useId();

/** Uncontrolled visibility. */
const internalOpen = ref(false);

/** Effective visibility. */
const isOpen = computed(() =>
  modelValue !== undefined ? modelValue : internalOpen.value,
);

/** Whether the drawer has ever been opened (for lazy rendering). */
const hasBeenOpened = ref(false);

/** Whether the content should render. */
const shouldRender = computed(() => {
  if (forceRender) return true;
  if (destroyOnClose) return isOpen.value;
  return hasBeenOpened.value || isOpen.value;
});

// Track when drawer opens at least once
watch(isOpen, (val) => {
  if (val) hasBeenOpened.value = true;
});

// ─────────────────────────────────────────────
// Derived state
// ─────────────────────────────────────────────
const isHorizontal = computed(() => placement === 'left' || placement === 'right');

const sizeMap: Record<BDrawerSize, number> = {
  default: 378,
  large: 736,
};

const resolvedWidth = computed(() => {
  if (width !== undefined) return typeof width === 'number' ? `${width}px` : width;
  return isHorizontal.value ? `${sizeMap[size]}px` : '100%';
});

const resolvedHeight = computed(() => {
  if (height !== undefined) return typeof height === 'number' ? `${height}px` : height;
  return !isHorizontal.value ? `${sizeMap[size]}px` : '100%';
});

const hasTitle = computed(() => Boolean(title || slots.title));
const hasExtra = computed(() => Boolean(extra || slots.extra));
const hasFooter = computed(() => Boolean(footer || slots.footer));
const hasHeader = computed(() => hasTitle.value || closable || hasExtra.value);

const teleportTarget = computed(() => {
  if (getContainer) return getContainer;
  return 'body';
});

const panelStyle = computed(() => ({
  width: resolvedWidth.value,
  height: resolvedHeight.value,
  zIndex,
}));

// ─────────────────────────────────────────────
// Focus management
// ─────────────────────────────────────────────
const drawerRef = ref<HTMLElement | null>(null);
let previouslyFocusedElement: HTMLElement | null = null;

function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !drawerRef.value) return;

  const focusableSelectors =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const focusable = Array.from(
    drawerRef.value.querySelectorAll<HTMLElement>(focusableSelectors),
  );

  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

function focusFirst() {
  if (!autoFocus || !drawerRef.value) return;

  nextTick(() => {
    if (!drawerRef.value) return;
    const focusableSelectors =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const first = drawerRef.value.querySelector<HTMLElement>(focusableSelectors);
    if (first) {
      first.focus();
    } else {
      // Focus the panel itself as a fallback
      drawerRef.value.focus();
    }
  });
}

watch(isOpen, (val) => {
  if (val) {
    previouslyFocusedElement = document.activeElement as HTMLElement | null;
    nextTick(() => focusFirst());
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onBeforeUnmount(() => {
  document.body.style.overflow = '';
});

// ─────────────────────────────────────────────
// Behaviour
// ─────────────────────────────────────────────
function requestClose(event: MouseEvent | KeyboardEvent) {
  emit('close', event);
  if (modelValue !== undefined) {
    emit('update:modelValue', false);
  } else {
    internalOpen.value = false;
  }
}

function onMaskClick(event: MouseEvent) {
  if (maskClosable) {
    requestClose(event);
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && keyboard) {
    event.stopPropagation();
    requestClose(event);
  }
  trapFocus(event);
}

function onAfterEnter() {
  emit('afterOpenChange', true);
}

function onAfterLeave() {
  emit('afterOpenChange', false);
  // Restore focus to the previously focused element
  if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
    previouslyFocusedElement.focus();
    previouslyFocusedElement = null;
  }
}

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────
function open() {
  if (modelValue !== undefined) {
    emit('update:modelValue', true);
  } else {
    internalOpen.value = true;
  }
}

defineExpose({ open });
</script>

<template>
  <Teleport :to="teleportTarget">
    <Transition
      name="b-drawer"
      @after-enter="onAfterEnter"
      @after-leave="onAfterLeave"
    >
      <div
        v-if="isOpen"
        class="b-drawer-root"
        :class="`b-drawer-root--${placement}`"
        :style="{ zIndex }"
      >
        <!-- Mask -->
        <div
          v-if="mask"
          class="b-drawer__mask"
          aria-hidden="true"
          @click="onMaskClick"
        />

        <!-- Panel -->
        <div
          ref="drawerRef"
          class="b-drawer"
          :class="[
            `b-drawer--${placement}`,
            `b-drawer--${size}`,
            {
              'b-drawer--has-header': hasHeader,
              'b-drawer--has-footer': hasFooter,
            },
          ]"
          role="dialog"
          aria-modal="true"
          :aria-label="!hasTitle ? ariaLabel : undefined"
          :aria-labelledby="hasTitle ? titleId : undefined"
          :style="panelStyle"
          tabindex="-1"
          @keydown="onKeydown"
        >
          <!-- Header -->
          <div v-if="hasHeader" class="b-drawer__header">
            <div class="b-drawer__header-title-wrapper">
              <!-- Close button -->
              <button
                v-if="closable"
                type="button"
                class="b-drawer__close"
                aria-label="Close drawer"
                @click="requestClose"
              >
                <slot name="closeIcon">
                  <svg
                    class="b-drawer__close-icon"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </slot>
              </button>

              <!-- Title -->
              <div
                v-if="hasTitle"
                :id="titleId"
                class="b-drawer__title"
              >
                <slot name="title">{{ title }}</slot>
              </div>
            </div>

            <!-- Extra -->
            <div v-if="hasExtra" class="b-drawer__extra">
              <slot name="extra">{{ extra }}</slot>
            </div>
          </div>

          <!-- Body -->
          <div v-if="shouldRender" class="b-drawer__body">
            <div v-if="loading" class="b-drawer__loading" aria-live="polite">
              <svg
                class="b-drawer__spinner"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="31.4 31.4" stroke-linecap="round" />
              </svg>
              <span class="b-drawer__loading-text">Loading…</span>
            </div>
            <slot v-else />
          </div>

          <!-- Footer -->
          <div v-if="hasFooter" class="b-drawer__footer">
            <slot name="footer">{{ footer }}</slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (tokens)
   ──────────────────────────────────────────── */
.b-drawer-root {
  --b-drawer-bg: #fff;
  --b-drawer-color: oklch(25% 0 0);
  --b-drawer-mask-bg: rgba(0, 0, 0, 0.45);
  --b-drawer-border-color: oklch(90% 0 0);
  --b-drawer-header-padding: 1rem 1.5rem;
  --b-drawer-body-padding: 1.5rem;
  --b-drawer-footer-padding: 0.5rem 1rem;
  --b-drawer-close-color: oklch(40% 0 0);
  --b-drawer-close-hover-color: oklch(20% 0 0);
  --b-drawer-title-font-size: 1rem;
  --b-drawer-title-font-weight: 600;
  --b-drawer-title-line-height: 1.5;
  --b-drawer-transition-duration: 300ms;
  --b-drawer-shadow: -6px 0 16px 0 rgba(0, 0, 0, 0.08),
    -3px 0 6px -4px rgba(0, 0, 0, 0.12),
    -9px 0 28px 8px rgba(0, 0, 0, 0.05);
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-drawer-root {
  --b-drawer-bg: oklch(20% 0 0);
  --b-drawer-color: oklch(90% 0 0);
  --b-drawer-mask-bg: rgba(0, 0, 0, 0.65);
  --b-drawer-border-color: oklch(30% 0 0);
  --b-drawer-close-color: oklch(65% 0 0);
  --b-drawer-close-hover-color: oklch(90% 0 0);
  --b-drawer-shadow: -6px 0 16px 0 rgba(0, 0, 0, 0.24),
    -3px 0 6px -4px rgba(0, 0, 0, 0.36),
    -9px 0 28px 8px rgba(0, 0, 0, 0.2);
}

/* ─────────────────────────────────────────────
   Root wrapper (mask + panel)
   ───────────────────────────────────────────── */
.b-drawer-root {
  position: fixed;
  inset: 0;
}

/* ── Mask ── */
.b-drawer__mask {
  position: absolute;
  inset: 0;
  background: var(--b-drawer-mask-bg);
}

/* ── Panel base ── */
.b-drawer {
  position: absolute;
  display: flex;
  flex-direction: column;
  background: var(--b-drawer-bg);
  color: var(--b-drawer-color);
  box-shadow: var(--b-drawer-shadow);
  outline: none;
  box-sizing: border-box;
  overflow: hidden;
}

/* Placement positioning */
.b-drawer--right {
  top: 0;
  right: 0;
  bottom: 0;
}

.b-drawer--left {
  top: 0;
  left: 0;
  bottom: 0;
}

.b-drawer--top {
  top: 0;
  left: 0;
  right: 0;
}

.b-drawer--bottom {
  bottom: 0;
  left: 0;
  right: 0;
}

/* ── Header ── */
.b-drawer__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--b-drawer-header-padding);
  border-bottom: 1px solid var(--b-drawer-border-color);
  flex-shrink: 0;
}

.b-drawer__header-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  flex: 1;
}

.b-drawer__title {
  font-size: var(--b-drawer-title-font-size);
  font-weight: var(--b-drawer-title-font-weight);
  line-height: var(--b-drawer-title-line-height);
  color: var(--b-drawer-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.b-drawer__extra {
  flex-shrink: 0;
}

/* ── Close button ── */
.b-drawer__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 0.25rem;
  background: transparent;
  color: var(--b-drawer-close-color);
  cursor: pointer;
  width: 1.375rem;
  height: 1.375rem;
  font-size: 1rem;
  line-height: 1;
  transition: color var(--b-drawer-transition-duration) ease;
}

.b-drawer__close:hover {
  color: var(--b-drawer-close-hover-color);
}

.b-drawer__close:focus-visible {
  outline: 2px solid oklch(62.3% 0.214 259.815);
  outline-offset: 2px;
}

.b-drawer__close-icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  display: block;
}

/* ── Body ── */
.b-drawer__body {
  flex: 1;
  padding: var(--b-drawer-body-padding);
  overflow-y: auto;
  overflow-x: hidden;
}

/* ── Footer ── */
.b-drawer__footer {
  flex-shrink: 0;
  padding: var(--b-drawer-footer-padding);
  border-top: 1px solid var(--b-drawer-border-color);
}

/* ── Loading spinner ── */
.b-drawer__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  color: var(--b-drawer-close-color);
}

.b-drawer__spinner {
  width: 2rem;
  height: 2rem;
  animation: b-drawer-spin 1s linear infinite;
}

.b-drawer__loading-text {
  font-size: 0.875rem;
}

@keyframes b-drawer-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ─────────────────────────────────────────────
   Slide transitions
   ─────────────────────────────────────────────
   Vue's <Transition> adds .b-drawer-{enter|leave}-* classes
   to the root element (.b-drawer-root).  We target the
   children (.b-drawer and .b-drawer__mask) from there.
   ───────────────────────────────────────────── */

/*
 * Vue's <Transition> listens for `transitionend` on the root element
 * (.b-drawer-root) to know when the leave animation finishes.
 * We must put a real transition on the root itself so that event fires.
 * We use `visibility` which is invisible to the user but gives Vue
 * the transitionend signal it needs.
 */
.b-drawer-enter-active,
.b-drawer-leave-active {
  transition: visibility var(--b-drawer-transition-duration) linear;
}

.b-drawer-leave-to {
  visibility: hidden;
}

/* - Active phase: set transition on children - */
.b-drawer-enter-active > .b-drawer,
.b-drawer-leave-active > .b-drawer {
  transition: transform var(--b-drawer-transition-duration) cubic-bezier(0.7, 0.3, 0.1, 1);
}

.b-drawer-enter-active > .b-drawer__mask,
.b-drawer-leave-active > .b-drawer__mask {
  transition: opacity var(--b-drawer-transition-duration) ease;
}

/* - From / To: mask fades - */
.b-drawer-enter-from > .b-drawer__mask,
.b-drawer-leave-to > .b-drawer__mask {
  opacity: 0;
}

/* - From / To: panel slides (right) - */
.b-drawer-enter-from > .b-drawer--right,
.b-drawer-leave-to > .b-drawer--right {
  transform: translateX(100%);
}

/* - From / To: panel slides (left) - */
.b-drawer-enter-from > .b-drawer--left,
.b-drawer-leave-to > .b-drawer--left {
  transform: translateX(-100%);
}

/* - From / To: panel slides (top) - */
.b-drawer-enter-from > .b-drawer--top,
.b-drawer-leave-to > .b-drawer--top {
  transform: translateY(-100%);
}

/* - From / To: panel slides (bottom) - */
.b-drawer-enter-from > .b-drawer--bottom,
.b-drawer-leave-to > .b-drawer--bottom {
  transform: translateY(100%);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-drawer-enter-active,
  .b-drawer-leave-active,
  .b-drawer-enter-active > .b-drawer,
  .b-drawer-leave-active > .b-drawer,
  .b-drawer-enter-active > .b-drawer__mask,
  .b-drawer-leave-active > .b-drawer__mask {
    transition-duration: 0ms;
  }

  .b-drawer__spinner {
    animation: none;
  }
}
</style>

