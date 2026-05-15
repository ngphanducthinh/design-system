<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, useSlots, watch } from 'vue';
import type { VNode } from 'vue';

import { BTabsContextKey } from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const props = defineProps<{
  /** Unique key identifying this tab pane. */
  tabKey: string;
  /** Tab header label text. Use the `tab` slot for rich labels. */
  tab?: string;
  /** Whether this tab is disabled. @default false */
  disabled?: boolean;
  /** Show close button in editable-card mode. @default true */
  closable?: boolean;
  /** Destroy content when tab is hidden. @default false */
  destroyOnHidden?: boolean;
  /** Force render content even when inactive. @default false */
  forceRender?: boolean;
  /** Keep component state alive when switching away. Overrides global setting. */
  keepAlive?: boolean;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /** Tab pane content. */
  default?: () => unknown;
  /** Custom tab label content. */
  tab?: () => unknown;
}>();

const slots = useSlots();

// ─────────────────────────────────────────────
// Inject parent context
// ─────────────────────────────────────────────
const tabsContext = inject(BTabsContextKey, null);

// ─────────────────────────────────────────────
// Registration helpers
// ─────────────────────────────────────────────
function buildRegistration() {
  return {
    key: props.tabKey,
    label: props.tab,
    disabled: props.disabled,
    closable: props.closable,
    destroyOnHidden: props.destroyOnHidden,
    forceRender: props.forceRender,
    keepAlive: props.keepAlive,
    renderContent: () => (slots.default?.() ?? []) as VNode[],
    renderLabel: slots.tab ? () => slots.tab!() as VNode[] : undefined,
  };
}

onMounted(() => {
  tabsContext?.register(buildRegistration());
});

onBeforeUnmount(() => {
  tabsContext?.unregister(props.tabKey);
});

watch(
  () => [props.tab, props.disabled, props.closable, props.destroyOnHidden, props.forceRender, props.keepAlive],
  () => {
    tabsContext?.update(props.tabKey, buildRegistration());
  },
);
</script>

<template>
  <!-- BTabPane is a registration-only component. All rendering is handled by BTabs. -->
  <slot v-if="false" />
</template>
