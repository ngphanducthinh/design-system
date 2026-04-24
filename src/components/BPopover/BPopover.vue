<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { BPopoverPlacement, BPopoverTrigger } from '@/types.ts';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';

// ─────────────────────────────────────────────
// Props & emits
// ─────────────────────────────────────────────
const {
  title,
  content,
  trigger = BPopoverTrigger.Hover,
  placement = BPopoverPlacement.TopCenter,
  arrow = true,
  mouseEnterDelay = 100,
  mouseLeaveDelay = 100,
  destroyTooltipOnHide = false,
  zIndex = 1030,
  fresh = false,
  modelValue = undefined,
} = defineProps<{
  /** The title shown at the top of the popover. Also accepts the `title` slot. */
  title?: string;
  /** The main content of the popover. Also accepts the `content` slot. */
  content?: string;
  /** The event that triggers the popover to open. */
  trigger?: `${BPopoverTrigger}`;
  /** Placement of the popover relative to the target element. */
  placement?: `${BPopoverPlacement}`;
  /** Whether the popover has an arrow pointing to the target. */
  arrow?: boolean;
  /** Delay in ms before showing on mouseenter. */
  mouseEnterDelay?: number;
  /** Delay in ms before hiding on mouseleave. */
  mouseLeaveDelay?: number;
  /** Whether to destroy the popover DOM when hidden. */
  destroyTooltipOnHide?: boolean;
  /** z-index of the popover. */
  zIndex?: number;
  /** Force re-render when popover is shown. */
  fresh?: boolean;
  /** Controlled visibility — bind with `v-model`. */
  modelValue?: boolean;
}>();

const emit = defineEmits<{
  /** Emitted when the popover visibility changes. */
  (e: 'openChange', open: boolean): void;
  /** v-model support. */
  (e: 'update:modelValue', value: boolean): void;
}>();

defineSlots<{
  /** The target element that triggers the popover. */
  default?(): unknown;
  /** Overrides the `title` prop with custom content. */
  title?(): unknown;
  /** Overrides the `content` prop with custom content. */
  content?(): unknown;
}>();

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const { componentUID } = useComponentId();
const popoverId = useId();
const titleId = `${popoverId}-title`;

const internalOpen = ref(false);
const isOpen = computed(() =>
  modelValue !== undefined ? modelValue : internalOpen.value,
);

const hasBeenOpened = ref(false);
const shouldRender = computed(() => {
  if (fresh) return isOpen.value;
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
  popoverRef.value?.showPopover();
}

function doClose() {
  popoverRef.value?.hidePopover();
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
const popoverRef = ref<HTMLDivElement | null>(null);
const toggleRef = ref<HTMLDivElement | null>(null);

// ─────────────────────────────────────────────
// Focus management
// ─────────────────────────────────────────────
let previouslyFocusedElement: HTMLElement | null = null;

const focusableSelector =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function focusPopoverContent() {
  nextTick(() => {
    if (!popoverRef.value) return;
    const first = popoverRef.value.querySelector<HTMLElement>(focusableSelector);
    if (first) {
      first.focus();
    } else {
      popoverRef.value.focus();
    }
  });
}

function trapFocus(event: KeyboardEvent) {
  if (event.key !== 'Tab' || !popoverRef.value) return;

  const focusable = Array.from(
    popoverRef.value.querySelectorAll<HTMLElement>(focusableSelector),
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
    focusPopoverContent();
  } else {
    if (previouslyFocusedElement) {
      nextTick(() => previouslyFocusedElement?.focus());
    }
  }
});

// ─────────────────────────────────────────────
// Event handlers
// ─────────────────────────────────────────────
function onClick() {
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

function onPopoverKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault();
    requestClose();
  }
  trapFocus(event);
}

// ─────────────────────────────────────────────
// Popover hover (keep open when hovering content)
// ─────────────────────────────────────────────
function onPopoverMouseEnter() {
  if (trigger === BPopoverTrigger.Hover) {
    clearTimers();
  }
}

function onPopoverMouseLeave() {
  if (trigger === BPopoverTrigger.Hover) {
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
    case BPopoverTrigger.Click:
      el.addEventListener('click', onClick);
      break;
    case BPopoverTrigger.Focus:
      el.addEventListener('focusin', onFocusIn);
      el.addEventListener('focusout', onFocusOut);
      break;
    case BPopoverTrigger.Hover:
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
      popoverRef.value?.showPopover();
    } else {
      popoverRef.value?.hidePopover();
    }
  },
);

// ─────────────────────────────────────────────
// Computed styles
// ─────────────────────────────────────────────
const anchorName = computed(() => `--b-popover-anchor-${componentUID.value}`);

const placementClass = computed(() => {
  const map: Record<string, string> = {
    [BPopoverPlacement.TopLeft]: 'top-left',
    [BPopoverPlacement.TopCenter]: 'top-center',
    [BPopoverPlacement.TopRight]: 'top-right',
    [BPopoverPlacement.RightTop]: 'right-top',
    [BPopoverPlacement.RightCenter]: 'right-center',
    [BPopoverPlacement.RightBottom]: 'right-bottom',
    [BPopoverPlacement.BottomRight]: 'bottom-right',
    [BPopoverPlacement.BottomCenter]: 'bottom-center',
    [BPopoverPlacement.BottomLeft]: 'bottom-left',
    [BPopoverPlacement.LeftBottom]: 'left-bottom',
    [BPopoverPlacement.LeftCenter]: 'left-center',
    [BPopoverPlacement.LeftTop]: 'left-top',
  };
  return map[placement] ?? 'top-center';
});

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────
defineExpose({ open: doOpen, close: doClose });
</script>

<template>
  <div
    ref="toggleRef"
    class="b-popover__toggle"
    :style="{ anchorName: anchorName }"
  >
    <slot />
  </div>

  <div
    ref="popoverRef"
    popover="manual"
    :class="[
      'b-popover__content',
      placementClass,
      { 'b-popover__content--no-arrow': !arrow },
    ]"
    :style="{ zIndex, positionAnchor: anchorName }"
    role="tooltip"
    :aria-labelledby="titleId"
    :id="popoverId"
    tabindex="-1"
    @toggle="onPopoverToggle"
    @keydown="onPopoverKeydown"
    @mouseenter="onPopoverMouseEnter"
    @mouseleave="onPopoverMouseLeave"
  >
    <template v-if="shouldRender || !destroyTooltipOnHide">
      <div
        v-if="arrow"
        class="b-popover__arrow"
        aria-hidden="true"
      />
      <div class="b-popover__inner">
        <div
          v-if="title || $slots.title"
          :id="titleId"
          class="b-popover__title"
        >
          <slot name="title">{{ title }}</slot>
        </div>
        <div class="b-popover__body">
          <slot name="content">{{ content }}</slot>
        </div>
      </div>
    </template>
  </div>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (tokens)
   ──────────────────────────────────────────── */
.b-popover__content {
  --b-popover-bg: #fff;
  --b-popover-color: oklch(25% 0 0);
  --b-popover-font-size: 0.875rem;
  --b-popover-line-height: 1.5;
  --b-popover-padding-x: 0.75rem;
  --b-popover-padding-y: 0.75rem;
  --b-popover-border-radius: 0.5rem;
  --b-popover-max-width: 320px;
  --b-popover-min-width: 177px;
  --b-popover-arrow-size: 8px;
  --b-popover-arrow-color: #fff;
  --b-popover-gap: 8px;
  --b-popover-transition-duration: 200ms;
  --b-popover-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  --b-popover-title-font-weight: 600;
  --b-popover-title-font-size: 0.875rem;
  --b-popover-title-color: oklch(15% 0 0);
  --b-popover-title-padding-bottom: 0.5rem;
  --b-popover-title-border-bottom: 1px solid oklch(90% 0 0);
  --b-popover-title-margin-bottom: 0.5rem;
  --b-popover-body-color: oklch(35% 0 0);
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-popover__content {
  --b-popover-bg: oklch(22% 0 0);
  --b-popover-color: oklch(90% 0 0);
  --b-popover-arrow-color: oklch(22% 0 0);
  --b-popover-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.24),
    0 3px 6px -4px rgba(0, 0, 0, 0.36),
    0 9px 28px 8px rgba(0, 0, 0, 0.2);
  --b-popover-title-color: oklch(95% 0 0);
  --b-popover-title-border-bottom: 1px solid oklch(30% 0 0);
  --b-popover-body-color: oklch(75% 0 0);
}

/* ─────────────────────────────────────────────
   Toggle wrapper
   ───────────────────────────────────────────── */
.b-popover__toggle {
  display: inline-block;
}

/* ─────────────────────────────────────────────
   Popover content (popover)
   ───────────────────────────────────────────── */
.b-popover__content {
  /* Reset popover defaults */
  position: absolute;
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
  overflow: visible;
  max-width: var(--b-popover-max-width);
  min-width: var(--b-popover-min-width);
  box-sizing: border-box;
  pointer-events: auto;

  /* Animation and visibility */
  transition:
    display var(--b-popover-transition-duration),
    opacity var(--b-popover-transition-duration);
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
    margin-bottom: var(--b-popover-gap);
  }
  &.top-center {
    inset: auto;
    bottom: anchor(top);
    justify-self: anchor-center;
    margin-bottom: var(--b-popover-gap);
  }
  &.top-right {
    inset: auto;
    bottom: anchor(top);
    right: anchor(right);
    margin-bottom: var(--b-popover-gap);
  }

  /* ── Placement: Right ── */
  &.right-top {
    inset: auto;
    top: anchor(top);
    left: anchor(right);
    margin-left: var(--b-popover-gap);
  }
  &.right-center {
    inset: auto;
    align-self: anchor-center;
    left: anchor(right);
    margin-left: var(--b-popover-gap);
  }
  &.right-bottom {
    inset: auto;
    bottom: anchor(bottom);
    left: anchor(right);
    margin-left: var(--b-popover-gap);
  }

  /* ── Placement: Bottom ── */
  &.bottom-right {
    inset: auto;
    top: anchor(bottom);
    right: anchor(right);
    margin-top: var(--b-popover-gap);
  }
  &.bottom-center {
    inset: auto;
    top: anchor(bottom);
    justify-self: anchor-center;
    margin-top: var(--b-popover-gap);
  }
  &.bottom-left {
    inset: auto;
    top: anchor(bottom);
    left: anchor(left);
    margin-top: var(--b-popover-gap);
  }

  /* ── Placement: Left ── */
  &.left-bottom {
    inset: auto;
    bottom: anchor(bottom);
    right: anchor(left);
    margin-right: var(--b-popover-gap);
  }
  &.left-center {
    inset: auto;
    align-self: anchor-center;
    right: anchor(left);
    margin-right: var(--b-popover-gap);
  }
  &.left-top {
    inset: auto;
    top: anchor(top);
    right: anchor(left);
    margin-right: var(--b-popover-gap);
  }
}

/* ─────────────────────────────────────────────
   Inner content
   ───────────────────────────────────────────── */
.b-popover__inner {
  background: var(--b-popover-bg);
  color: var(--b-popover-color);
  font-size: var(--b-popover-font-size);
  line-height: var(--b-popover-line-height);
  padding: var(--b-popover-padding-y) var(--b-popover-padding-x);
  border-radius: var(--b-popover-border-radius);
  box-shadow: var(--b-popover-shadow);
  word-wrap: break-word;
}

/* ─────────────────────────────────────────────
   Title
   ───────────────────────────────────────────── */
.b-popover__title {
  font-weight: var(--b-popover-title-font-weight);
  font-size: var(--b-popover-title-font-size);
  color: var(--b-popover-title-color);
  padding-bottom: var(--b-popover-title-padding-bottom);
  border-bottom: var(--b-popover-title-border-bottom);
  margin-bottom: var(--b-popover-title-margin-bottom);
}

/* ─────────────────────────────────────────────
   Body
   ───────────────────────────────────────────── */
.b-popover__body {
  color: var(--b-popover-body-color);
}

/* ─────────────────────────────────────────────
   Arrow
   ───────────────────────────────────────────── */
.b-popover__arrow {
  position: absolute;
  width: var(--b-popover-arrow-size);
  height: var(--b-popover-arrow-size);
  background: var(--b-popover-arrow-color);
  transform: rotate(45deg);
  pointer-events: none;
}

/* Arrow positioning for top placements */
.b-popover__content.top-left .b-popover__arrow,
.b-popover__content.top-center .b-popover__arrow,
.b-popover__content.top-right .b-popover__arrow {
  bottom: calc(var(--b-popover-arrow-size) / -2);
  left: 50%;
  margin-left: calc(var(--b-popover-arrow-size) / -2);
}

/* Arrow positioning for bottom placements */
.b-popover__content.bottom-left .b-popover__arrow,
.b-popover__content.bottom-center .b-popover__arrow,
.b-popover__content.bottom-right .b-popover__arrow {
  top: calc(var(--b-popover-arrow-size) / -2);
  left: 50%;
  margin-left: calc(var(--b-popover-arrow-size) / -2);
}

/* Arrow positioning for right placements */
.b-popover__content.right-top .b-popover__arrow,
.b-popover__content.right-center .b-popover__arrow,
.b-popover__content.right-bottom .b-popover__arrow {
  left: calc(var(--b-popover-arrow-size) / -2);
  top: 50%;
  margin-top: calc(var(--b-popover-arrow-size) / -2);
}

/* Arrow positioning for left placements */
.b-popover__content.left-top .b-popover__arrow,
.b-popover__content.left-center .b-popover__arrow,
.b-popover__content.left-bottom .b-popover__arrow {
  right: calc(var(--b-popover-arrow-size) / -2);
  top: 50%;
  margin-top: calc(var(--b-popover-arrow-size) / -2);
}

/* ─────────────────────────────────────────────
   Position fallbacks (auto-adjust overflow)
   ───────────────────────────────────────────── */
@position-try --b-popover-top-center {
  inset: auto;
  bottom: anchor(top);
  justify-self: anchor-center;
  margin-bottom: var(--b-popover-gap);
}

@position-try --b-popover-bottom-center {
  inset: auto;
  top: anchor(bottom);
  justify-self: anchor-center;
  margin-top: var(--b-popover-gap);
}

@position-try --b-popover-right-center {
  inset: auto;
  align-self: anchor-center;
  left: anchor(right);
  margin-left: var(--b-popover-gap);
}

@position-try --b-popover-left-center {
  inset: auto;
  align-self: anchor-center;
  right: anchor(left);
  margin-right: var(--b-popover-gap);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-popover__content {
    transition-duration: 0ms;
  }
}
</style>
