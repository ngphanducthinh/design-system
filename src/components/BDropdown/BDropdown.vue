<script setup lang="ts">
import { useComponentId } from '@/composables/useComponentId.ts';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';

import type { BDropdownMenuItem, BDropdownMenuProps } from './types.ts';
import { BDropdownPlacement, BDropdownTrigger } from './types.ts';

const {
  trigger = BDropdownTrigger.Hover,
  placement = BDropdownPlacement.BottomLeft,
  arrow = false,
  disabled = false,
  destroyOnHidden = false,
  mouseEnterDelay = 100,
  mouseLeaveDelay = 100,
  menu,
  modelValue = undefined,
} = defineProps<{
  /** The trigger mode which executes the dropdown action. */
  trigger?: `${BDropdownTrigger}`;
  /** Placement of popup menu. */
  placement?: `${BDropdownPlacement}`;
  /** Whether to show the dropdown chevron indicator next to the trigger. */
  arrow?: boolean;
  /** Whether the dropdown menu is disabled. */
  disabled?: boolean;
  /** Whether to destroy popup on hide. */
  destroyOnHidden?: boolean;
  /** Delay in ms before showing on mouseenter (hover trigger only). */
  mouseEnterDelay?: number;
  /** Delay in ms before hiding on mouseleave (hover trigger only). */
  mouseLeaveDelay?: number;
  /** Menu configuration: items, selectable, multiple, selectedKeys. */
  menu?: BDropdownMenuProps;
  /** Controlled open state - bind with `v-model:open`. */
  modelValue?: boolean;
}>();

const emit = defineEmits<{
  /** Emitted when the dropdown visibility changes. */
  (e: 'openChange', open: boolean): void;
  /** v-model:open support. */
  (e: 'update:modelValue', value: boolean): void;
  /** Emitted when a menu item is clicked. */
  (e: 'menuClick', info: { key: string | number; item: BDropdownMenuItem }): void;
}>();

defineSlots<{
  /** The trigger element. Receives `triggerProps` to bind ARIA attributes. */
  default?(props: { triggerProps: Record<string, unknown> }): unknown;
  /** Custom overlay content (replaces default menu rendering). */
  overlay?(): unknown;
}>();

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const { componentUID } = useComponentId();
const dropdownId = useId();
const menuId = `${dropdownId}-menu`;

const internalOpen = ref(false);
const isOpen = computed(() => (modelValue !== undefined ? modelValue : internalOpen.value));

const shouldRender = computed(() => {
  if (destroyOnHidden) return isOpen.value;
  return true;
});

// ─────────────────────────────────────────────
// Visibility control
// ─────────────────────────────────────────────
let showTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
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
const focusedIndex = ref(-1);

const focusableSelector = '[role="menuitem"]:not([aria-disabled="true"])';

function getFocusableItems(): HTMLElement[] {
  if (!popoverRef.value) return [];
  return Array.from(popoverRef.value.querySelectorAll<HTMLElement>(focusableSelector));
}

function focusItem(index: number) {
  const items = getFocusableItems();
  if (items.length === 0) return;
  const clamped = Math.max(0, Math.min(index, items.length - 1));
  focusedIndex.value = clamped;
  items[clamped]?.focus();
}

function focusFirst() {
  nextTick(() => focusItem(0));
}

function focusLast() {
  nextTick(() => {
    const items = getFocusableItems();
    focusItem(items.length - 1);
  });
}

watch(isOpen, (val) => {
  if (val) {
    previouslyFocusedElement = document.activeElement as HTMLElement | null;
    focusFirst();
  } else {
    focusedIndex.value = -1;
    if (previouslyFocusedElement) {
      nextTick(() => previouslyFocusedElement?.focus());
    }
  }
});

// ─────────────────────────────────────────────
// Menu item click
// ─────────────────────────────────────────────
function onItemClick(item: BDropdownMenuItem) {
  if (item.disabled) return;
  emit('menuClick', { key: item.key, item });
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

function onContextMenu(event: MouseEvent) {
  if (disabled) return;
  event.preventDefault();
  if (isOpen.value) {
    requestClose();
  } else {
    requestOpen();
  }
}

function onMouseEnter() {
  if (disabled) return;
  requestOpen(mouseEnterDelay);
}

function onMouseLeave() {
  requestClose(mouseLeaveDelay);
}

function onTriggerKeydown(event: KeyboardEvent) {
  if (disabled) return;

  switch (event.key) {
    case 'Enter':
    case ' ':
    case 'ArrowDown':
      event.preventDefault();
      if (!isOpen.value) {
        requestOpen();
        nextTick(() => focusFirst());
      } else {
        focusFirst();
      }
      break;
    case 'ArrowUp':
      event.preventDefault();
      if (!isOpen.value) {
        requestOpen();
        nextTick(() => focusLast());
      } else {
        focusLast();
      }
      break;
    case 'Escape':
      if (isOpen.value) {
        event.preventDefault();
        requestClose();
      }
      break;
  }
}

function onMenuKeydown(event: KeyboardEvent) {
  const items = getFocusableItems();
  const currentIndex = items.indexOf(document.activeElement as HTMLElement);

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      focusItem(currentIndex < items.length - 1 ? currentIndex + 1 : 0);
      break;
    case 'ArrowUp':
      event.preventDefault();
      focusItem(currentIndex > 0 ? currentIndex - 1 : items.length - 1);
      break;
    case 'Home':
      event.preventDefault();
      focusItem(0);
      break;
    case 'End':
      event.preventDefault();
      focusItem(items.length - 1);
      break;
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (document.activeElement) {
        (document.activeElement as HTMLElement).click();
      }
      break;
    case 'Escape':
      event.preventDefault();
      requestClose();
      break;
    case 'Tab':
      requestClose();
      break;
  }
}

// ─────────────────────────────────────────────
// Popover hover (keep open when hovering content)
// ─────────────────────────────────────────────
function onPopoverMouseEnter() {
  if (trigger === BDropdownTrigger.Hover) {
    clearTimers();
  }
}

function onPopoverMouseLeave() {
  if (trigger === BDropdownTrigger.Hover) {
    requestClose(mouseLeaveDelay);
  }
}

// ─────────────────────────────────────────────
// Click outside handler
// ─────────────────────────────────────────────
function onDocumentClick(event: MouseEvent) {
  if (!isOpen.value) return;
  const target = event.target as Node;
  if (toggleRef.value?.contains(target)) return;
  if (popoverRef.value?.contains(target)) return;
  requestClose();
}

// ─────────────────────────────────────────────
// Event listener management
// ─────────────────────────────────────────────
function attachListeners() {
  const el = toggleRef.value;
  if (!el) return;

  el.addEventListener('keydown', onTriggerKeydown);

  switch (trigger) {
    case BDropdownTrigger.Click:
      el.addEventListener('click', onClick);
      break;
    case BDropdownTrigger.ContextMenu:
      el.addEventListener('contextmenu', onContextMenu);
      break;
    case BDropdownTrigger.Hover:
    default:
      el.addEventListener('mouseenter', onMouseEnter);
      el.addEventListener('mouseleave', onMouseLeave);
      break;
  }
}

function detachListeners() {
  const el = toggleRef.value;
  if (!el) return;

  el.removeEventListener('keydown', onTriggerKeydown);
  el.removeEventListener('click', onClick);
  el.removeEventListener('contextmenu', onContextMenu);
  el.removeEventListener('mouseenter', onMouseEnter);
  el.removeEventListener('mouseleave', onMouseLeave);
}

onMounted(() => {
  attachListeners();
});

onBeforeUnmount(() => {
  detachListeners();
  document.removeEventListener('click', onDocumentClick, true);
  clearTimers();
});

watch(isOpen, (val) => {
  if (val) {
    document.addEventListener('click', onDocumentClick, true);
  } else {
    document.removeEventListener('click', onDocumentClick, true);
  }
});

watch(
  () => trigger,
  () => {
    detachListeners();
    attachListeners();
  },
);

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
const anchorName = computed(() => `--b-dropdown-anchor-${componentUID.value}`);

const placementClass = computed(() => {
  const map: Record<string, string> = {
    [BDropdownPlacement.Bottom]: 'bottom-center',
    [BDropdownPlacement.BottomLeft]: 'bottom-left',
    [BDropdownPlacement.BottomRight]: 'bottom-right',
    [BDropdownPlacement.Top]: 'top-center',
    [BDropdownPlacement.TopLeft]: 'top-left',
    [BDropdownPlacement.TopRight]: 'top-right',
  };
  return map[placement] ?? 'bottom-left';
});

const menuItems = computed(() => menu?.items ?? []);

const triggerProps = computed(() => ({
  id: dropdownId,
  'aria-haspopup': 'menu' as const,
  'aria-expanded': isOpen.value,
  'aria-disabled': disabled || undefined,
}));

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────
defineExpose({ open: doOpen, close: doClose });
</script>

<template>
  <div
    ref="toggleRef"
    :class="['b-dropdown__toggle', { 'b-dropdown__toggle--open': isOpen }]"
    :style="{ anchorName: anchorName }"
  >
    <slot :trigger-props="triggerProps" />
    <span v-if="arrow" class="b-dropdown__indicator" aria-hidden="true" />
  </div>

  <div
    ref="popoverRef"
    popover="manual"
    :class="['b-dropdown', placementClass]"
    :style="{ positionAnchor: anchorName }"
    :id="menuId"
    role="menu"
    :aria-labelledby="dropdownId"
    tabindex="-1"
    @toggle="onPopoverToggle"
    @keydown="onMenuKeydown"
    @mouseenter="onPopoverMouseEnter"
    @mouseleave="onPopoverMouseLeave"
  >
    <template v-if="shouldRender">
      <div class="b-dropdown__content">
        <slot name="overlay">
          <template v-for="item in menuItems" :key="item.key">
            <div v-if="item.type === 'divider'" class="b-dropdown__divider" role="separator" />
            <div
              v-else-if="item.type === 'group'"
              class="b-dropdown__group"
              role="group"
              :aria-label="item.title"
            >
              <div class="b-dropdown__group-title">{{ item.title }}</div>
              <div
                v-for="child in item.children"
                :key="child.key"
                :class="[
                  'b-dropdown__item',
                  { 'b-dropdown__item--disabled': child.disabled },
                  { 'b-dropdown__item--danger': child.danger },
                  { 'b-dropdown__item--selected': menu?.selectedKeys?.includes(child.key) },
                ]"
                role="menuitem"
                :tabindex="child.disabled ? -1 : 0"
                :aria-disabled="child.disabled || undefined"
                @click="onItemClick(child)"
              >
                <span v-if="child.icon" class="b-dropdown__item-icon" aria-hidden="true">{{
                  child.icon
                }}</span>
                <span class="b-dropdown__item-label">{{ child.label }}</span>
              </div>
            </div>
            <div
              v-else
              :class="[
                'b-dropdown__item',
                { 'b-dropdown__item--disabled': item.disabled },
                { 'b-dropdown__item--danger': item.danger },
                { 'b-dropdown__item--selected': menu?.selectedKeys?.includes(item.key) },
              ]"
              role="menuitem"
              :tabindex="item.disabled ? -1 : 0"
              :aria-disabled="item.disabled || undefined"
              @click="onItemClick(item)"
            >
              <span v-if="item.icon" class="b-dropdown__item-icon" aria-hidden="true">{{
                item.icon
              }}</span>
              <span class="b-dropdown__item-label">{{ item.label }}</span>
            </div>
          </template>
        </slot>
      </div>
    </template>
  </div>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (tokens)
   ──────────────────────────────────────────── */
.b-dropdown {
  --b-dropdown-z-index: 1050;
  --b-dropdown-bg: #fff;
  --b-dropdown-color: rgba(0, 0, 0, 0.88);
  --b-dropdown-border-radius: 8px;
  --b-dropdown-padding-block: 4px;
  --b-dropdown-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  --b-dropdown-font-size: 14px;
  --b-dropdown-line-height: 1.5714;
  --b-dropdown-min-width: 120px;
  --b-dropdown-max-width: 320px;
  --b-dropdown-gap: 4px;
  --b-dropdown-transition-duration: 200ms;

  --b-dropdown-item-padding-x: 12px;
  --b-dropdown-item-padding-y: 5px;
  --b-dropdown-item-border-radius: 4px;
  --b-dropdown-item-color: rgba(0, 0, 0, 0.88);
  --b-dropdown-item-hover-bg: rgba(0, 0, 0, 0.04);
  --b-dropdown-item-active-bg: rgba(0, 0, 0, 0.06);
  --b-dropdown-item-disabled-color: rgba(0, 0, 0, 0.25);
  --b-dropdown-item-danger-color: #ff4d4f;
  --b-dropdown-item-danger-hover-bg: #fff2f0;
  --b-dropdown-item-selected-bg: #e6f4ff;
  --b-dropdown-item-selected-color: #1677ff;
  --b-dropdown-item-icon-margin-right: 8px;
  --b-dropdown-item-icon-size: 14px;

  --b-dropdown-divider-color: rgba(5, 5, 5, 0.06);
  --b-dropdown-divider-margin: 4px 0;

  --b-dropdown-group-title-color: rgba(0, 0, 0, 0.45);
  --b-dropdown-group-title-font-size: 12px;
  --b-dropdown-group-title-padding: 5px 12px;
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-dropdown {
  --b-dropdown-bg: #1f1f1f;
  --b-dropdown-color: rgba(255, 255, 255, 0.85);
  --b-dropdown-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.24), 0 3px 6px -4px rgba(0, 0, 0, 0.36),
    0 9px 28px 8px rgba(0, 0, 0, 0.2);
  --b-dropdown-item-color: rgba(255, 255, 255, 0.85);
  --b-dropdown-item-hover-bg: rgba(255, 255, 255, 0.08);
  --b-dropdown-item-active-bg: rgba(255, 255, 255, 0.12);
  --b-dropdown-item-disabled-color: rgba(255, 255, 255, 0.25);
  --b-dropdown-item-danger-color: #ff7875;
  --b-dropdown-item-danger-hover-bg: rgba(255, 77, 79, 0.12);
  --b-dropdown-item-selected-bg: rgba(22, 119, 255, 0.15);
  --b-dropdown-item-selected-color: #4096ff;
  --b-dropdown-divider-color: rgba(253, 253, 253, 0.12);
  --b-dropdown-group-title-color: rgba(255, 255, 255, 0.45);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-dropdown {
    --b-dropdown-bg: #1f1f1f;
    --b-dropdown-color: rgba(255, 255, 255, 0.85);
    --b-dropdown-shadow:
      0 6px 16px 0 rgba(0, 0, 0, 0.24), 0 3px 6px -4px rgba(0, 0, 0, 0.36),
      0 9px 28px 8px rgba(0, 0, 0, 0.2);
    --b-dropdown-item-color: rgba(255, 255, 255, 0.85);
    --b-dropdown-item-hover-bg: rgba(255, 255, 255, 0.08);
    --b-dropdown-item-active-bg: rgba(255, 255, 255, 0.12);
    --b-dropdown-item-disabled-color: rgba(255, 255, 255, 0.25);
    --b-dropdown-item-danger-color: #ff7875;
    --b-dropdown-item-danger-hover-bg: rgba(255, 77, 79, 0.12);
    --b-dropdown-item-selected-bg: rgba(22, 119, 255, 0.15);
    --b-dropdown-item-selected-color: #4096ff;
    --b-dropdown-divider-color: rgba(253, 253, 253, 0.12);
    --b-dropdown-group-title-color: rgba(255, 255, 255, 0.45);
  }
}

/* ─────────────────────────────────────────────
   Toggle wrapper
   ───────────────────────────────────────────── */
.b-dropdown__toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;

  &[aria-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

/* ─────────────────────────────────────────────
   Chevron indicator (CSS-only)
   ───────────────────────────────────────────── */
.b-dropdown__indicator {
  display: inline-block;
  width: 0.625em;
  height: 0.625em;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: rotate(45deg) translateY(-2px);
  transition: transform 200ms;
  opacity: 0.65;
  flex-shrink: 0;
}

.b-dropdown__toggle--open .b-dropdown__indicator {
  transform: rotate(-135deg) translateY(-1px);
}

/* ─────────────────────────────────────────────
   Dropdown popover
   ───────────────────────────────────────────── */
.b-dropdown {
  position: absolute;
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
  overflow: visible;
  z-index: var(--b-dropdown-z-index);
  min-width: var(--b-dropdown-min-width);
  max-width: var(--b-dropdown-max-width);
  box-sizing: border-box;
  pointer-events: auto;

  transition:
    display var(--b-dropdown-transition-duration),
    opacity var(--b-dropdown-transition-duration);
  transition-behavior: allow-discrete;
  opacity: 0;

  &:popover-open {
    opacity: 1;

    @starting-style {
      opacity: 0;
    }
  }

  /* ── Placement: Bottom ── */
  &.bottom-left {
    inset: auto;
    top: anchor(bottom);
    left: anchor(left);
    margin-top: var(--b-dropdown-gap);
  }
  &.bottom-center {
    inset: auto;
    top: anchor(bottom);
    justify-self: anchor-center;
    margin-top: var(--b-dropdown-gap);
  }
  &.bottom-right {
    inset: auto;
    top: anchor(bottom);
    right: anchor(right);
    margin-top: var(--b-dropdown-gap);
  }

  /* ── Placement: Top ── */
  &.top-left {
    inset: auto;
    bottom: anchor(top);
    left: anchor(left);
    margin-bottom: var(--b-dropdown-gap);
  }
  &.top-center {
    inset: auto;
    bottom: anchor(top);
    justify-self: anchor-center;
    margin-bottom: var(--b-dropdown-gap);
  }
  &.top-right {
    inset: auto;
    bottom: anchor(top);
    right: anchor(right);
    margin-bottom: var(--b-dropdown-gap);
  }
}

/* ─────────────────────────────────────────────
   Content wrapper
   ───────────────────────────────────────────── */
.b-dropdown__content {
  background: var(--b-dropdown-bg);
  color: var(--b-dropdown-color);
  font-size: var(--b-dropdown-font-size);
  line-height: var(--b-dropdown-line-height);
  padding: var(--b-dropdown-padding-block) 0;
  border-radius: var(--b-dropdown-border-radius);
  box-shadow: var(--b-dropdown-shadow);
  overflow: hidden auto;
  max-height: 60vh;
}

/* ─────────────────────────────────────────────
   Menu items
   ───────────────────────────────────────────── */
.b-dropdown__item {
  display: flex;
  align-items: center;
  padding: var(--b-dropdown-item-padding-y) var(--b-dropdown-item-padding-x);
  margin: 0 4px;
  border-radius: var(--b-dropdown-item-border-radius);
  color: var(--b-dropdown-item-color);
  cursor: pointer;
  user-select: none;
  outline: none;
  transition: background-color 150ms;

  &:hover,
  &:focus-visible {
    background: var(--b-dropdown-item-hover-bg);
  }

  &:active {
    background: var(--b-dropdown-item-active-bg);
  }

  &--disabled {
    color: var(--b-dropdown-item-disabled-color);
    cursor: not-allowed;
    pointer-events: none;
  }

  &--danger {
    color: var(--b-dropdown-item-danger-color);

    &:hover,
    &:focus-visible {
      background: var(--b-dropdown-item-danger-hover-bg);
    }
  }

  &--selected {
    background: var(--b-dropdown-item-selected-bg);
    color: var(--b-dropdown-item-selected-color);
  }
}

.b-dropdown__item-icon {
  margin-right: var(--b-dropdown-item-icon-margin-right);
  font-size: var(--b-dropdown-item-icon-size);
  display: inline-flex;
  align-items: center;
}

.b-dropdown__item-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ─────────────────────────────────────────────
   Divider
   ───────────────────────────────────────────── */
.b-dropdown__divider {
  height: 1px;
  margin: var(--b-dropdown-divider-margin);
  background: var(--b-dropdown-divider-color);
}

/* ─────────────────────────────────────────────
   Group
   ───────────────────────────────────────────── */
.b-dropdown__group-title {
  padding: var(--b-dropdown-group-title-padding);
  color: var(--b-dropdown-group-title-color);
  font-size: var(--b-dropdown-group-title-font-size);
  font-weight: 500;
}

/* ─────────────────────────────────────────────
   Position fallbacks
   ───────────────────────────────────────────── */
@position-try --b-dropdown-bottom {
  inset: auto;
  top: anchor(bottom);
  left: anchor(left);
  margin-top: var(--b-dropdown-gap);
}

@position-try --b-dropdown-top {
  inset: auto;
  bottom: anchor(top);
  left: anchor(left);
  margin-bottom: var(--b-dropdown-gap);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-dropdown {
    transition-duration: 0ms;
  }

  .b-dropdown__item {
    transition-duration: 0ms;
  }
}
</style>
