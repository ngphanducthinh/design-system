<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { BTooltipPlacement, BTooltipTrigger } from '@/types.ts';
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';

// ─────────────────────────────────────────────
// Props & emits
// ─────────────────────────────────────────────
const {
  title,
  trigger = BTooltipTrigger.Hover,
  placement = BTooltipPlacement.TopCenter,
  arrow = true,
  color,
  mouseEnterDelay = 100,
  mouseLeaveDelay = 100,
  destroyTooltipOnHide = false,
  zIndex = 1070,
  fresh = false,
  modelValue = undefined,
} = defineProps<{
  /** The text shown inside the tooltip. Also accepts the `title` slot. */
  title?: string;
  /** The event that triggers the tooltip to open. */
  trigger?: `${BTooltipTrigger}`;
  /** Placement of the tooltip relative to the target element. */
  placement?: `${BTooltipPlacement}`;
  /** Whether the tooltip has an arrow pointing to the target. */
  arrow?: boolean;
  /** Custom background color of the tooltip. */
  color?: string;
  /** Delay in ms before showing on mouseenter. */
  mouseEnterDelay?: number;
  /** Delay in ms before hiding on mouseleave. */
  mouseLeaveDelay?: number;
  /** Whether to destroy the tooltip DOM when hidden. */
  destroyTooltipOnHide?: boolean;
  /** z-index of the tooltip. */
  zIndex?: number;
  /** Force re-render when tooltip is shown. */
  fresh?: boolean;
  /** Whether to auto-adjust placement when tooltip overflows viewport. */
  autoAdjustOverflow?: boolean;
  /** Controlled visibility - bind with `v-model`. */
  modelValue?: boolean;
  /** Additional classes to apply to the toggle wrapper. */
  toggleClass?: string;
  /** Additional classes to apply to the tooltip content container. */
  tooltipClass?: string;
  /** Additional classes to apply to the tooltip inner element. */
  tooltipInnerClass?: string;
}>();

const emit = defineEmits<{
  /** Emitted when the tooltip visibility changes. */
  (e: 'openChange', open: boolean): void;
  /** v-model support. */
  (e: 'update:modelValue', value: boolean): void;
}>();

defineSlots<{
  /** The target element that triggers the tooltip. */
  default?(): unknown;
  /** Overrides the `title` prop. */
  title?(): unknown;
}>();

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const { componentUID } = useComponentId();
const tooltipId = useId();

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
  tooltipRef.value?.showPopover();
}

function doClose() {
  tooltipRef.value?.hidePopover();
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
const tooltipRef = ref<HTMLDivElement | null>(null);
const toggleRef = ref<HTMLDivElement | null>(null);

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
    toggleRef.value?.focus();
  }
}

// ─────────────────────────────────────────────
// Tooltip hover (keep tooltip open when hovering it)
// ─────────────────────────────────────────────
function onTooltipMouseEnter() {
  if (trigger === BTooltipTrigger.Hover) {
    clearTimers();
  }
}

function onTooltipMouseLeave() {
  if (trigger === BTooltipTrigger.Hover) {
    requestClose(mouseLeaveDelay);
  }
}

// ─────────────────────────────────────────────
// Event listener management
// ─────────────────────────────────────────────
function attachListeners() {
  const el = toggleRef.value;
  if (!el) return;

  // Keyboard always attached
  el.addEventListener('keydown', onKeydown);

  switch (trigger) {
    case BTooltipTrigger.Click:
      el.addEventListener('click', onClick);
      break;
    case BTooltipTrigger.Focus:
      el.addEventListener('focusin', onFocusIn);
      el.addEventListener('focusout', onFocusOut);
      break;
    case BTooltipTrigger.Hover:
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
      tooltipRef.value?.showPopover();
    } else {
      tooltipRef.value?.hidePopover();
    }
  },
);

// ─────────────────────────────────────────────
// Computed styles
// ─────────────────────────────────────────────
const anchorName = computed(() => `--b-tooltip-anchor-${componentUID.value}`);

const placementClass = computed(() => {
  const map: Record<string, string> = {
    [BTooltipPlacement.TopLeft]: 'top-left',
    [BTooltipPlacement.TopCenter]: 'top-center',
    [BTooltipPlacement.TopRight]: 'top-right',
    [BTooltipPlacement.RightTop]: 'right-top',
    [BTooltipPlacement.RightCenter]: 'right-center',
    [BTooltipPlacement.RightBottom]: 'right-bottom',
    [BTooltipPlacement.BottomRight]: 'bottom-right',
    [BTooltipPlacement.BottomCenter]: 'bottom-center',
    [BTooltipPlacement.BottomLeft]: 'bottom-left',
    [BTooltipPlacement.LeftBottom]: 'left-bottom',
    [BTooltipPlacement.LeftCenter]: 'left-center',
    [BTooltipPlacement.LeftTop]: 'left-top',
  };
  return map[placement] ?? 'top-center';
});

const customColorStyle = computed(() => {
  if (!color) return undefined;
  return {
    '--b-tooltip-bg': color,
    '--b-tooltip-arrow-color': color,
  } as Record<string, string>;
});

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────
defineExpose({ open: doOpen, close: doClose });
</script>

<template>
  <div
    ref="toggleRef"
    :class="['b-tooltip__toggle', toggleClass]"
    :style="{ anchorName: anchorName }"
    :aria-describedby="isOpen ? tooltipId : undefined"
  >
    <slot />
  </div>

  <div
    ref="tooltipRef"
    popover="manual"
    :class="[
      'b-tooltip__content',
      placementClass,
      { 'b-tooltip__content--no-arrow': !arrow },
      tooltipClass,
    ]"
    :style="[
      { zIndex, positionAnchor: anchorName },
      customColorStyle,
    ]"
    role="tooltip"
    :id="tooltipId"
    @toggle="onPopoverToggle"
    @mouseenter="onTooltipMouseEnter"
    @mouseleave="onTooltipMouseLeave"
  >
    <template v-if="shouldRender || !destroyTooltipOnHide">
      <div
        v-if="arrow"
        class="b-tooltip__arrow"
        aria-hidden="true"
      />
      <div
        :class="['b-tooltip__inner', tooltipInnerClass]"
      >
        <slot name="title">
          {{ title }}
        </slot>
      </div>
    </template>
  </div>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (tokens)
   ──────────────────────────────────────────── */
:root {
  --b-tooltip-bg: oklch(20% 0 0);
  --b-tooltip-color: #fff;
  --b-tooltip-font-size: 0.875rem;
  --b-tooltip-line-height: 1.5;
  --b-tooltip-padding-x: 0.5rem;
  --b-tooltip-padding-y: 0.375rem;
  --b-tooltip-border-radius: 0.375rem;
  --b-tooltip-max-width: 250px;
  --b-tooltip-arrow-size: 8px;
  --b-tooltip-arrow-color: oklch(20% 0 0);
  --b-tooltip-gap: 8px;
  --b-tooltip-transition-duration: 200ms;
  --b-tooltip-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
}

/* ── Dark mode ── */
[data-prefers-color='dark'] {
  --b-tooltip-bg: oklch(35% 0 0);
  --b-tooltip-arrow-color: oklch(35% 0 0);
  --b-tooltip-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.24),
    0 3px 6px -4px rgba(0, 0, 0, 0.36),
    0 9px 28px 8px rgba(0, 0, 0, 0.2);
}

/* ─────────────────────────────────────────────
   Toggle wrapper
   ───────────────────────────────────────────── */
.b-tooltip__toggle {
  display: inline-block;
}

/* ─────────────────────────────────────────────
   Tooltip content (popover)
   ───────────────────────────────────────────── */
.b-tooltip__content {
  /* Reset popover defaults */
  position: absolute;
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
  overflow: visible;
  max-width: var(--b-tooltip-max-width);
  box-sizing: border-box;
  pointer-events: auto;

  /* Animation and visibility */
  transition:
    display var(--b-tooltip-transition-duration),
    opacity var(--b-tooltip-transition-duration);
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
    margin-bottom: var(--b-tooltip-gap);
  }
  &.top-center {
    inset: auto;
    bottom: anchor(top);
    justify-self: anchor-center;
    margin-bottom: var(--b-tooltip-gap);
  }
  &.top-right {
    inset: auto;
    bottom: anchor(top);
    right: anchor(right);
    margin-bottom: var(--b-tooltip-gap);
  }

  /* ── Placement: Right ── */
  &.right-top {
    inset: auto;
    top: anchor(top);
    left: anchor(right);
    margin-left: var(--b-tooltip-gap);
  }
  &.right-center {
    inset: auto;
    align-self: anchor-center;
    left: anchor(right);
    margin-left: var(--b-tooltip-gap);
  }
  &.right-bottom {
    inset: auto;
    bottom: anchor(bottom);
    left: anchor(right);
    margin-left: var(--b-tooltip-gap);
  }

  /* ── Placement: Bottom ── */
  &.bottom-right {
    inset: auto;
    top: anchor(bottom);
    right: anchor(right);
    margin-top: var(--b-tooltip-gap);
  }
  &.bottom-center {
    inset: auto;
    top: anchor(bottom);
    justify-self: anchor-center;
    margin-top: var(--b-tooltip-gap);
  }
  &.bottom-left {
    inset: auto;
    top: anchor(bottom);
    left: anchor(left);
    margin-top: var(--b-tooltip-gap);
  }

  /* ── Placement: Left ── */
  &.left-bottom {
    inset: auto;
    bottom: anchor(bottom);
    right: anchor(left);
    margin-right: var(--b-tooltip-gap);
  }
  &.left-center {
    inset: auto;
    align-self: anchor-center;
    right: anchor(left);
    margin-right: var(--b-tooltip-gap);
  }
  &.left-top {
    inset: auto;
    top: anchor(top);
    right: anchor(left);
    margin-right: var(--b-tooltip-gap);
  }
}

/* ─────────────────────────────────────────────
   Inner content
   ───────────────────────────────────────────── */
.b-tooltip__inner {
  background: var(--b-tooltip-bg);
  color: var(--b-tooltip-color);
  font-size: var(--b-tooltip-font-size);
  line-height: var(--b-tooltip-line-height);
  padding: var(--b-tooltip-padding-y) var(--b-tooltip-padding-x);
  border-radius: var(--b-tooltip-border-radius);
  box-shadow: var(--b-tooltip-shadow);
  word-wrap: break-word;
}

/* ─────────────────────────────────────────────
   Arrow
   ───────────────────────────────────────────── */
.b-tooltip__arrow {
  position: absolute;
  width: var(--b-tooltip-arrow-size);
  height: var(--b-tooltip-arrow-size);
  background: var(--b-tooltip-arrow-color);
  transform: rotate(45deg);
  pointer-events: none;
}

/* Arrow positioning for top placements */
.b-tooltip__content.top-left .b-tooltip__arrow,
.b-tooltip__content.top-center .b-tooltip__arrow,
.b-tooltip__content.top-right .b-tooltip__arrow {
  bottom: calc(var(--b-tooltip-arrow-size) / -2);
  left: 50%;
  margin-left: calc(var(--b-tooltip-arrow-size) / -2);
}

/* Arrow positioning for bottom placements */
.b-tooltip__content.bottom-left .b-tooltip__arrow,
.b-tooltip__content.bottom-center .b-tooltip__arrow,
.b-tooltip__content.bottom-right .b-tooltip__arrow {
  top: calc(var(--b-tooltip-arrow-size) / -2);
  left: 50%;
  margin-left: calc(var(--b-tooltip-arrow-size) / -2);
}

/* Arrow positioning for right placements */
.b-tooltip__content.right-top .b-tooltip__arrow,
.b-tooltip__content.right-center .b-tooltip__arrow,
.b-tooltip__content.right-bottom .b-tooltip__arrow {
  left: calc(var(--b-tooltip-arrow-size) / -2);
  top: 50%;
  margin-top: calc(var(--b-tooltip-arrow-size) / -2);
}

/* Arrow positioning for left placements */
.b-tooltip__content.left-top .b-tooltip__arrow,
.b-tooltip__content.left-center .b-tooltip__arrow,
.b-tooltip__content.left-bottom .b-tooltip__arrow {
  right: calc(var(--b-tooltip-arrow-size) / -2);
  top: 50%;
  margin-top: calc(var(--b-tooltip-arrow-size) / -2);
}

/* ─────────────────────────────────────────────
   Position fallbacks (auto-adjust overflow)
   ───────────────────────────────────────────── */
@position-try --b-tooltip-top-center {
  inset: auto;
  bottom: anchor(top);
  justify-self: anchor-center;
  margin-bottom: var(--b-tooltip-gap);
}

@position-try --b-tooltip-bottom-center {
  inset: auto;
  top: anchor(bottom);
  justify-self: anchor-center;
  margin-top: var(--b-tooltip-gap);
}

@position-try --b-tooltip-right-center {
  inset: auto;
  align-self: anchor-center;
  left: anchor(right);
  margin-left: var(--b-tooltip-gap);
}

@position-try --b-tooltip-left-center {
  inset: auto;
  align-self: anchor-center;
  right: anchor(left);
  margin-right: var(--b-tooltip-gap);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-tooltip__content {
    transition-duration: 0ms;
  }
}
</style>
