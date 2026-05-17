<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue';
import BMenuDivider from './BMenuDivider.vue';
import BMenuItem from './BMenuItem.vue';
import BMenuItemGroup from './BMenuItemGroup.vue';
import BMenuSubMenu from './BMenuSubMenu.vue';
import {
  BMenuContextKey,
  isDivider,
  isItemGroup,
  isSubMenu,
  type BMenuClickInfo,
  type BMenuContext,
  type BMenuItemUnion,
  type BMenuMode,
  type BMenuSelectInfo,
  type BMenuTheme,
  type BMenuTriggerAction,
} from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    /** Menu display mode. @default 'inline' */
    mode?: BMenuMode;
    /** Color theme. @default 'light' */
    theme?: BMenuTheme;
    /** Menu items data array. */
    items?: BMenuItemUnion[];
    /** Whether items can be selected. @default true */
    selectable?: boolean;
    /** Allow multiple items to be selected. @default false */
    multiple?: boolean;
    /** Collapsed state in inline mode. @default false */
    inlineCollapsed?: boolean;
    /** Indent (px) per level for inline mode. @default 24 */
    inlineIndent?: number;
    /** Initially selected keys (uncontrolled). */
    defaultSelectedKeys?: string[];
    /** Currently selected keys (controlled). */
    selectedKeys?: string[];
    /** Initially opened submenu keys (uncontrolled). */
    defaultOpenKeys?: string[];
    /** Currently opened submenu keys (controlled). */
    openKeys?: string[];
    /** Action to trigger submenu open. @default 'hover' */
    triggerSubMenuAction?: BMenuTriggerAction;
    /** Delay (ms) before showing submenu. @default 0 */
    subMenuOpenDelay?: number;
    /** Delay (ms) before hiding submenu. @default 100 */
    subMenuCloseDelay?: number;
  }>(),
  {
    mode: 'inline',
    theme: 'light',
    items: () => [],
    selectable: true,
    multiple: false,
    inlineCollapsed: false,
    inlineIndent: 24,
    defaultSelectedKeys: () => [],
    selectedKeys: undefined,
    defaultOpenKeys: () => [],
    openKeys: undefined,
    triggerSubMenuAction: 'hover',
    subMenuOpenDelay: 0,
    subMenuCloseDelay: 100,
  },
);

const emit = defineEmits<{
  'update:selectedKeys': [keys: string[]];
  'update:openKeys': [keys: string[]];
  click: [info: BMenuClickInfo];
  select: [info: BMenuSelectInfo];
  deselect: [info: BMenuSelectInfo];
  openChange: [keys: string[]];
}>();

defineSlots<{
  default?(): unknown;
}>();

// ─────────────────────────────────────────────
// Selection state (controlled + uncontrolled)
// ─────────────────────────────────────────────
const isSelectionControlled = computed(() => props.selectedKeys !== undefined);
const internalSelectedKeys = ref<string[]>([...props.defaultSelectedKeys]);

const resolvedSelectedKeys = computed(() =>
  isSelectionControlled.value ? (props.selectedKeys ?? []) : internalSelectedKeys.value,
);

// ─────────────────────────────────────────────
// Open state (controlled + uncontrolled)
// ─────────────────────────────────────────────
const isOpenControlled = computed(() => props.openKeys !== undefined);
const internalOpenKeys = ref<string[]>([...props.defaultOpenKeys]);

const resolvedOpenKeys = computed(() =>
  isOpenControlled.value ? (props.openKeys ?? []) : internalOpenKeys.value,
);

// ─────────────────────────────────────────────
// Key path registry (item key → full path from root)
// ─────────────────────────────────────────────
const keyPathMap = new Map<string, string[]>();

function registerKeyPath(key: string, path: string[]) {
  keyPathMap.set(key, path);
}

// ─────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────
function onItemClick(info: BMenuClickInfo) {
  emit('click', info);

  if (!props.selectable) return;

  const key = info.key;
  const current = [...resolvedSelectedKeys.value];

  if (props.multiple) {
    const idx = current.indexOf(key);
    if (idx >= 0) {
      current.splice(idx, 1);
      if (!isSelectionControlled.value) {
        internalSelectedKeys.value = current;
      }
      emit('update:selectedKeys', current);
      emit('deselect', { ...info, selectedKeys: current });
    } else {
      current.push(key);
      if (!isSelectionControlled.value) {
        internalSelectedKeys.value = current;
      }
      emit('update:selectedKeys', current);
      emit('select', { ...info, selectedKeys: current });
    }
  } else {
    const newKeys = [key];
    if (!isSelectionControlled.value) {
      internalSelectedKeys.value = newKeys;
    }
    emit('update:selectedKeys', newKeys);
    emit('select', { ...info, selectedKeys: newKeys });
  }
}

function onOpenChange(key: string, open: boolean) {
  const current = [...resolvedOpenKeys.value];
  const idx = current.indexOf(key);

  if (open && idx < 0) {
    if (props.mode === 'inline') {
      current.push(key);
    } else {
      // In vertical/horizontal mode, only one submenu open at a level
      current.push(key);
    }
  } else if (!open && idx >= 0) {
    current.splice(idx, 1);
  }

  if (!isOpenControlled.value) {
    internalOpenKeys.value = current;
  }
  emit('update:openKeys', current);
  emit('openChange', current);
}

// ─────────────────────────────────────────────
// Sync controlled props
// ─────────────────────────────────────────────
watch(
  () => props.selectedKeys,
  (val) => {
    if (val !== undefined) {
      internalSelectedKeys.value = [...val];
    }
  },
);

watch(
  () => props.openKeys,
  (val) => {
    if (val !== undefined) {
      internalOpenKeys.value = [...val];
    }
  },
);

// When inline collapsed changes, close all submenus in uncontrolled mode
watch(
  () => props.inlineCollapsed,
  (collapsed) => {
    if (collapsed && !isOpenControlled.value) {
      internalOpenKeys.value = [];
      emit('update:openKeys', []);
      emit('openChange', []);
    }
  },
);

// ─────────────────────────────────────────────
// Context for children
// ─────────────────────────────────────────────
const context: BMenuContext = {
  mode: computed(() => props.mode),
  theme: computed(() => props.theme),
  inlineCollapsed: computed(() => props.inlineCollapsed),
  inlineIndent: computed(() => props.inlineIndent),
  selectedKeys: resolvedSelectedKeys,
  openKeys: resolvedOpenKeys,
  multiple: computed(() => props.multiple),
  selectable: computed(() => props.selectable),
  triggerSubMenuAction: computed(() => props.triggerSubMenuAction),
  subMenuOpenDelay: computed(() => props.subMenuOpenDelay),
  subMenuCloseDelay: computed(() => props.subMenuCloseDelay),
  onItemClick,
  onOpenChange,
  registerKeyPath,
};

provide(BMenuContextKey, context);

// ─────────────────────────────────────────────
// Computed classes
// ─────────────────────────────────────────────
const rootClasses = computed(() => [
  'b-menu',
  `b-menu--${props.mode}`,
  `b-menu--${props.theme}`,
  {
    'b-menu--collapsed': props.mode === 'inline' && props.inlineCollapsed,
  },
]);

const ariaRole = computed(() => 'menu');
const ariaOrientation = computed(() => (props.mode === 'horizontal' ? 'horizontal' : 'vertical'));
</script>

<template>
  <ul
    :class="rootClasses"
    :role="ariaRole"
    :aria-orientation="ariaOrientation"
    :data-theme="props.theme"
  >
    <slot>
      <template v-for="item in props.items" :key="item.key ?? (item as any).type">
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
          :title="(item as any).title"
        />
      </template>
    </slot>
  </ul>
</template>

<style>
/* ─────────────────────────────────────────────
   BMenu – Root CSS Custom Properties
   ───────────────────────────────────────────── */
.b-menu {
  --b-menu-item-bg: #ffffff;
  --b-menu-item-color: rgba(0, 0, 0, 0.88);
  --b-menu-item-hover-bg: rgba(0, 0, 0, 0.06);
  --b-menu-item-hover-color: rgba(0, 0, 0, 0.88);
  --b-menu-item-active-bg: #e6f4ff;
  --b-menu-item-selected-bg: #e6f4ff;
  --b-menu-item-selected-color: #0958d9;
  --b-menu-item-disabled-color: rgba(0, 0, 0, 0.25);
  --b-menu-item-height: 40px;
  --b-menu-item-border-radius: 8px;
  --b-menu-item-margin-block: 4px;
  --b-menu-item-margin-inline: 4px;
  --b-menu-item-padding-inline: 16px;
  --b-menu-icon-size: 14px;
  --b-menu-icon-margin-inline-end: 10px;
  --b-menu-group-title-color: rgba(0, 0, 0, 0.65);
  --b-menu-group-title-font-size: 14px;
  --b-menu-group-title-line-height: 1.5714;
  --b-menu-danger-item-color: #cf1322;
  --b-menu-danger-item-hover-color: #cf1322;
  --b-menu-danger-item-active-bg: #fff2f0;
  --b-menu-danger-item-selected-bg: #fff2f0;
  --b-menu-danger-item-selected-color: #cf1322;
  --b-menu-sub-menu-item-bg: rgba(0, 0, 0, 0.02);
  --b-menu-sub-menu-item-border-radius: 4px;
  --b-menu-sub-menu-item-selected-color: #0958d9;
  --b-menu-popup-bg: #ffffff;
  --b-menu-popup-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  --b-menu-popup-border-radius: 8px;
  --b-menu-popup-z-index: 1050;
  --b-menu-dropdown-width: 160px;
  --b-menu-collapsed-width: 80px;
  --b-menu-collapsed-icon-size: 16px;
  --b-menu-active-bar-height: 2px;
  --b-menu-active-bar-width: 3px;
  --b-menu-active-bar-border-width: 1px;
  --b-menu-horizontal-line-height: 46px;
  --b-menu-horizontal-item-hover-bg: transparent;
  --b-menu-horizontal-item-hover-color: #0958d9;
  --b-menu-horizontal-item-selected-bg: transparent;
  --b-menu-horizontal-item-selected-color: #0958d9;
  --b-menu-horizontal-item-border-radius: 0;
  --b-menu-transition-duration: 200ms;
}

/* ── Dark theme (via data-theme or dark mode) ── */
.b-menu--dark,
[data-prefers-color='dark'] .b-menu {
  --b-menu-item-bg: #001529;
  --b-menu-item-color: rgba(255, 255, 255, 0.65);
  --b-menu-item-hover-bg: transparent;
  --b-menu-item-hover-color: #fff;
  --b-menu-item-active-bg: #1677ff;
  --b-menu-item-selected-bg: #1677ff;
  --b-menu-item-selected-color: #fff;
  --b-menu-item-disabled-color: rgba(255, 255, 255, 0.25);
  --b-menu-group-title-color: rgba(255, 255, 255, 0.65);
  --b-menu-danger-item-color: #ff4d4f;
  --b-menu-danger-item-hover-color: #ff7875;
  --b-menu-danger-item-active-bg: #ff4d4f;
  --b-menu-danger-item-selected-bg: #ff4d4f;
  --b-menu-danger-item-selected-color: #fff;
  --b-menu-sub-menu-item-bg: #000c17;
  --b-menu-popup-bg: #001529;
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-menu {
    --b-menu-item-bg: #001529;
    --b-menu-item-color: rgba(255, 255, 255, 0.65);
    --b-menu-item-hover-bg: transparent;
    --b-menu-item-hover-color: #fff;
    --b-menu-item-active-bg: #1677ff;
    --b-menu-item-selected-bg: #1677ff;
    --b-menu-item-selected-color: #fff;
    --b-menu-item-disabled-color: rgba(255, 255, 255, 0.25);
    --b-menu-group-title-color: rgba(255, 255, 255, 0.65);
    --b-menu-danger-item-color: #ff4d4f;
    --b-menu-danger-item-hover-color: #ff7875;
    --b-menu-danger-item-active-bg: #ff4d4f;
    --b-menu-danger-item-selected-bg: #ff4d4f;
    --b-menu-danger-item-selected-color: #fff;
    --b-menu-sub-menu-item-bg: #000c17;
    --b-menu-popup-bg: #001529;
  }
}

@media (prefers-color-scheme: dark) {
  [data-theme='dark'] .b-menu {
    --b-menu-item-bg: #001529;
    --b-menu-item-color: rgba(255, 255, 255, 0.65);
    --b-menu-item-hover-bg: transparent;
    --b-menu-item-hover-color: #fff;
    --b-menu-item-active-bg: #1677ff;
    --b-menu-item-selected-bg: #1677ff;
    --b-menu-item-selected-color: #fff;
    --b-menu-item-disabled-color: rgba(255, 255, 255, 0.25);
    --b-menu-group-title-color: rgba(255, 255, 255, 0.65);
    --b-menu-danger-item-color: #ff4d4f;
    --b-menu-danger-item-hover-color: #ff7875;
    --b-menu-danger-item-active-bg: #ff4d4f;
    --b-menu-danger-item-selected-bg: #ff4d4f;
    --b-menu-danger-item-selected-color: #fff;
    --b-menu-sub-menu-item-bg: #000c17;
    --b-menu-popup-bg: #001529;
  }
}

/* ─────────────────────────────────────────────
   Base layout
   ───────────────────────────────────────────── */
.b-menu {
  margin: 0;
  padding: 4px;
  list-style: none;
  background: var(--b-menu-item-bg);
  color: var(--b-menu-item-color);
  font-size: 14px;
  line-height: 1.5714;
  box-sizing: border-box;
  outline: none;
  transition:
    background var(--b-menu-transition-duration),
    width var(--b-menu-transition-duration);
}

/* ── Inline mode ── */
.b-menu--inline {
  width: 100%;
  border-inline-end: 1px solid rgba(5, 5, 5, 0.06);
}

.b-menu--inline.b-menu--collapsed {
  width: var(--b-menu-collapsed-width);
}

/* ── Vertical mode ── */
.b-menu--vertical {
  width: 100%;
  border-inline-end: 1px solid rgba(5, 5, 5, 0.06);
}

/* ── Horizontal mode ── */
.b-menu--horizontal {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  border-bottom: 1px solid rgba(5, 5, 5, 0.06);
  padding: 0 4px;
  line-height: var(--b-menu-horizontal-line-height);
}

/* ── Dark theme border override ── */
.b-menu--dark.b-menu--inline,
.b-menu--dark.b-menu--vertical {
  border-inline-end-color: transparent;
}

.b-menu--dark.b-menu--horizontal {
  border-bottom-color: transparent;
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-menu {
    transition: none;
  }
}
</style>
