<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { BPopconfirmPlacement, BPopconfirmTrigger } from '@/types.ts';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';

// ─────────────────────────────────────────────
// Props & emits
// ─────────────────────────────────────────────
const {
  title,
  description,
  okText = 'Yes',
  cancelText = 'No',
  okType = 'primary',
  disabled = false,
  icon,
  showCancel = true,
  trigger = BPopconfirmTrigger.Click,
  placement = BPopconfirmPlacement.TopCenter,
  arrow = true,
  mouseEnterDelay = 100,
  mouseLeaveDelay = 100,
  destroyTooltipOnHide = false,
  zIndex = 1060,
  modelValue = undefined,
} = defineProps<{
  /** The confirmation question or text shown in the popconfirm. Also accepts the `title` slot. */
  title?: string;
  /** Additional description below the title. Also accepts the `description` slot. */
  description?: string;
  /** Text of the confirm button. */
  okText?: string;
  /** Text of the cancel button. */
  cancelText?: string;
  /** Button type of the confirm button: 'primary' | 'default' | 'dashed' | 'text' | 'link'. */
  okType?: 'primary' | 'default' | 'dashed' | 'text' | 'link';
  /** Whether the popconfirm is disabled (clicking trigger does nothing). */
  disabled?: boolean;
  /** Custom icon slot name override. When not provided, a default warning icon is used. */
  icon?: string;
  /** Whether to show the cancel button. */
  showCancel?: boolean;
  /** The event that triggers the popconfirm to open. */
  trigger?: `${BPopconfirmTrigger}`;
  /** Placement of the popconfirm relative to the target element. */
  placement?: `${BPopconfirmPlacement}`;
  /** Whether the popconfirm has an arrow pointing to the target. */
  arrow?: boolean;
  /** Delay in ms before showing on mouseenter. */
  mouseEnterDelay?: number;
  /** Delay in ms before hiding on mouseleave. */
  mouseLeaveDelay?: number;
  /** Whether to destroy the popconfirm DOM when hidden. */
  destroyTooltipOnHide?: boolean;
  /** z-index of the popconfirm. */
  zIndex?: number;
  /** Controlled visibility - bind with `v-model`. */
  modelValue?: boolean;
}>();

const emit = defineEmits<{
  /** Emitted when the confirm button is clicked. Receives a callback to close programmatically. */
  (e: 'confirm', event: MouseEvent): void;
  /** Emitted when the cancel button is clicked. Receives a callback to close programmatically. */
  (e: 'cancel', event: MouseEvent): void;
  /** Emitted when the popconfirm visibility changes. */
  (e: 'openChange', open: boolean): void;
  /** v-model support. */
  (e: 'update:modelValue', value: boolean): void;
}>();

defineSlots<{
  /** The target element that triggers the popconfirm. */
  default?(): unknown;
  /** Overrides the `title` prop with custom content. */
  title?(): unknown;
  /** Overrides the `description` prop with custom content. */
  description?(): unknown;
  /** Overrides the default warning icon. */
  icon?(): unknown;
  /** Overrides the confirm button. */
  okButton?(): unknown;
  /** Overrides the cancel button. */
  cancelButton?(): unknown;
}>();

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const { componentUID } = useComponentId();
const popconfirmId = useId();
const titleId = `${popconfirmId}-title`;
const descId = `${popconfirmId}-desc`;

const internalOpen = ref(false);
const isOpen = computed(() =>
  modelValue !== undefined ? modelValue : internalOpen.value,
);

const hasBeenOpened = ref(false);
const shouldRender = computed(() => {
  if (destroyTooltipOnHide) return isOpen.value;
  return hasBeenOpened.value || isOpen.value;
});

watch(isOpen, (val) => {
  if (val) hasBeenOpened.value = true;
});

// ─────────────────────────────────────────────
// Visibility control
// ─────────────────────────────────────────────
let showTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  if (showTimer) { clearTimeout(showTimer); showTimer = null; }
  if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
}

function requestOpen(delay = 0) {
  if (disabled) return;
  clearTimers();
  if (isOpen.value) return;
  if (delay > 0) {
    showTimer = setTimeout(() => doOpen(), delay);
  } else {
    doOpen();
  }
}

function requestClose(delay = 0) {
  clearTimers();
  if (!isOpen.value) return;
  if (delay > 0) {
    hideTimer = setTimeout(() => doClose(), delay);
  } else {
    doClose();
  }
}

function doOpen() {
  popconfirmRef.value?.showPopover();
}

function doClose() {
  popconfirmRef.value?.hidePopover();
}

function setOpen(val: boolean) {
  if (modelValue !== undefined) {
    emit('update:modelValue', val);
  } else {
    internalOpen.value = val;
  }
  emit('openChange', val);
}

// ─────────────────────────────────────────────
// Popover toggle event
// ─────────────────────────────────────────────
const onPopoverToggle = ({ newState }: ToggleEvent) => {
  setOpen(newState === 'open');
};

// ─────────────────────────────────────────────
// Refs
// ─────────────────────────────────────────────
const popconfirmRef = ref<HTMLDivElement | null>(null);
const toggleRef = ref<HTMLDivElement | null>(null);

// ─────────────────────────────────────────────
// Focus management
// ─────────────────────────────────────────────
let previouslyFocusedElement: HTMLElement | null = null;

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusFirstButton() {
  nextTick(() => {
    if (!popconfirmRef.value) return;
    const first = popconfirmRef.value.querySelector<HTMLElement>(focusableSelector);
    if (first) {
      first.focus();
    } else {
      popconfirmRef.value.focus();
    }
  });
}

function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !popconfirmRef.value) return;

  const focusable = Array.from(
    popconfirmRef.value.querySelectorAll<HTMLElement>(focusableSelector),
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

watch(isOpen, (val) => {
  if (val) {
    previouslyFocusedElement = document.activeElement as HTMLElement | null;
    focusFirstButton();
  } else {
    if (previouslyFocusedElement) {
      nextTick(() => previouslyFocusedElement?.focus());
    }
  }
});

// ─────────────────────────────────────────────
// Button handlers
// ─────────────────────────────────────────────
function onConfirm(event: MouseEvent) {
  emit('confirm', event);
  requestClose();
}

function onCancel(event: MouseEvent) {
  emit('cancel', event);
  requestClose();
}

// ─────────────────────────────────────────────
// Event handlers
// ─────────────────────────────────────────────
function onClick() {
  if (disabled) return;
  if (isOpen.value) {
    requestClose();
  } else {
    requestOpen();
  }
}

function onMouseEnter() {
  requestOpen(mouseEnterDelay);
}

function onMouseLeave() {
  requestClose(mouseLeaveDelay);
}

function onFocusIn() {
  requestOpen();
}

function onFocusOut() {
  requestClose();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) {
    event.preventDefault();
    requestClose();
  }
}

function onPopconfirmKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault();
    requestClose();
  }
  trapFocus(event);
}

// ─────────────────────────────────────────────
// Popconfirm hover (keep open when hovering content)
// ─────────────────────────────────────────────
function onPopconfirmMouseEnter() {
  if (trigger === BPopconfirmTrigger.Hover) {
    clearTimers();
  }
}

function onPopconfirmMouseLeave() {
  if (trigger === BPopconfirmTrigger.Hover) {
    requestClose(mouseLeaveDelay);
  }
}

// ─────────────────────────────────────────────
// Event listener management
// ─────────────────────────────────────────────
function attachListeners() {
  const el = toggleRef.value;
  if (!el) return;

  el.addEventListener('keydown', onKeydown);

  switch (trigger) {
    case BPopconfirmTrigger.Click:
      el.addEventListener('click', onClick);
      break;
    case BPopconfirmTrigger.Focus:
      el.addEventListener('focusin', onFocusIn);
      el.addEventListener('focusout', onFocusOut);
      break;
    case BPopconfirmTrigger.Hover:
    default:
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
      el.addEventListener('focusin', onFocusIn);
      el.addEventListener('focusout', onFocusOut);
      break;
  }
}

function detachListeners() {
  const el = toggleRef.value;
  if (!el) return;

  el.removeEventListener('keydown', onKeydown);
  el.removeEventListener('click', onClick);
  el.removeEventListener('focusin', onFocusIn);
  el.removeEventListener('focusout', onFocusOut);
  el.removeEventListener('mouseenter', onMouseEnter);
  el.removeEventListener('mouseleave', onMouseLeave);
}

onMounted(() => {
  attachListeners();
});

onBeforeUnmount(() => {
  detachListeners();
  clearTimers();
});

watch(
  () => trigger,
  () => {
    detachListeners();
    attachListeners();
  },
);

// Sync controlled v-model → popover state
watch(
  () => modelValue,
  (val) => {
    if (val === undefined) return;
    if (val) {
      popconfirmRef.value?.showPopover();
    } else {
      popconfirmRef.value?.hidePopover();
    }
  },
);

// ─────────────────────────────────────────────
// Computed styles
// ─────────────────────────────────────────────
const anchorName = computed(() => `--b-popconfirm-anchor-${componentUID.value}`);

const placementClass = computed(() => {
  const map: Record<string, string> = {
    [BPopconfirmPlacement.TopLeft]: 'top-left',
    [BPopconfirmPlacement.TopCenter]: 'top-center',
    [BPopconfirmPlacement.TopRight]: 'top-right',
    [BPopconfirmPlacement.RightTop]: 'right-top',
    [BPopconfirmPlacement.RightCenter]: 'right-center',
    [BPopconfirmPlacement.RightBottom]: 'right-bottom',
    [BPopconfirmPlacement.BottomRight]: 'bottom-right',
    [BPopconfirmPlacement.BottomCenter]: 'bottom-center',
    [BPopconfirmPlacement.BottomLeft]: 'bottom-left',
    [BPopconfirmPlacement.LeftBottom]: 'left-bottom',
    [BPopconfirmPlacement.LeftCenter]: 'left-center',
    [BPopconfirmPlacement.LeftTop]: 'left-top',
  };
  return map[placement] ?? 'top-center';
});

const okButtonClass = computed(() => {
  const map: Record<string, string> = {
    primary: 'b-popconfirm__btn--primary',
    default: 'b-popconfirm__btn--default',
    dashed: 'b-popconfirm__btn--dashed',
    text: 'b-popconfirm__btn--text',
    link: 'b-popconfirm__btn--link',
  };
  return map[okType] ?? 'b-popconfirm__btn--primary';
});

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────
defineExpose({ open: doOpen, close: doClose });
</script>

<template>
  <div
    ref="toggleRef"
    class="b-popconfirm__toggle"
    :style="{ anchorName: anchorName }"
  >
    <slot />
  </div>

  <div
    ref="popconfirmRef"
    popover="manual"
    :class="[
      'b-popconfirm__content',
      placementClass,
      { 'b-popconfirm__content--no-arrow': !arrow },
    ]"
    :style="{ zIndex, positionAnchor: anchorName }"
    role="dialog"
    aria-modal="false"
    :aria-labelledby="titleId"
    :aria-describedby="description ? descId : undefined"
    :id="popconfirmId"
    tabindex="-1"
    @toggle="onPopoverToggle"
    @keydown="onPopconfirmKeydown"
    @mouseenter="onPopconfirmMouseEnter"
    @mouseleave="onPopconfirmMouseLeave"
  >
    <template v-if="shouldRender || !destroyTooltipOnHide">
      <div
        v-if="arrow"
        class="b-popconfirm__arrow"
        aria-hidden="true"
      />
      <div class="b-popconfirm__inner">
        <div class="b-popconfirm__message">
          <span class="b-popconfirm__icon" aria-hidden="true">
            <slot name="icon">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                width="16"
                height="16"
                aria-hidden="true"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </slot>
          </span>
          <div class="b-popconfirm__text">
            <div :id="titleId" class="b-popconfirm__title">
              <slot name="title">{{ title }}</slot>
            </div>
            <div
              v-if="description || $slots.description"
              :id="descId"
              class="b-popconfirm__description"
            >
              <slot name="description">{{ description }}</slot>
            </div>
          </div>
        </div>
        <div class="b-popconfirm__buttons" role="group">
          <slot name="cancelButton">
            <button
              v-if="showCancel"
              type="button"
              class="b-popconfirm__btn b-popconfirm__btn--default"
              @click="onCancel"
            >
              {{ cancelText }}
            </button>
          </slot>
          <slot name="okButton">
            <button
              type="button"
              :class="['b-popconfirm__btn', okButtonClass]"
              @click="onConfirm"
            >
              {{ okText }}
            </button>
          </slot>
        </div>
      </div>
    </template>
  </div>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (tokens)
   ──────────────────────────────────────────── */
:root {
  --b-popconfirm-bg: #fff;
  --b-popconfirm-color: oklch(25% 0 0);
  --b-popconfirm-font-size: 0.875rem;
  --b-popconfirm-line-height: 1.5;
  --b-popconfirm-padding-x: 0.75rem;
  --b-popconfirm-padding-y: 0.75rem;
  --b-popconfirm-border-radius: 0.5rem;
  --b-popconfirm-max-width: 320px;
  --b-popconfirm-arrow-size: 8px;
  --b-popconfirm-arrow-color: #fff;
  --b-popconfirm-gap: 8px;
  --b-popconfirm-transition-duration: 200ms;
  --b-popconfirm-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  --b-popconfirm-icon-color: oklch(75% 0.15 85);
  --b-popconfirm-title-font-weight: 600;
  --b-popconfirm-description-color: oklch(45% 0 0);
  --b-popconfirm-btn-font-size: 0.8125rem;
  --b-popconfirm-btn-padding-x: 0.5rem;
  --b-popconfirm-btn-padding-y: 0.125rem;
  --b-popconfirm-btn-border-radius: 0.25rem;
  --b-popconfirm-btn-primary-bg: oklch(55% 0.2 260);
  --b-popconfirm-btn-primary-color: #fff;
  --b-popconfirm-btn-default-bg: transparent;
  --b-popconfirm-btn-default-color: oklch(25% 0 0);
  --b-popconfirm-btn-default-border: oklch(80% 0 0);
}

/* ── Dark mode ── */
[data-prefers-color='dark'] {
  --b-popconfirm-bg: oklch(22% 0 0);
  --b-popconfirm-color: oklch(90% 0 0);
  --b-popconfirm-arrow-color: oklch(22% 0 0);
  --b-popconfirm-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.24),
    0 3px 6px -4px rgba(0, 0, 0, 0.36),
    0 9px 28px 8px rgba(0, 0, 0, 0.2);
  --b-popconfirm-icon-color: oklch(80% 0.15 85);
  --b-popconfirm-description-color: oklch(65% 0 0);
  --b-popconfirm-btn-primary-bg: oklch(55% 0.2 260);
  --b-popconfirm-btn-default-color: oklch(90% 0 0);
  --b-popconfirm-btn-default-border: oklch(40% 0 0);
}

/* ─────────────────────────────────────────────
   Toggle wrapper
   ───────────────────────────────────────────── */
.b-popconfirm__toggle {
  display: inline-block;
}

/* ─────────────────────────────────────────────
   Popconfirm content (popover)
   ───────────────────────────────────────────── */
.b-popconfirm__content {
  /* Reset popover defaults */
  position: absolute;
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
  overflow: visible;
  max-width: var(--b-popconfirm-max-width);
  box-sizing: border-box;
  pointer-events: auto;

  /* Animation and visibility */
  transition:
    display var(--b-popconfirm-transition-duration),
    opacity var(--b-popconfirm-transition-duration);
  transition-behavior: allow-discrete;
  opacity: 0;

  &:popover-open {
    opacity: 1;

    @starting-style {
      opacity: 0;
    }
  }

  /* ── Placement: Top ── */
  &.top-left {
    inset: auto;
    bottom: anchor(top);
    left: anchor(left);
    margin-bottom: var(--b-popconfirm-gap);
  }
  &.top-center {
    inset: auto;
    bottom: anchor(top);
    justify-self: anchor-center;
    margin-bottom: var(--b-popconfirm-gap);
  }
  &.top-right {
    inset: auto;
    bottom: anchor(top);
    right: anchor(right);
    margin-bottom: var(--b-popconfirm-gap);
  }

  /* ── Placement: Right ── */
  &.right-top {
    inset: auto;
    top: anchor(top);
    left: anchor(right);
    margin-left: var(--b-popconfirm-gap);
  }
  &.right-center {
    inset: auto;
    align-self: anchor-center;
    left: anchor(right);
    margin-left: var(--b-popconfirm-gap);
  }
  &.right-bottom {
    inset: auto;
    bottom: anchor(bottom);
    left: anchor(right);
    margin-left: var(--b-popconfirm-gap);
  }

  /* ── Placement: Bottom ── */
  &.bottom-right {
    inset: auto;
    top: anchor(bottom);
    right: anchor(right);
    margin-top: var(--b-popconfirm-gap);
  }
  &.bottom-center {
    inset: auto;
    top: anchor(bottom);
    justify-self: anchor-center;
    margin-top: var(--b-popconfirm-gap);
  }
  &.bottom-left {
    inset: auto;
    top: anchor(bottom);
    left: anchor(left);
    margin-top: var(--b-popconfirm-gap);
  }

  /* ── Placement: Left ── */
  &.left-bottom {
    inset: auto;
    bottom: anchor(bottom);
    right: anchor(left);
    margin-right: var(--b-popconfirm-gap);
  }
  &.left-center {
    inset: auto;
    align-self: anchor-center;
    right: anchor(left);
    margin-right: var(--b-popconfirm-gap);
  }
  &.left-top {
    inset: auto;
    top: anchor(top);
    right: anchor(left);
    margin-right: var(--b-popconfirm-gap);
  }
}

/* ─────────────────────────────────────────────
   Inner content
   ───────────────────────────────────────────── */
.b-popconfirm__inner {
  background: var(--b-popconfirm-bg);
  color: var(--b-popconfirm-color);
  font-size: var(--b-popconfirm-font-size);
  line-height: var(--b-popconfirm-line-height);
  padding: var(--b-popconfirm-padding-y) var(--b-popconfirm-padding-x);
  border-radius: var(--b-popconfirm-border-radius);
  box-shadow: var(--b-popconfirm-shadow);
  word-wrap: break-word;
}

/* ─────────────────────────────────────────────
   Message row (icon + text)
   ───────────────────────────────────────────── */
.b-popconfirm__message {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.b-popconfirm__icon {
  flex-shrink: 0;
  color: var(--b-popconfirm-icon-color);
  line-height: 1;
  margin-top: 0.125rem;
}

.b-popconfirm__text {
  flex: 1;
  min-width: 0;
}

.b-popconfirm__title {
  font-weight: var(--b-popconfirm-title-font-weight);
}

.b-popconfirm__description {
  color: var(--b-popconfirm-description-color);
  margin-top: 0.25rem;
  font-size: 0.8125rem;
}

/* ─────────────────────────────────────────────
   Buttons
   ───────────────────────────────────────────── */
.b-popconfirm__buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.b-popconfirm__btn {
  cursor: pointer;
  font-size: var(--b-popconfirm-btn-font-size);
  line-height: 1.5;
  padding: var(--b-popconfirm-btn-padding-y) var(--b-popconfirm-btn-padding-x);
  border-radius: var(--b-popconfirm-btn-border-radius);
  border: 1px solid transparent;
  font-family: inherit;
  transition: opacity 150ms;

  &:hover {
    opacity: 0.85;
  }

  &:focus-visible {
    outline: 2px solid oklch(55% 0.2 260);
    outline-offset: 1px;
  }
}

.b-popconfirm__btn--primary {
  background: var(--b-popconfirm-btn-primary-bg);
  color: var(--b-popconfirm-btn-primary-color);
}

.b-popconfirm__btn--default {
  background: var(--b-popconfirm-btn-default-bg);
  color: var(--b-popconfirm-btn-default-color);
  border-color: var(--b-popconfirm-btn-default-border);
}

.b-popconfirm__btn--dashed {
  background: var(--b-popconfirm-btn-default-bg);
  color: var(--b-popconfirm-btn-default-color);
  border-color: var(--b-popconfirm-btn-default-border);
  border-style: dashed;
}

.b-popconfirm__btn--text {
  background: transparent;
  color: var(--b-popconfirm-btn-default-color);
  border: none;
}

.b-popconfirm__btn--link {
  background: transparent;
  color: var(--b-popconfirm-btn-primary-bg);
  border: none;
  text-decoration: underline;
}

/* ─────────────────────────────────────────────
   Arrow
   ───────────────────────────────────────────── */
.b-popconfirm__arrow {
  position: absolute;
  width: var(--b-popconfirm-arrow-size);
  height: var(--b-popconfirm-arrow-size);
  background: var(--b-popconfirm-arrow-color);
  transform: rotate(45deg);
  pointer-events: none;
}

/* Arrow positioning for top placements */
.b-popconfirm__content.top-left .b-popconfirm__arrow,
.b-popconfirm__content.top-center .b-popconfirm__arrow,
.b-popconfirm__content.top-right .b-popconfirm__arrow {
  bottom: calc(var(--b-popconfirm-arrow-size) / -2);
  left: 50%;
  margin-left: calc(var(--b-popconfirm-arrow-size) / -2);
}

/* Arrow positioning for bottom placements */
.b-popconfirm__content.bottom-left .b-popconfirm__arrow,
.b-popconfirm__content.bottom-center .b-popconfirm__arrow,
.b-popconfirm__content.bottom-right .b-popconfirm__arrow {
  top: calc(var(--b-popconfirm-arrow-size) / -2);
  left: 50%;
  margin-left: calc(var(--b-popconfirm-arrow-size) / -2);
}

/* Arrow positioning for right placements */
.b-popconfirm__content.right-top .b-popconfirm__arrow,
.b-popconfirm__content.right-center .b-popconfirm__arrow,
.b-popconfirm__content.right-bottom .b-popconfirm__arrow {
  left: calc(var(--b-popconfirm-arrow-size) / -2);
  top: 50%;
  margin-top: calc(var(--b-popconfirm-arrow-size) / -2);
}

/* Arrow positioning for left placements */
.b-popconfirm__content.left-top .b-popconfirm__arrow,
.b-popconfirm__content.left-center .b-popconfirm__arrow,
.b-popconfirm__content.left-bottom .b-popconfirm__arrow {
  right: calc(var(--b-popconfirm-arrow-size) / -2);
  top: 50%;
  margin-top: calc(var(--b-popconfirm-arrow-size) / -2);
}

/* ─────────────────────────────────────────────
   Position fallbacks (auto-adjust overflow)
   ───────────────────────────────────────────── */
@position-try --b-popconfirm-top-center {
  inset: auto;
  bottom: anchor(top);
  justify-self: anchor-center;
  margin-bottom: var(--b-popconfirm-gap);
}

@position-try --b-popconfirm-bottom-center {
  inset: auto;
  top: anchor(bottom);
  justify-self: anchor-center;
  margin-top: var(--b-popconfirm-gap);
}

@position-try --b-popconfirm-right-center {
  inset: auto;
  align-self: anchor-center;
  left: anchor(right);
  margin-left: var(--b-popconfirm-gap);
}

@position-try --b-popconfirm-left-center {
  inset: auto;
  align-self: anchor-center;
  right: anchor(left);
  margin-right: var(--b-popconfirm-gap);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-popconfirm__content {
    transition-duration: 0ms;
  }

  .b-popconfirm__btn {
    transition-duration: 0ms;
  }
}
</style>
