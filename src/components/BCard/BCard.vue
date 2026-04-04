<script setup lang="ts">
import { computed, ref, useId, useSlots, watch } from 'vue';

import type { BCardTabItem } from '@/types';
import { BCardSize, BCardType } from '@/types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  bordered = true,
  hoverable = false,
  loading = false,
  size = BCardSize.Default,
  type = BCardType.Default,
  title,
  extra,
  tabList,
  activeTabKey,
  defaultActiveTabKey,
  tabBarExtraContent,
  tabProps,
} = defineProps<{
  /** Whether to render the card border. @default true */
  bordered?: boolean;
  /** Lift the card on hover. @default false */
  hoverable?: boolean;
  /** Shows a placeholder while content is loading. @default false */
  loading?: boolean;
  /** Size of the card. @default 'default' */
  size?: `${BCardSize}`;
  /** Card type: default or inner. @default 'default' */
  type?: `${BCardType}`;
  /** Card title */
  title?: string;
  /** Content to render in the top-right corner of the card */
  extra?: string;
  /** List of tabs at the top of the card */
  tabList?: BCardTabItem[];
  /** Active tab key (controlled). Use with v-model:activeTabKey */
  activeTabKey?: string;
  /** Default active tab key (uncontrolled) */
  defaultActiveTabKey?: string;
  /** Extra content in the tab bar */
  tabBarExtraContent?: string;
  /** Additional HTML attributes to pass to the tab buttons */
  tabProps?: Record<string, unknown>;
}>();

// ─────────────────────────────────────────────
// Emits
// ─────────────────────────────────────────────
const emit = defineEmits<{
  /** Fired when the active tab changes */
  (e: 'tabChange', key: string): void;
  /** Sync active tab key for v-model:activeTabKey */
  (e: 'update:activeTabKey', key: string): void;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /** Main content of the card */
  default?: (props: Record<string, never>) => unknown;
  /** Card title area. Overrides the `title` prop */
  title?: (props: Record<string, never>) => unknown;
  /** Extra content in the top-right corner. Overrides the `extra` prop */
  extra?: (props: Record<string, never>) => unknown;
  /** Cover image/content above the card body */
  cover?: (props: Record<string, never>) => unknown;
  /** Action items rendered at the card footer */
  actions?: (props: Record<string, never>) => unknown;
  /** Tab bar extra content slot. Overrides the `tabBarExtraContent` prop */
  tabBarExtraContent?: (props: Record<string, never>) => unknown;
  /** Custom tab rendering. Receives { item: BCardTabItem, isActive: boolean } */
  customTab?: (props: { item: BCardTabItem; isActive: boolean }) => unknown;
}>();

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const slots = useSlots();
const cardId = useId();

const internalActiveTab = ref(
  defaultActiveTabKey ?? (tabList && tabList.length > 0 ? tabList[0].key : ''),
);

const currentTabKey = computed(() =>
  activeTabKey !== undefined ? activeTabKey : internalActiveTab.value,
);

watch(
  () => activeTabKey,
  (val) => {
    if (val !== undefined) {
      internalActiveTab.value = val;
    }
  },
);

// ─────────────────────────────────────────────
// Computed
// ─────────────────────────────────────────────
const hasHeader = computed(() => {
  return !!(title || slots.title || extra || slots.extra || (tabList && tabList.length > 0));
});

const rootClasses = computed(() => [
  'b-card',
  {
    'b-card--bordered': bordered,
    'b-card--hoverable': hoverable,
    'b-card--loading': loading,
    'b-card--small': size === BCardSize.Small,
    'b-card--inner': type === BCardType.Inner,
    'b-card--has-tabs': tabList && tabList.length > 0,
    'b-card--has-cover': !!slots.cover,
    'b-card--has-actions': !!slots.actions,
  },
]);

const tabPanelId = computed(() => `${cardId}-tabpanel`);

// ─────────────────────────────────────────────
// Tab handling
// ─────────────────────────────────────────────
function handleTabClick(key: string) {
  internalActiveTab.value = key;
  emit('update:activeTabKey', key);
  emit('tabChange', key);
}

function handleTabKeydown(event: KeyboardEvent, index: number) {
  if (!tabList) return;
  const enabledTabs = tabList.filter((t) => !t.disabled);
  const currentEnabled = enabledTabs.findIndex((t) => t.key === tabList[index].key);
  if (currentEnabled === -1) return;

  let targetIndex = -1;

  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault();
    targetIndex = (currentEnabled + 1) % enabledTabs.length;
  } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault();
    targetIndex = (currentEnabled - 1 + enabledTabs.length) % enabledTabs.length;
  } else if (event.key === 'Home') {
    event.preventDefault();
    targetIndex = 0;
  } else if (event.key === 'End') {
    event.preventDefault();
    targetIndex = enabledTabs.length - 1;
  }

  if (targetIndex >= 0) {
    const targetKey = enabledTabs[targetIndex].key;
    handleTabClick(targetKey);
    const tabEl = document.getElementById(`${cardId}-tab-${targetKey}`);
    tabEl?.focus();
  }
}

// ─────────────────────────────────────────────
// Loading skeleton lines
// ─────────────────────────────────────────────
const skeletonRows = [100, 75, 90, 60];
</script>

<template>
  <div :class="rootClasses">
    <!-- Cover -->
    <div v-if="$slots.cover" class="b-card__cover">
      <slot name="cover" />
    </div>

    <!-- Header -->
    <div v-if="hasHeader" class="b-card__head">
      <div class="b-card__head-wrapper">
        <div v-if="title || $slots.title" class="b-card__head-title">
          <slot name="title">{{ title }}</slot>
        </div>
        <div v-if="extra || $slots.extra" class="b-card__extra">
          <slot name="extra">{{ extra }}</slot>
        </div>
      </div>

      <!-- Tabs -->
      <div v-if="tabList && tabList.length > 0" class="b-card__tabs">
        <div
          role="tablist"
          class="b-card__tab-list"
          :aria-label="title ? `${title} tabs` : 'Card tabs'"
        >
          <button
            v-for="(tab, index) in tabList"
            :id="`${cardId}-tab-${tab.key}`"
            :key="tab.key"
            role="tab"
            class="b-card__tab"
            :class="{
              'b-card__tab--active': currentTabKey === tab.key,
              'b-card__tab--disabled': tab.disabled,
            }"
            :aria-selected="currentTabKey === tab.key"
            :aria-controls="tabPanelId"
            :tabindex="currentTabKey === tab.key ? 0 : -1"
            :disabled="tab.disabled"
            v-bind="tabProps"
            @click="handleTabClick(tab.key)"
            @keydown="handleTabKeydown($event, index)"
          >
            <slot name="customTab" :item="tab" :is-active="currentTabKey === tab.key">
              {{ tab.tab }}
            </slot>
          </button>
        </div>
        <div v-if="tabBarExtraContent || $slots.tabBarExtraContent" class="b-card__tab-extra">
          <slot name="tabBarExtraContent">{{ tabBarExtraContent }}</slot>
        </div>
      </div>
    </div>

    <!-- Body -->
    <div
      class="b-card__body"
      :id="tabList && tabList.length > 0 ? tabPanelId : undefined"
      :role="tabList && tabList.length > 0 ? 'tabpanel' : undefined"
      :aria-labelledby="
        tabList && tabList.length > 0 ? `${cardId}-tab-${currentTabKey}` : undefined
      "
    >
      <!-- Loading skeleton -->
      <div
        v-if="loading"
        class="b-card__loading"
        role="status"
        aria-busy="true"
        aria-label="Loading card content"
      >
        <div
          v-for="(width, i) in skeletonRows"
          :key="i"
          class="b-card__loading-line"
          :style="{ width: `${width}%` }"
        />
      </div>

      <!-- Content -->
      <template v-else>
        <slot />
      </template>
    </div>

    <!-- Actions -->
    <div v-if="$slots.actions" class="b-card__actions" role="group" aria-label="Card actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style>
/* ─────────────────────────────────────────────
   BCard — CSS custom properties (scoped to root)
   ───────────────────────────────────────────── */
.b-card {
  /* Surface */
  --b-card-bg: oklch(100% 0 0);
  --b-card-color: oklch(20% 0.02 260);
  --b-card-border-radius: 8px;
  --b-card-border-color: oklch(85% 0.01 260);
  --b-card-border-width: 1px;
  --b-card-shadow: 0 1px 2px 0 oklch(0% 0 0 / 6%), 0 1px 3px 0 oklch(0% 0 0 / 10%);
  --b-card-shadow-hover: 0 4px 12px oklch(0% 0 0 / 12%);
  --b-card-transition-duration: 200ms;

  /* Head */
  --b-card-head-padding: 16px 24px;
  --b-card-head-padding-sm: 8px 16px;
  --b-card-head-font-size: 16px;
  --b-card-head-font-size-sm: 14px;
  --b-card-head-font-weight: 600;
  --b-card-head-color: oklch(20% 0.02 260);
  --b-card-head-border-color: oklch(90% 0.01 260);
  --b-card-head-min-height: 56px;
  --b-card-head-min-height-sm: 40px;

  /* Body */
  --b-card-body-padding: 24px;
  --b-card-body-padding-sm: 16px;

  /* Extra */
  --b-card-extra-color: oklch(45% 0.02 260);
  --b-card-extra-font-size: 14px;

  /* Cover */
  --b-card-cover-border-radius: var(--b-card-border-radius) var(--b-card-border-radius) 0 0;

  /* Actions */
  --b-card-actions-padding: 12px 24px;
  --b-card-actions-border-color: oklch(90% 0.01 260);
  --b-card-actions-bg: transparent;

  /* Tabs */
  --b-card-tab-color: oklch(45% 0.02 260);
  --b-card-tab-active-color: oklch(46% 0.24 264);
  --b-card-tab-hover-color: oklch(46% 0.24 264);
  --b-card-tab-disabled-color: oklch(70% 0.01 260);
  --b-card-tab-bar-border-color: oklch(90% 0.01 260);
  --b-card-tab-indicator-color: oklch(46% 0.24 264);
  --b-card-tab-font-size: 14px;
  --b-card-tab-padding: 12px 16px;

  /* Inner card */
  --b-card-inner-bg: oklch(97% 0 0);

  /* Loading */
  --b-card-loading-line-bg: oklch(92% 0.01 260);
  --b-card-loading-shine-color: oklch(96% 0 0);
  --b-card-loading-line-height: 16px;
  --b-card-loading-line-radius: 4px;
  --b-card-loading-gap: 12px;

  /* Layout */
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--b-card-bg);
  color: var(--b-card-color);
  border-radius: var(--b-card-border-radius);
  font-size: 14px;
  line-height: 1.5715;
  box-sizing: border-box;
  transition:
    box-shadow var(--b-card-transition-duration) ease,
    border-color var(--b-card-transition-duration) ease;
}

/* ── Border ── */
.b-card--bordered {
  border: var(--b-card-border-width) solid var(--b-card-border-color);
}

.b-card:not(.b-card--bordered) {
  box-shadow: var(--b-card-shadow);
}

/* ── Hoverable ── */
.b-card--hoverable {
  cursor: pointer;
}

.b-card--hoverable:hover {
  box-shadow: var(--b-card-shadow-hover);
}

.b-card--bordered.b-card--hoverable:hover {
  border-color: transparent;
  box-shadow: var(--b-card-shadow-hover);
}

/* ── Inner card ── */
.b-card--inner {
  background: var(--b-card-inner-bg);
}

/* ── Small size ── */
.b-card--small .b-card__head {
  padding: var(--b-card-head-padding-sm);
  min-height: var(--b-card-head-min-height-sm);
  font-size: var(--b-card-head-font-size-sm);
}

.b-card--small .b-card__body {
  padding: var(--b-card-body-padding-sm);
}

/* ── Cover ── */
.b-card__cover {
  overflow: hidden;
  border-radius: var(--b-card-cover-border-radius);
}

.b-card--bordered .b-card__cover {
  margin-top: -1px;
  margin-inline: -1px;
}

.b-card__cover img,
.b-card__cover video {
  display: block;
  width: 100%;
  height: auto;
}

/* ── Head ── */
.b-card__head {
  display: flex;
  flex-direction: column;
  padding: var(--b-card-head-padding);
  border-bottom: 1px solid var(--b-card-head-border-color);
  min-height: var(--b-card-head-min-height);
  font-size: var(--b-card-head-font-size);
  box-sizing: border-box;
}

.b-card--has-tabs .b-card__head {
  padding-bottom: 0;
  border-bottom: none;
}

.b-card__head-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.b-card__head-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: var(--b-card-head-font-weight);
  color: var(--b-card-head-color);
}

.b-card__extra {
  flex: none;
  color: var(--b-card-extra-color);
  font-size: var(--b-card-extra-font-size);
  font-weight: 400;
}

/* ── Tabs ── */
.b-card__tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--b-card-tab-bar-border-color);
  margin-top: 4px;
}

.b-card__tab-list {
  display: flex;
  gap: 0;
}

.b-card__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--b-card-tab-padding);
  border: none;
  background: none;
  color: var(--b-card-tab-color);
  font-size: var(--b-card-tab-font-size);
  font-family: inherit;
  cursor: pointer;
  transition: color var(--b-card-transition-duration) ease;
  outline: none;
}

.b-card__tab::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--b-card-tab-indicator-color);
  border-radius: 1px;
  transition:
    width var(--b-card-transition-duration) ease,
    left var(--b-card-transition-duration) ease;
}

.b-card__tab:hover:not(:disabled) {
  color: var(--b-card-tab-hover-color);
}

.b-card__tab:focus-visible {
  outline: 2px solid var(--b-card-tab-active-color);
  outline-offset: -2px;
  border-radius: 4px;
}

.b-card__tab--active {
  color: var(--b-card-tab-active-color);
  font-weight: 500;
}

.b-card__tab--active::after {
  width: 100%;
  left: 0;
}

.b-card__tab--disabled {
  color: var(--b-card-tab-disabled-color);
  cursor: not-allowed;
}

.b-card__tab-extra {
  flex: none;
  padding: 0 16px;
  color: var(--b-card-extra-color);
  font-size: var(--b-card-extra-font-size);
}

/* ── Body ── */
.b-card__body {
  flex: 1;
  padding: var(--b-card-body-padding);
}

/* ── Actions ── */
.b-card__actions {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  padding: var(--b-card-actions-padding);
  border-top: 1px solid var(--b-card-actions-border-color);
  background: var(--b-card-actions-bg);
  border-radius: 0 0 var(--b-card-border-radius) var(--b-card-border-radius);
}

/* ── Loading skeleton ── */
.b-card__loading {
  display: flex;
  flex-direction: column;
  gap: var(--b-card-loading-gap);
}

.b-card__loading-line {
  height: var(--b-card-loading-line-height);
  border-radius: var(--b-card-loading-line-radius);
  background: linear-gradient(
    90deg,
    var(--b-card-loading-line-bg) 25%,
    var(--b-card-loading-shine-color) 50%,
    var(--b-card-loading-line-bg) 75%
  );
  background-size: 200% 100%;
  animation: b-card-loading-shimmer 1.5s infinite ease-in-out;
}

@keyframes b-card-loading-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-card {
  --b-card-bg: oklch(20% 0.02 260);
  --b-card-color: oklch(88% 0.01 260);
  --b-card-border-color: oklch(35% 0.02 260);
  --b-card-shadow: 0 1px 2px 0 oklch(0% 0 0 / 20%), 0 1px 3px 0 oklch(0% 0 0 / 25%);
  --b-card-shadow-hover: 0 4px 12px oklch(0% 0 0 / 30%);
  --b-card-head-color: oklch(92% 0.01 260);
  --b-card-head-border-color: oklch(35% 0.02 260);
  --b-card-extra-color: oklch(65% 0.01 260);
  --b-card-tab-color: oklch(65% 0.01 260);
  --b-card-tab-active-color: oklch(70% 0.18 264);
  --b-card-tab-hover-color: oklch(70% 0.18 264);
  --b-card-tab-disabled-color: oklch(40% 0.01 260);
  --b-card-tab-bar-border-color: oklch(35% 0.02 260);
  --b-card-tab-indicator-color: oklch(70% 0.18 264);
  --b-card-actions-border-color: oklch(35% 0.02 260);
  --b-card-inner-bg: oklch(25% 0.02 260);
  --b-card-loading-line-bg: oklch(30% 0.02 260);
  --b-card-loading-shine-color: oklch(35% 0.02 260);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-card {
    --b-card-transition-duration: 0ms;
  }

  .b-card__loading-line {
    animation: none;
  }
}
</style>
