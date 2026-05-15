<script setup lang="ts">
import { computed, inject, onMounted } from 'vue';
import {
  BMenuContextKey,
  BMenuSubMenuContextKey,
  type BMenuClickInfo,
  type BMenuContext,
  type BMenuSubMenuContext,
} from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  itemKey,
  label = '',
  icon = undefined,
  disabled = false,
  danger = false,
  extra = undefined,
  title = undefined,
} = defineProps<{
  /** Unique key identifying this menu item. */
  itemKey: string;
  /** Display label text. */
  label?: string;
  /** Icon name rendered before the label. */
  icon?: string;
  /** Whether the item is disabled. @default false */
  disabled?: boolean;
  /** Display with danger (red) styling. @default false */
  danger?: boolean;
  /** Extra content at the right side. */
  extra?: string;
  /** Tooltip title when collapsed. */
  title?: string;
}>();

defineSlots<{
  default?(): unknown;
  icon?(): unknown;
  extra?(): unknown;
}>();

// ─────────────────────────────────────────────
// Inject context
// ─────────────────────────────────────────────
const menu = inject<BMenuContext>(BMenuContextKey)!;
const subMenuCtx = inject<BMenuSubMenuContext | null>(BMenuSubMenuContextKey, null);

const level = computed(() => (subMenuCtx?.level ?? 0) + 1);
const keyPath = computed(() => [...(subMenuCtx?.keyPath ?? []), itemKey]);

// Register key path with root menu
onMounted(() => {
  menu.registerKeyPath(itemKey, keyPath.value);
});

// ─────────────────────────────────────────────
// Computed
// ─────────────────────────────────────────────
const isSelected = computed(() => menu.selectedKeys.value.includes(itemKey));

const itemRole = computed(() => {
  if (!menu.selectable.value) return 'menuitem';
  return menu.multiple.value ? 'menuitemcheckbox' : 'menuitemradio';
});

const paddingLeft = computed(() => {
  if (menu.mode.value !== 'inline') return undefined;
  if (menu.inlineCollapsed.value) return undefined;
  return `${level.value * menu.inlineIndent.value}px`;
});

const itemClasses = computed(() => [
  'b-menu-item',
  {
    'b-menu-item--selected': isSelected.value,
    'b-menu-item--disabled': disabled,
    'b-menu-item--danger': danger,
    'b-menu-item--collapsed': menu.inlineCollapsed.value,
    'b-menu-item--horizontal': menu.mode.value === 'horizontal',
  },
]);

// ─────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────
function handleClick(e: MouseEvent) {
  if (disabled) return;

  const info: BMenuClickInfo = {
    key: itemKey,
    keyPath: keyPath.value,
    domEvent: e,
  };
  menu.onItemClick(info);
}

function handleKeydown(e: KeyboardEvent) {
  if (disabled) return;

  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const info: BMenuClickInfo = {
      key: itemKey,
      keyPath: keyPath.value,
      domEvent: e,
    };
    menu.onItemClick(info);
  }
}
</script>

<template>
  <li
    :class="itemClasses"
    :style="{ paddingInlineStart: paddingLeft }"
    :role="itemRole"
    :tabindex="disabled ? -1 : 0"
    :aria-disabled="disabled || undefined"
    :aria-checked="menu.selectable.value ? isSelected : undefined"
    :title="title ?? (menu.inlineCollapsed.value ? label : undefined)"
    :data-menu-key="itemKey"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <span v-if="icon || $slots.icon" class="b-menu-item__icon" aria-hidden="true">
      <slot name="icon">{{ icon }}</slot>
    </span>
    <span v-if="!menu.inlineCollapsed.value" class="b-menu-item__label">
      <slot>{{ label }}</slot>
    </span>
    <span
      v-if="extra && !menu.inlineCollapsed.value"
      class="b-menu-item__extra"
    >
      <slot name="extra">{{ extra }}</slot>
    </span>
  </li>
</template>

<style>
/* ─────────────────────────────────────────────
   BMenuItem
   ───────────────────────────────────────────── */
.b-menu-item {
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
  list-style: none;
  outline: none;
  position: relative;
  transition:
    background var(--b-menu-transition-duration),
    color var(--b-menu-transition-duration),
    padding var(--b-menu-transition-duration);
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.b-menu-item:hover:not(.b-menu-item--disabled) {
  background: var(--b-menu-item-hover-bg);
  color: var(--b-menu-item-hover-color);
}

.b-menu-item:focus-visible {
  outline: 2px solid #1677ff;
  outline-offset: -2px;
}

/* ── Selected ── */
.b-menu-item--selected {
  background: var(--b-menu-item-selected-bg);
  color: var(--b-menu-item-selected-color);
  font-weight: 500;
}

/* ── Disabled ── */
.b-menu-item--disabled {
  color: var(--b-menu-item-disabled-color);
  cursor: not-allowed;
}

/* ── Danger ── */
.b-menu-item--danger {
  color: var(--b-menu-danger-item-color);
}

.b-menu-item--danger:hover:not(.b-menu-item--disabled) {
  color: var(--b-menu-danger-item-hover-color);
  background: var(--b-menu-danger-item-active-bg);
}

.b-menu-item--danger.b-menu-item--selected {
  background: var(--b-menu-danger-item-selected-bg);
  color: var(--b-menu-danger-item-selected-color);
}

/* ── Collapsed ── */
.b-menu-item--collapsed {
  justify-content: center;
  padding-inline: 0;
}

.b-menu-item--collapsed .b-menu-item__icon {
  font-size: var(--b-menu-collapsed-icon-size);
  margin-inline-end: 0;
}

/* ── Horizontal mode ── */
.b-menu-item--horizontal {
  margin-block: 0;
  border-radius: var(--b-menu-horizontal-item-border-radius);
  height: auto;
  line-height: var(--b-menu-horizontal-line-height);
  position: relative;
}

.b-menu-item--horizontal::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: var(--b-menu-item-padding-inline);
  right: var(--b-menu-item-padding-inline);
  height: var(--b-menu-active-bar-height);
  background: transparent;
  transition: background var(--b-menu-transition-duration);
}

.b-menu-item--horizontal:hover:not(.b-menu-item--disabled) {
  background: var(--b-menu-horizontal-item-hover-bg);
  color: var(--b-menu-horizontal-item-hover-color);
}

.b-menu-item--horizontal.b-menu-item--selected {
  background: var(--b-menu-horizontal-item-selected-bg);
  color: var(--b-menu-horizontal-item-selected-color);
}

.b-menu-item--horizontal.b-menu-item--selected::after {
  background: var(--b-menu-horizontal-item-selected-color);
}

/* ─────────────────────────────────────────────
   Icon & Label
   ───────────────────────────────────────────── */
.b-menu-item__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: var(--b-menu-icon-size);
  margin-inline-end: var(--b-menu-icon-margin-inline-end);
}

.b-menu-item__label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.b-menu-item__extra {
  margin-inline-start: auto;
  padding-inline-start: 8px;
  color: var(--b-menu-group-title-color);
  font-size: 12px;
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-menu-item {
    transition: none;
  }

  .b-menu-item--horizontal::after {
    transition: none;
  }
}
</style>
