<script setup lang="ts">
import { computed, inject, onBeforeUnmount, provide, ref } from 'vue';
import BMenuDivider from './BMenuDivider.vue';
import BMenuItem from './BMenuItem.vue';
import BMenuItemGroup from './BMenuItemGroup.vue';
import {
  BMenuContextKey,
  BMenuSubMenuContextKey,
  isDivider,
  isItemGroup,
  isSubMenu,
  type BMenuContext,
  type BMenuItemUnion,
  type BMenuSubMenuContext,
} from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    /** Unique key identifying this submenu. */
    itemKey: string;
    /** Display label of the submenu title. */
    label?: string;
    /** Icon name rendered before the label. */
    icon?: string;
    /** Whether the submenu is disabled. @default false */
    disabled?: boolean;
    /** Child menu items. */
    children?: BMenuItemUnion[];
    /** Extra class for popup container. */
    popupClassName?: string;
  }>(),
  {
    label: '',
    icon: undefined,
    disabled: false,
    children: () => [],
    popupClassName: '',
  },
);

defineSlots<{
  default?(): unknown;
  icon?(): unknown;
  title?(): unknown;
}>();

// ─────────────────────────────────────────────
// Inject context
// ─────────────────────────────────────────────
const menu = inject<BMenuContext>(BMenuContextKey)!;
const parentSubMenu = inject<BMenuSubMenuContext | null>(BMenuSubMenuContextKey, null);

const level = computed(() => (parentSubMenu?.level ?? 0) + 1);
const keyPath = computed(() => [...(parentSubMenu?.keyPath ?? []), props.itemKey]);

// Provide context for children
provide<BMenuSubMenuContext>(BMenuSubMenuContextKey, {
  level: level.value,
  keyPath: keyPath.value,
});

// ─────────────────────────────────────────────
// Open state
// ─────────────────────────────────────────────
const isOpen = computed(() => menu.openKeys.value.includes(props.itemKey));

const hasSelectedChild = computed(() => {
  function checkChildren(items: BMenuItemUnion[]): boolean {
    for (const item of items) {
      if ('key' in item && menu.selectedKeys.value.includes(item.key!)) return true;
      if (isSubMenu(item) && item.children) {
        if (checkChildren(item.children)) return true;
      }
      if (isItemGroup(item) && item.children) {
        if (checkChildren(item.children)) return true;
      }
    }
    return false;
  }
  return checkChildren(props.children);
});

// ─────────────────────────────────────────────
// Inline indentation
// ─────────────────────────────────────────────
const paddingLeft = computed(() => {
  if (menu.mode.value !== 'inline') return undefined;
  if (menu.inlineCollapsed.value) return undefined;
  return `${level.value * menu.inlineIndent.value}px`;
});

// ─────────────────────────────────────────────
// Popup positioning (vertical / horizontal)
// ─────────────────────────────────────────────
const isPopupMode = computed(() => menu.mode.value !== 'inline' || menu.inlineCollapsed.value);

const titleRef = ref<HTMLElement | null>(null);
const popupRef = ref<HTMLElement | null>(null);

let openTimer: ReturnType<typeof setTimeout> | null = null;
let closeTimer: ReturnType<typeof setTimeout> | null = null;

function clearTimers() {
  if (openTimer) {
    clearTimeout(openTimer);
    openTimer = null;
  }
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
}

// ─────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────
function toggleOpen() {
  if (props.disabled) return;
  menu.onOpenChange(props.itemKey, !isOpen.value);
}

function handleTitleClick() {
  if (props.disabled) return;
  if (!isPopupMode.value) {
    toggleOpen();
  } else if (menu.triggerSubMenuAction.value === 'click') {
    toggleOpen();
  }
}

function handleTitleKeydown(e: KeyboardEvent) {
  if (props.disabled) return;

  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault();
      toggleOpen();
      break;
    case 'ArrowRight':
      if (menu.mode.value !== 'inline' && !isOpen.value) {
        e.preventDefault();
        menu.onOpenChange(props.itemKey, true);
      }
      break;
    case 'ArrowLeft':
      if (menu.mode.value !== 'inline' && isOpen.value) {
        e.preventDefault();
        menu.onOpenChange(props.itemKey, false);
      }
      break;
    case 'Escape':
      if (isOpen.value) {
        e.preventDefault();
        menu.onOpenChange(props.itemKey, false);
        titleRef.value?.focus();
      }
      break;
  }
}

function handleMouseEnter() {
  if (props.disabled || !isPopupMode.value) return;
  if (menu.triggerSubMenuAction.value !== 'hover') return;

  clearTimers();
  const delay = menu.subMenuOpenDelay.value;
  if (delay > 0) {
    openTimer = setTimeout(() => menu.onOpenChange(props.itemKey, true), delay);
  } else {
    menu.onOpenChange(props.itemKey, true);
  }
}

function handleMouseLeave() {
  if (props.disabled || !isPopupMode.value) return;
  if (menu.triggerSubMenuAction.value !== 'hover') return;

  clearTimers();
  const delay = menu.subMenuCloseDelay.value;
  if (delay > 0) {
    closeTimer = setTimeout(() => menu.onOpenChange(props.itemKey, false), delay);
  } else {
    menu.onOpenChange(props.itemKey, false);
  }
}

onBeforeUnmount(() => {
  clearTimers();
});

// ─────────────────────────────────────────────
// Classes
// ─────────────────────────────────────────────
const titleClasses = computed(() => [
  'b-menu-submenu__title',
  {
    'b-menu-submenu__title--open': isOpen.value,
    'b-menu-submenu__title--disabled': props.disabled,
    'b-menu-submenu__title--selected': hasSelectedChild.value,
    'b-menu-submenu__title--horizontal': menu.mode.value === 'horizontal',
  },
]);

const submenuClasses = computed(() => [
  'b-menu-submenu',
  {
    'b-menu-submenu--open': isOpen.value,
    'b-menu-submenu--disabled': props.disabled,
    'b-menu-submenu--horizontal': menu.mode.value === 'horizontal',
    'b-menu-submenu--collapsed': menu.inlineCollapsed.value,
    'b-menu-submenu--popup': isPopupMode.value,
  },
]);

const popupClasses = computed(() => [
  'b-menu-submenu__popup',
  props.popupClassName,
  {
    'b-menu-submenu__popup--visible': isOpen.value,
    'b-menu-submenu__popup--horizontal': menu.mode.value === 'horizontal',
    'b-menu-submenu__popup--vertical': menu.mode.value === 'vertical' || menu.inlineCollapsed.value,
  },
]);

const inlineContentClasses = computed(() => [
  'b-menu-submenu__inline',
  {
    'b-menu-submenu__inline--open': isOpen.value,
  },
]);
</script>

<template>
  <li
    :class="submenuClasses"
    :data-menu-key="props.itemKey"
    role="none"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Title -->
    <div
      ref="titleRef"
      :class="titleClasses"
      :style="{ paddingInlineStart: paddingLeft }"
      role="menuitem"
      :tabindex="props.disabled ? -1 : 0"
      :aria-haspopup="true"
      :aria-expanded="isOpen"
      :aria-disabled="props.disabled || undefined"
      @click="handleTitleClick"
      @keydown="handleTitleKeydown"
    >
      <span v-if="props.icon || $slots.icon" class="b-menu-submenu__icon" aria-hidden="true">
        <slot name="icon">{{ props.icon }}</slot>
      </span>
      <span v-if="!menu.inlineCollapsed.value" class="b-menu-submenu__label">
        <slot name="title">{{ props.label }}</slot>
      </span>
      <span v-if="!menu.inlineCollapsed.value" class="b-menu-submenu__arrow" aria-hidden="true" />
    </div>

    <!-- Inline content (inline mode) -->
    <div v-if="!isPopupMode" :class="inlineContentClasses" role="none">
      <ul class="b-menu-submenu__inline-list" role="menu">
        <slot>
          <template v-for="item in props.children" :key="item.key ?? (item as any).type">
            <BMenuDivider v-if="isDivider(item)" :dashed="item.dashed" />
            <BMenuItemGroup
              v-else-if="isItemGroup(item)"
              :label="item.label"
              :children="item.children"
            />
            <BMenuSubMenu
              v-else-if="isSubMenu(item)"
              :item-key="item.key"
              :label="item.label"
              :icon="item.icon"
              :disabled="item.disabled"
              :children="item.children"
              :popup-class-name="item.popupClassName"
            />
            <BMenuItem
              v-else
              :item-key="item.key"
              :label="item.label"
              :icon="item.icon"
              :disabled="item.disabled"
              :danger="(item as any).danger"
              :extra="(item as any).extra"
            />
          </template>
        </slot>
      </ul>
    </div>

    <!-- Popup content (vertical / horizontal / collapsed) -->
    <div v-if="isPopupMode" ref="popupRef" :class="popupClasses" role="none">
      <ul class="b-menu-submenu__popup-inner" role="menu">
        <slot>
          <template v-for="item in props.children" :key="item.key ?? (item as any).type">
            <BMenuDivider v-if="isDivider(item)" :dashed="item.dashed" />
            <BMenuItemGroup
              v-else-if="isItemGroup(item)"
              :label="item.label"
              :children="item.children"
            />
            <BMenuSubMenu
              v-else-if="isSubMenu(item)"
              :item-key="item.key"
              :label="item.label"
              :icon="item.icon"
              :disabled="item.disabled"
              :children="item.children"
              :popup-class-name="item.popupClassName"
            />
            <BMenuItem
              v-else
              :item-key="item.key"
              :label="item.label"
              :icon="item.icon"
              :disabled="item.disabled"
              :danger="(item as any).danger"
              :extra="(item as any).extra"
            />
          </template>
        </slot>
      </ul>
    </div>
  </li>
</template>

<style>
/* ─────────────────────────────────────────────
   BMenuSubMenu
   ───────────────────────────────────────────── */
.b-menu-submenu {
  list-style: none;
  position: relative;
}

.b-menu-submenu--horizontal {
  display: inline-flex;
  flex-direction: column;
  position: relative;
}

/* ── Title ── */
.b-menu-submenu__title {
  display: flex;
  align-items: center;
  height: var(--b-menu-item-height);
  margin-block: var(--b-menu-item-margin-block);
  margin-inline: var(--b-menu-item-margin-inline);
  padding-inline: var(--b-menu-item-padding-inline);
  border-radius: var(--b-menu-item-border-radius);
  color: var(--b-menu-item-color);
  cursor: pointer;
  user-select: none;
  outline: none;
  position: relative;
  transition:
    background var(--b-menu-transition-duration),
    color var(--b-menu-transition-duration),
    padding var(--b-menu-transition-duration);
  box-sizing: border-box;
}

.b-menu-submenu__title:hover:not(.b-menu-submenu__title--disabled) {
  background: var(--b-menu-item-hover-bg);
  color: var(--b-menu-item-hover-color);
}

.b-menu-submenu__title:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: -2px;
}

.b-menu-submenu__title--selected {
  color: var(--b-menu-sub-menu-item-selected-color);
}

.b-menu-submenu__title--disabled {
  color: var(--b-menu-item-disabled-color);
  cursor: not-allowed;
}

/* ── Horizontal title ── */
.b-menu-submenu__title--horizontal {
  margin-block: 0;
  border-radius: var(--b-menu-horizontal-item-border-radius);
  height: auto;
  line-height: var(--b-menu-horizontal-line-height);
}

.b-menu-submenu__title--horizontal::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: var(--b-menu-item-padding-inline);
  right: var(--b-menu-item-padding-inline);
  height: var(--b-menu-active-bar-height);
  background: transparent;
  transition: background var(--b-menu-transition-duration);
}

.b-menu-submenu__title--horizontal:hover:not(.b-menu-submenu__title--disabled) {
  background: var(--b-menu-horizontal-item-hover-bg);
  color: var(--b-menu-horizontal-item-hover-color);
}

.b-menu-submenu__title--horizontal.b-menu-submenu__title--selected {
  color: var(--b-menu-horizontal-item-selected-color);
}

.b-menu-submenu__title--horizontal.b-menu-submenu__title--selected::after {
  background: var(--b-menu-horizontal-item-selected-color);
}

/* ── Icon & Label ── */
.b-menu-submenu__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: var(--b-menu-icon-size);
  margin-inline-end: var(--b-menu-icon-margin-inline-end);
}

.b-menu-submenu__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Expand arrow (CSS-only) ── */
.b-menu-submenu__arrow {
  display: inline-block;
  width: 0;
  height: 0;
  margin-inline-start: auto;
  padding-inline-start: 8px;
  position: relative;
}

.b-menu-submenu__arrow::before,
.b-menu-submenu__arrow::after {
  content: '';
  position: absolute;
  width: 6px;
  height: 1.5px;
  background: currentColor;
  border-radius: 1px;
  transition: transform var(--b-menu-transition-duration);
  top: 50%;
}

.b-menu-submenu__arrow::before {
  transform: rotate(-45deg) translateX(2px);
}

.b-menu-submenu__arrow::after {
  transform: rotate(45deg) translateX(-2px);
}

.b-menu-submenu__title--open .b-menu-submenu__arrow::before {
  transform: rotate(45deg) translateX(2px);
}

.b-menu-submenu__title--open .b-menu-submenu__arrow::after {
  transform: rotate(-45deg) translateX(-2px);
}

/* Collapsed submenu hides arrow */
.b-menu-submenu--collapsed .b-menu-submenu__title {
  justify-content: center;
  padding-inline: 0;
}

.b-menu-submenu--collapsed .b-menu-submenu__icon {
  font-size: var(--b-menu-collapsed-icon-size);
  margin-inline-end: 0;
}

/* ─────────────────────────────────────────────
   Inline content (expand/collapse via grid)
   ───────────────────────────────────────────── */
.b-menu-submenu__inline {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows var(--b-menu-transition-duration) ease;
  overflow: hidden;
}

.b-menu-submenu__inline--open {
  grid-template-rows: 1fr;
}

.b-menu-submenu__inline-list {
  min-height: 0;
  overflow: hidden;
  list-style: none;
  padding: 0;
  margin: 0;
  background: var(--b-menu-sub-menu-item-bg);
}

/* ─────────────────────────────────────────────
   Popup content (fly-out)
   ───────────────────────────────────────────── */
.b-menu-submenu__popup {
  position: absolute;
  z-index: var(--b-menu-popup-z-index);
  min-width: var(--b-menu-dropdown-width);
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity var(--b-menu-transition-duration),
    visibility var(--b-menu-transition-duration);
}

.b-menu-submenu__popup--visible {
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
}

.b-menu-submenu__popup--horizontal {
  top: 100%;
  left: 0;
  padding-top: 4px;
}

.b-menu-submenu__popup--vertical {
  top: 0;
  left: 100%;
  padding-inline-start: 4px;
}

.b-menu-submenu__popup-inner {
  background: var(--b-menu-popup-bg);
  border-radius: var(--b-menu-popup-border-radius);
  box-shadow: var(--b-menu-popup-shadow);
  padding: 4px;
  list-style: none;
  margin: 0;
}

.b-menu-submenu__popup-inner .b-menu-item {
  border-radius: var(--b-menu-sub-menu-item-border-radius);
  margin-inline: 0;
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-menu-submenu__title {
    transition: none;
  }

  .b-menu-submenu__arrow::before,
  .b-menu-submenu__arrow::after {
    transition: none;
  }

  .b-menu-submenu__inline {
    transition: none;
  }

  .b-menu-submenu__popup {
    transition: none;
  }

  .b-menu-submenu__title--horizontal::after {
    transition: none;
  }
}
</style>
