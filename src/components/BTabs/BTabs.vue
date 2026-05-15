<script setup lang="ts">
import type { Component, VNode } from 'vue';
import { computed, defineComponent, h, nextTick, onMounted, provide, ref, useId, watch } from 'vue';

import type {
  BTabItem,
  BTabPaneRegistration,
  BTabsContext,
  BTabsPlacement,
  BTabsSize,
  BTabsType,
} from './types';
import { BTabsContextKey } from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  activeKey,
  defaultActiveKey,
  items = [],
  type = 'line',
  placement = 'top',
  size = 'middle',
  centered = false,
  animated = true,
  hideAdd = false,
  destroyOnHidden = false,
  keepAlive = false,
  tabBarGutter,
} = defineProps<{
  /** Current active tab key (controlled via v-model:activeKey). */
  activeKey?: string;
  /** Initial active tab key for uncontrolled mode. @default first non-disabled tab */
  defaultActiveKey?: string;
  /** Tab items configuration. When provided and non-empty, BTabPane children are ignored. */
  items?: BTabItem[];
  /** Visual style of the tabs. @default 'line' */
  type?: BTabsType;
  /** Position of the tab bar. @default 'top' */
  placement?: BTabsPlacement;
  /** Size preset for the tab bar. @default 'middle' */
  size?: BTabsSize;
  /** Whether to center the tab items. @default false */
  centered?: boolean;
  /** Whether content switching is animated. @default true */
  animated?: boolean;
  /** Whether to hide the add button in editable-card mode. @default false */
  hideAdd?: boolean;
  /** Whether to destroy inactive tab content globally. @default false */
  destroyOnHidden?: boolean;
  /** Whether to keep component state alive when switching tabs globally. @default false */
  keepAlive?: boolean;
  /** Gap between tabs in pixels. */
  tabBarGutter?: number;
}>();

// ─────────────────────────────────────────────
// Emits
// ─────────────────────────────────────────────
const emit = defineEmits<{
  /** Fires when the active tab changes. */
  (e: 'update:activeKey', key: string): void;
  /** Fires when the active tab changes (alias for update:activeKey). */
  (e: 'change', key: string): void;
  /** Fires when a tab is clicked. */
  (e: 'tabClick', key: string, event: MouseEvent): void;
  /** Fires when a tab is added or removed (editable-card only). */
  (e: 'edit', key: string | null, action: 'add' | 'remove'): void;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /** Items mode: receives { item } scoped prop. Pane mode: contains BTabPane children (no props). */
  default?: (props: { item?: BTabItem }) => unknown;
  /** Custom label renderer for each tab (items mode). */
  label?: (props: { item: BTabItem; active: boolean }) => unknown;
  /** Extra content on the left side of the tab bar. */
  leftExtra?: () => unknown;
  /** Extra content on the right side of the tab bar. */
  rightExtra?: () => unknown;
  /** Custom add button (editable-card type). */
  addIcon?: () => unknown;
  /** Custom remove/close icon (editable-card type). */
  removeIcon?: (props: { item: BTabItem }) => unknown;
}>();

// ─────────────────────────────────────────────
// Instance-scoped ID prefix (prevents duplicate IDs when multiple BTabs on page)
// ─────────────────────────────────────────────
const uid = useId();
const tabId = (key: string) => `${uid}-tab-${key}`;
const panelId = (key: string) => `${uid}-tabpanel-${key}`;

// ─────────────────────────────────────────────
// Pane registry (for BTabPane child component API)
// ─────────────────────────────────────────────
const paneRegistry = ref(new Map<string, BTabPaneRegistration>());
const paneOrder = ref<string[]>([]);

function registerPane(pane: BTabPaneRegistration) {
  paneRegistry.value.set(pane.key, pane);
  if (!paneOrder.value.includes(pane.key)) {
    paneOrder.value = [...paneOrder.value, pane.key];
  }
}

function unregisterPane(key: string) {
  paneRegistry.value.delete(key);
  paneOrder.value = paneOrder.value.filter((k) => k !== key);
}

function updatePane(key: string, pane: BTabPaneRegistration) {
  paneRegistry.value.set(key, pane);
}

// ─────────────────────────────────────────────
// Mode detection + effective items
// ─────────────────────────────────────────────
const isItemsMode = computed(() => items && items.length > 0);

const effectiveItems = computed<BTabItem[]>(() => {
  if (isItemsMode.value) return items;
  return paneOrder.value
    .map((key) => paneRegistry.value.get(key))
    .filter((p): p is BTabPaneRegistration => p !== undefined)
    .map((pane) => ({
      key: pane.key,
      label: pane.label,
      disabled: pane.disabled,
      closable: pane.closable,
      destroyOnHidden: pane.destroyOnHidden,
      forceRender: pane.forceRender,
      keepAlive: pane.keepAlive,
    }));
});

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const isControlled = computed(() => activeKey !== undefined);

const firstEnabledKey = computed(
  () => effectiveItems.value.find((i) => !i.disabled)?.key ?? effectiveItems.value[0]?.key ?? '',
);

const internalKey = ref<string>(activeKey ?? defaultActiveKey ?? firstEnabledKey.value);

watch(
  () => activeKey,
  (val) => {
    if (val !== undefined) internalKey.value = val;
  },
);

watch(effectiveItems, () => {
  if (
    internalKey.value === undefined ||
    !effectiveItems.value.find((i) => i.key === internalKey.value)
  ) {
    internalKey.value = firstEnabledKey.value;
  }
});

const currentKey = computed(() => (isControlled.value ? activeKey! : internalKey.value));

// ─────────────────────────────────────────────
// Provide context to BTabPane children
// ─────────────────────────────────────────────
const context: BTabsContext = {
  activeKey: currentKey,
  type: computed(() => type),
  size: computed(() => size),
  placement: computed(() => placement),
  keepAlive: computed(() => keepAlive),
  destroyOnHidden: computed(() => destroyOnHidden),
  register: registerPane,
  unregister: unregisterPane,
  update: updatePane,
};

provide(BTabsContextKey, context);

// ─────────────────────────────────────────────
// Tab activation
// ─────────────────────────────────────────────
function activateTab(key: string, event?: MouseEvent) {
  const item = effectiveItems.value.find((i) => i.key === key);
  if (!item || item.disabled) return;

  if (event) {
    emit('tabClick', key, event);
  }

  if (key === currentKey.value) return;

  if (!isControlled.value) {
    internalKey.value = key;
  }
  emit('update:activeKey', key);
  emit('change', key);
}

// ─────────────────────────────────────────────
// Editable-card actions
// ─────────────────────────────────────────────
function onAdd() {
  emit('edit', null, 'add');
}

function onRemove(key: string, event: MouseEvent) {
  event.stopPropagation();
  emit('edit', key, 'remove');
}

// ─────────────────────────────────────────────
// Ink bar positioning
// ─────────────────────────────────────────────
const tabListRef = ref<HTMLElement | null>(null);
const inkBarStyle = ref<Record<string, string>>({});

function updateInkBar() {
  if (!tabListRef.value || type !== 'line') return;
  const activeEl = tabListRef.value.querySelector<HTMLElement>('.b-tabs__tab--active');
  if (!activeEl) return;

  const isVertical = placement === 'left' || placement === 'right';

  if (isVertical) {
    inkBarStyle.value = {
      top: `${activeEl.offsetTop}px`,
      height: `${activeEl.offsetHeight}px`,
    };
  } else {
    inkBarStyle.value = {
      left: `${activeEl.offsetLeft}px`,
      width: `${activeEl.offsetWidth}px`,
    };
  }
}

watch(currentKey, async () => {
  await nextTick();
  updateInkBar();
});

onMounted(() => {
  updateInkBar();
});

// ─────────────────────────────────────────────
// Keyboard navigation (roving tabindex)
// ─────────────────────────────────────────────
function onKeydown(event: KeyboardEvent) {
  const isVertical = placement === 'left' || placement === 'right';
  const nextKeys = isVertical ? ['ArrowDown'] : ['ArrowRight'];
  const prevKeys = isVertical ? ['ArrowUp'] : ['ArrowLeft'];

  // Delete key closes the active tab in editable-card mode
  if (event.key === 'Delete' && type === 'editable-card') {
    const item = effectiveItems.value.find((i) => i.key === currentKey.value);
    if (item && item.closable !== false) {
      event.preventDefault();
      emit('edit', currentKey.value, 'remove');
    }
    return;
  }

  if ([...nextKeys, ...prevKeys, 'Home', 'End'].includes(event.key)) {
    event.preventDefault();
    const enabledItems = effectiveItems.value.filter((i) => !i.disabled);
    if (enabledItems.length === 0) return;

    const currentIdx = enabledItems.findIndex((i) => i.key === currentKey.value);

    let targetIdx: number;
    if (nextKeys.includes(event.key)) {
      targetIdx = (currentIdx + 1) % enabledItems.length;
    } else if (prevKeys.includes(event.key)) {
      targetIdx = (currentIdx - 1 + enabledItems.length) % enabledItems.length;
    } else if (event.key === 'Home') {
      targetIdx = 0;
    } else {
      targetIdx = enabledItems.length - 1;
    }

    const targetKey = enabledItems[targetIdx].key;
    activateTab(targetKey);

    nextTick(() => {
      if (!tabListRef.value) return;
      const targetEl = tabListRef.value.querySelector<HTMLElement>(`[data-tab-key="${targetKey}"]`);
      targetEl?.focus();
    });
  }
}

// ─────────────────────────────────────────────
// KeepAlive + content visibility
// ─────────────────────────────────────────────
const renderedKeys = ref<Set<string>>(new Set([currentKey.value]));

watch(currentKey, (key) => {
  renderedKeys.value.add(key);
});

function shouldUseKeepAlive(item: BTabItem): boolean {
  if (item.destroyOnHidden) return false;
  if (item.keepAlive !== undefined) return item.keepAlive;
  if (destroyOnHidden) return false;
  return keepAlive;
}

function shouldRender(item: BTabItem): boolean {
  if (item.forceRender) return true;
  if (shouldUseKeepAlive(item)) return true;
  const itemDestroy = item.destroyOnHidden ?? destroyOnHidden;
  if (itemDestroy) return item.key === currentKey.value;
  return renderedKeys.value.has(item.key);
}

// ─────────────────────────────────────────────
// KeepAlive panel wrapper components
// ─────────────────────────────────────────────
const panelWrappers = computed<Record<string, Component>>(() => {
  const wrappers: Record<string, Component> = {};
  for (const item of effectiveItems.value) {
    if (!shouldUseKeepAlive(item)) continue;
    wrappers[item.key] = defineComponent({
      name: `BTabPanel_${item.key}`,
      setup() {
        return () => {
          const pane = paneRegistry.value.get(item.key);
          if (pane) {
            return pane.renderContent();
          }
          return null;
        };
      },
    });
  }
  return wrappers;
});

function getPaneContent(key: string): VNode[] {
  const pane = paneRegistry.value.get(key);
  return pane?.renderContent() ?? [];
}

function getPaneLabel(key: string): VNode[] | undefined {
  const pane = paneRegistry.value.get(key);
  return pane?.renderLabel?.();
}

// ─────────────────────────────────────────────
// Computed classes
// ─────────────────────────────────────────────
const rootClasses = computed(() => [
  'b-tabs',
  `b-tabs--${type}`,
  `b-tabs--${placement}`,
  `b-tabs--${size}`,
  { 'b-tabs--centered': centered },
]);

const tabBarGutterStyle = computed(() =>
  tabBarGutter !== undefined ? { gap: `${tabBarGutter}px` } : undefined,
);
</script>

<template>
  <div :class="rootClasses">
    <!-- Tab bar -->
    <div class="b-tabs__header">
      <div v-if="$slots.leftExtra" class="b-tabs__extra b-tabs__extra--left">
        <slot name="leftExtra" />
      </div>

      <div
        ref="tabListRef"
        class="b-tabs__list"
        role="tablist"
        :aria-orientation="
          placement === 'left' || placement === 'right' ? 'vertical' : 'horizontal'
        "
        :style="tabBarGutterStyle"
      >
        <div
          v-for="item in effectiveItems"
          :key="item.key"
          :data-tab-key="item.key"
          class="b-tabs__tab"
          :class="{
            'b-tabs__tab--active': item.key === currentKey,
            'b-tabs__tab--disabled': item.disabled,
          }"
          role="tab"
          :aria-selected="item.key === currentKey"
          :aria-disabled="item.disabled || undefined"
          :aria-controls="panelId(item.key)"
          :id="tabId(item.key)"
          :tabindex="item.key === currentKey ? 0 : -1"
          @click="!item.disabled && activateTab(item.key, $event)"
          @keydown="onKeydown"
        >
          <span class="b-tabs__tab-label">
            <!-- Items mode: use label slot or item.label -->
            <template v-if="isItemsMode">
              <slot name="label" :item="item" :active="item.key === currentKey">
                {{ item.label }}
              </slot>
            </template>
            <!-- Pane mode: use pane's renderLabel or label string -->
            <template v-else>
              <component
                v-if="getPaneLabel(item.key)"
                :is="() => h('span', getPaneLabel(item.key)!)"
              />
              <template v-else>{{ item.label }}</template>
            </template>
          </span>
          <span
            v-if="type === 'editable-card' && item.closable !== false"
            class="b-tabs__tab-remove"
            aria-hidden="true"
            @click.stop="onRemove(item.key, $event)"
          >
            <slot name="removeIcon" :item="item">
              <svg viewBox="0 0 16 16" fill="currentColor" class="b-tabs__close-icon">
                <path
                  d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                />
              </svg>
            </slot>
          </span>
        </div>

        <!-- Ink bar (line type only) -->
        <div
          v-if="type === 'line'"
          class="b-tabs__ink-bar"
          aria-hidden="true"
          :style="inkBarStyle"
        />
      </div>

      <!-- Add button (outside tablist to avoid aria-required-children violation) -->
      <button
        v-if="type === 'editable-card' && !hideAdd"
        class="b-tabs__add"
        aria-label="Add tab"
        @click="onAdd"
      >
        <slot name="addIcon">
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="b-tabs__add-icon">
            <path
              d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
            />
          </svg>
        </slot>
      </button>

      <div v-if="$slots.rightExtra" class="b-tabs__extra b-tabs__extra--right">
        <slot name="rightExtra" />
      </div>
    </div>

    <!-- Hidden slot area for BTabPane registration (pane mode only) -->
    <div v-if="!isItemsMode" v-show="false" aria-hidden="true" style="display: none">
      <slot />
    </div>

    <!-- Tab panels -->
    <div class="b-tabs__content">
      <template v-for="item in effectiveItems" :key="item.key">
        <!-- KeepAlive panels -->
        <div
          v-if="shouldUseKeepAlive(item)"
          :id="panelId(item.key)"
          class="b-tabs__panel"
          :class="{
            'b-tabs__panel--active': item.key === currentKey,
            'b-tabs__panel--animated': animated,
          }"
          role="tabpanel"
          :aria-labelledby="tabId(item.key)"
          :tabindex="item.key === currentKey ? 0 : -1"
          :aria-hidden="item.key !== currentKey"
          v-show="item.key === currentKey"
        >
          <!-- Pane mode: KeepAlive caches wrapper component instances -->
          <KeepAlive v-if="!isItemsMode">
            <component
              v-if="item.key === currentKey"
              :is="panelWrappers[item.key] ?? (() => null)"
              :key="item.key"
            />
          </KeepAlive>
          <!-- Items mode: always render slot content; v-show on parent preserves state -->
          <template v-if="isItemsMode">
            <slot :item="item" />
          </template>
        </div>

        <!-- Standard panels (no KeepAlive) -->
        <div
          v-else-if="shouldRender(item)"
          v-show="item.key === currentKey"
          :id="panelId(item.key)"
          class="b-tabs__panel"
          :class="{
            'b-tabs__panel--active': item.key === currentKey,
            'b-tabs__panel--animated': animated,
          }"
          role="tabpanel"
          :aria-labelledby="tabId(item.key)"
          :tabindex="item.key === currentKey ? 0 : -1"
          :aria-hidden="item.key !== currentKey"
        >
          <!-- Items mode: scoped slot -->
          <template v-if="isItemsMode">
            <slot :item="item" />
          </template>
          <!-- Pane mode: render registered content -->
          <component v-else :is="() => getPaneContent(item.key)" />
        </div>
      </template>
    </div>
  </div>
</template>

<style>
/* ─────────────────────────────────────────────
   BTabs - Design tokens (scoped to .b-tabs)
   ───────────────────────────────────────────── */
.b-tabs {
  --b-tabs-ink-bar-color: oklch(54.6% 0.245 262.881);
  --b-tabs-item-active-color: oklch(35% 0.2 260);
  --b-tabs-item-color: oklch(30% 0.02 260 / 88%);
  --b-tabs-item-hover-color: oklch(54.6% 0.245 262.881);
  --b-tabs-item-selected-color: oklch(54.6% 0.245 262.881);
  --b-tabs-item-disabled-color: oklch(30% 0.02 260 / 25%);
  --b-tabs-title-font-size: 14px;
  --b-tabs-title-font-size-lg: 16px;
  --b-tabs-title-font-size-sm: 14px;
  --b-tabs-card-bg: oklch(97% 0.003 260 / 50%);
  --b-tabs-card-height: 40px;
  --b-tabs-card-height-lg: 48px;
  --b-tabs-card-height-sm: 32px;
  --b-tabs-card-padding: 8px 16px;
  --b-tabs-card-padding-lg: 11px 16px;
  --b-tabs-card-padding-sm: 4px 8px;
  --b-tabs-card-gutter: 2px;
  --b-tabs-card-border-radius: 8px 8px 0 0;
  --b-tabs-horizontal-item-gutter: 32px;
  --b-tabs-horizontal-item-padding: 12px 0;
  --b-tabs-horizontal-item-padding-lg: 16px 0;
  --b-tabs-horizontal-item-padding-sm: 8px 0;
  --b-tabs-horizontal-margin: 0 0 16px 0;
  --b-tabs-vertical-item-margin: 16px 0 0 0;
  --b-tabs-vertical-item-padding: 8px 24px;
  --b-tabs-border-color: oklch(80% 0.005 260);
  --b-tabs-content-min-height: 0;
  --b-tabs-focus-ring: 0 0 0 2px oklch(54.6% 0.245 262.881 / 20%);
  --b-tabs-transition-duration: 200ms;

  display: flex;
  flex-direction: column;
  font-size: var(--b-tabs-title-font-size);
  line-height: 1.5;
}

/* ── Placement layouts ── */
.b-tabs--left {
  flex-direction: row;
}

.b-tabs--right {
  flex-direction: row-reverse;
}

.b-tabs--bottom {
  flex-direction: column-reverse;
}

/* ── Size variants ── */
.b-tabs--large {
  --b-tabs-title-font-size: var(--b-tabs-title-font-size-lg);
}

.b-tabs--small {
  --b-tabs-title-font-size: var(--b-tabs-title-font-size-sm);
}

/* ─────────────────────────────────────────────
   Header
   ───────────────────────────────────────────── */
.b-tabs__header {
  display: flex;
  align-items: center;
  position: relative;
  flex-shrink: 0;
}

.b-tabs--top .b-tabs__header,
.b-tabs--bottom .b-tabs__header {
  border-bottom: 1px solid var(--b-tabs-border-color);
  margin: var(--b-tabs-horizontal-margin);
}

.b-tabs--bottom .b-tabs__header {
  border-bottom: none;
  border-top: 1px solid var(--b-tabs-border-color);
  margin: 0;
}

.b-tabs--left .b-tabs__header,
.b-tabs--right .b-tabs__header {
  flex-direction: column;
  align-items: stretch;
  border-right: 1px solid var(--b-tabs-border-color);
  margin: 0;
}

.b-tabs--right .b-tabs__header {
  border-right: none;
  border-left: 1px solid var(--b-tabs-border-color);
}

/* Card type removes border from header */
.b-tabs--card .b-tabs__header,
.b-tabs--editable-card .b-tabs__header {
  border-bottom: 1px solid var(--b-tabs-border-color);
}

/* ─────────────────────────────────────────────
   Tab list (roving tabindex container)
   ───────────────────────────────────────────── */
.b-tabs__list {
  display: flex;
  position: relative;
  flex: 1;
  gap: var(--b-tabs-horizontal-item-gutter);
}

.b-tabs--centered .b-tabs__list {
  justify-content: center;
}

.b-tabs--left .b-tabs__list,
.b-tabs--right .b-tabs__list {
  flex-direction: column;
  gap: 0;
}

/* ─────────────────────────────────────────────
   Individual tab
   ───────────────────────────────────────────── */
.b-tabs__tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: relative;
  padding: var(--b-tabs-horizontal-item-padding);
  border: none;
  background: none;
  color: var(--b-tabs-item-color);
  font-size: inherit;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  outline: none;
  transition: color var(--b-tabs-transition-duration);
  line-height: 1.5;
}

.b-tabs__tab:hover:not(.b-tabs__tab--disabled) {
  color: var(--b-tabs-item-hover-color);
}

.b-tabs__tab--active {
  color: var(--b-tabs-item-selected-color);
  font-weight: 500;
}

.b-tabs__tab--active:hover {
  color: var(--b-tabs-item-active-color);
}

.b-tabs__tab--disabled {
  color: var(--b-tabs-item-disabled-color);
  cursor: not-allowed;
}

.b-tabs__tab:focus-visible {
  box-shadow: var(--b-tabs-focus-ring);
  border-radius: 4px;
}

/* Large size - tab padding */
.b-tabs--large .b-tabs__tab {
  padding: var(--b-tabs-horizontal-item-padding-lg);
}

/* Small size - tab padding */
.b-tabs--small .b-tabs__tab {
  padding: var(--b-tabs-horizontal-item-padding-sm);
}

/* Vertical tabs */
.b-tabs--left .b-tabs__tab,
.b-tabs--right .b-tabs__tab {
  padding: var(--b-tabs-vertical-item-padding);
  justify-content: flex-start;
}

.b-tabs--left .b-tabs__tab:not(:first-child),
.b-tabs--right .b-tabs__tab:not(:first-child) {
  margin: var(--b-tabs-vertical-item-margin);
}

/* ─────────────────────────────────────────────
   Card-type tab
   ───────────────────────────────────────────── */
.b-tabs--card .b-tabs__list,
.b-tabs--editable-card .b-tabs__list {
  gap: var(--b-tabs-card-gutter);
}

.b-tabs--card .b-tabs__tab,
.b-tabs--editable-card .b-tabs__tab {
  padding: var(--b-tabs-card-padding);
  background: var(--b-tabs-card-bg);
  border: 1px solid var(--b-tabs-border-color);
  border-bottom: none;
  border-radius: var(--b-tabs-card-border-radius);
  height: var(--b-tabs-card-height);
  margin-bottom: -1px;
}

.b-tabs--card .b-tabs__tab--active,
.b-tabs--editable-card .b-tabs__tab--active {
  background: white;
  border-bottom-color: white;
}

.b-tabs--large.b-tabs--card .b-tabs__tab,
.b-tabs--large.b-tabs--editable-card .b-tabs__tab {
  padding: var(--b-tabs-card-padding-lg);
  height: var(--b-tabs-card-height-lg);
}

.b-tabs--small.b-tabs--card .b-tabs__tab,
.b-tabs--small.b-tabs--editable-card .b-tabs__tab {
  padding: var(--b-tabs-card-padding-sm);
  height: var(--b-tabs-card-height-sm);
}

/* ─────────────────────────────────────────────
   Ink bar (line type indicator)
   ───────────────────────────────────────────── */
.b-tabs__ink-bar {
  position: absolute;
  background: var(--b-tabs-ink-bar-color);
  transition:
    left var(--b-tabs-transition-duration) cubic-bezier(0.645, 0.045, 0.355, 1),
    width var(--b-tabs-transition-duration) cubic-bezier(0.645, 0.045, 0.355, 1),
    top var(--b-tabs-transition-duration) cubic-bezier(0.645, 0.045, 0.355, 1),
    height var(--b-tabs-transition-duration) cubic-bezier(0.645, 0.045, 0.355, 1);
  pointer-events: none;
}

.b-tabs--top .b-tabs__ink-bar,
.b-tabs--bottom .b-tabs__ink-bar {
  bottom: 0;
  height: 2px;
}

.b-tabs--bottom .b-tabs__ink-bar {
  bottom: auto;
  top: 0;
}

.b-tabs--left .b-tabs__ink-bar {
  right: 0;
  width: 2px;
}

.b-tabs--right .b-tabs__ink-bar {
  left: 0;
  width: 2px;
}

/* ─────────────────────────────────────────────
   Close / Remove button
   ───────────────────────────────────────────── */
.b-tabs__tab-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0.6;
  transition:
    opacity var(--b-tabs-transition-duration),
    background var(--b-tabs-transition-duration);
}

.b-tabs__tab-remove:hover {
  opacity: 1;
  background: oklch(0% 0 0 / 8%);
}

.b-tabs__close-icon {
  width: 12px;
  height: 12px;
}

/* ─────────────────────────────────────────────
   Add button
   ───────────────────────────────────────────── */
.b-tabs__add {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--b-tabs-card-padding);
  background: var(--b-tabs-card-bg);
  border: 1px solid var(--b-tabs-border-color);
  border-bottom: none;
  border-radius: var(--b-tabs-card-border-radius);
  height: var(--b-tabs-card-height);
  margin-bottom: -1px;
  cursor: pointer;
  color: var(--b-tabs-item-color);
  transition: color var(--b-tabs-transition-duration);
}

.b-tabs__add:hover {
  color: var(--b-tabs-item-hover-color);
}

.b-tabs__add:focus-visible {
  box-shadow: var(--b-tabs-focus-ring);
}

.b-tabs__add-icon {
  width: 16px;
  height: 16px;
}

/* ─────────────────────────────────────────────
   Extra content slots
   ───────────────────────────────────────────── */
.b-tabs__extra {
  display: flex;
  align-items: center;
  padding: 0 8px;
  flex-shrink: 0;
}

/* ─────────────────────────────────────────────
   Content area
   ───────────────────────────────────────────── */
.b-tabs__content {
  flex: 1;
  min-height: var(--b-tabs-content-min-height);
}

.b-tabs__panel {
  outline: none;
}

.b-tabs__panel--animated {
  animation: b-tabs-fade-in var(--b-tabs-transition-duration) ease-in-out;
}

@keyframes b-tabs-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ─────────────────────────────────────────────
   Dark mode
   ───────────────────────────────────────────── */
[data-prefers-color='dark'] .b-tabs {
  --b-tabs-ink-bar-color: oklch(70% 0.18 262.881);
  --b-tabs-item-active-color: oklch(80% 0.14 262.881);
  --b-tabs-item-color: oklch(85% 0.01 260 / 88%);
  --b-tabs-item-hover-color: oklch(70% 0.18 262.881);
  --b-tabs-item-selected-color: oklch(70% 0.18 262.881);
  --b-tabs-item-disabled-color: oklch(85% 0.01 260 / 25%);
  --b-tabs-card-bg: oklch(25% 0.015 260 / 50%);
  --b-tabs-border-color: oklch(35% 0.01 260);
}

[data-prefers-color='dark'] .b-tabs--card .b-tabs__tab--active,
[data-prefers-color='dark'] .b-tabs--editable-card .b-tabs__tab--active {
  background: oklch(20% 0.015 260);
  border-bottom-color: oklch(20% 0.015 260);
}

/* ─────────────────────────────────────────────
   Reduced motion
   ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-tabs {
    --b-tabs-transition-duration: 0ms;
  }

  .b-tabs__panel--animated {
    animation: none;
  }
}
</style>
