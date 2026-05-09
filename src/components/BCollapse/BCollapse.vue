<script setup lang="ts">
/**
 * BCollapse is the group/container component (AntD Collapse equivalent).
 * It manages active keys and provides context to BCollapsePanel children.
 *
 * This is the same component as BCollapseGroup, exported under both names
 * for flexibility. Use BCollapse + BCollapsePanel in new code.
 */
import { computed, provide, ref, watch } from 'vue';
import {
  BCollapseGroupContextKey,
  type BCollapseCollapsible,
  type BCollapseExpandIconPosition,
  type BCollapseGroupContext,
  type BCollapseSize,
} from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    /** Currently active panel key(s). Use with v-model for controlled mode. */
    modelValue?: (string | number)[];
    /** Initial active panel key(s) for uncontrolled mode. */
    defaultActiveKey?: (string | number)[];
    /** Accordion mode - only one panel open at a time. */
    accordion?: boolean;
    /** Show border around the collapse. @default true */
    bordered?: boolean;
    /** Group-level collapsible trigger: 'header' | 'icon' | 'disabled'. */
    collapsible?: BCollapseCollapsible;
    /** Destroy (unmount) inactive panel content. @default false */
    destroyInactivePanel?: boolean;
    /** Position of the expand icon. @default 'start' */
    expandIconPosition?: BCollapseExpandIconPosition;
    /** Ghost mode - borderless with transparent background. @default false */
    ghost?: boolean;
    /** Size of the collapse. @default 'default' */
    size?: BCollapseSize;
  }>(),
  {
    modelValue: undefined,
    defaultActiveKey: () => [],
    accordion: false,
    bordered: true,
    collapsible: undefined,
    destroyInactivePanel: false,
    expandIconPosition: 'start',
    ghost: false,
    size: 'default',
  },
);

const emit = defineEmits<{
  'update:modelValue': [keys: (string | number)[]];
  change: [keys: (string | number)[]];
}>();

defineSlots<{
  default?(): unknown;
}>();

// ─────────────────────────────────────────────
// Active keys state (controlled + uncontrolled)
// ─────────────────────────────────────────────
const isControlled = computed(() => props.modelValue !== undefined);
const internalKeys = ref<(string | number)[]>([...props.defaultActiveKey]);

const activeKeys = computed(() =>
  isControlled.value ? (props.modelValue ?? []) : internalKeys.value,
);

function setActiveKeys(keys: (string | number)[]) {
  if (!isControlled.value) {
    internalKeys.value = keys;
  }
  emit('update:modelValue', keys);
  emit('change', keys);
}

watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined) {
      internalKeys.value = [...val];
    }
  },
);

// ─────────────────────────────────────────────
// Context for child panels
// ─────────────────────────────────────────────
function isActive(key: string | number): boolean {
  return activeKeys.value.includes(key);
}

function toggle(key: string | number) {
  const keys = [...activeKeys.value];
  const idx = keys.indexOf(key);

  if (props.accordion) {
    setActiveKeys(idx >= 0 ? [] : [key]);
  } else {
    if (idx >= 0) {
      keys.splice(idx, 1);
    } else {
      keys.push(key);
    }
    setActiveKeys(keys);
  }
}

const context: BCollapseGroupContext = {
  isActive,
  toggle,
  collapsible: computed(() => props.collapsible),
  expandIconPosition: computed(() => props.expandIconPosition),
  bordered: computed(() => props.bordered),
  ghost: computed(() => props.ghost),
  size: computed(() => props.size),
};

provide(BCollapseGroupContextKey, context);
</script>

<template>
  <div
    class="b-collapse"
    :class="{
      'b-collapse--bordered': bordered,
      'b-collapse--borderless': !bordered,
      'b-collapse--ghost': ghost,
      'b-collapse--small': size === 'small',
    }"
    role="presentation"
  >
    <slot />
  </div>
</template>

<style>
/* ─────────────────────────────────────────────
   BCollapse (Group) styles
   ───────────────────────────────────────────── */
.b-collapse {
  --b-collapse-border-color: oklch(88% 0 0);
  --b-collapse-border-radius: 8px;
}

[data-prefers-color='dark'] .b-collapse {
  --b-collapse-border-color: oklch(32% 0.005 260);
}

.b-collapse {
  box-sizing: border-box;
  font-family: inherit;
}

/* ── Bordered (default) ─────────────────────── */
.b-collapse--bordered {
  border: 1px solid var(--b-collapse-border-color);
  border-radius: var(--b-collapse-border-radius);
  overflow: hidden;
}

/* ── Borderless ─────────────────────────────── */
.b-collapse--borderless {
  background: transparent;
}

.b-collapse--borderless .b-collapse-panel {
  border-bottom: 1px solid var(--b-collapse-border-color);
}

.b-collapse--borderless .b-collapse-panel:last-child {
  border-bottom: none;
}

.b-collapse--borderless .b-collapse-panel__body {
  background: transparent;
}

/* ── Ghost mode ─────────────────────────────── */
.b-collapse--ghost {
  border: none;
  background: transparent;
}

.b-collapse--ghost .b-collapse-panel {
  border-bottom: none;
  margin-bottom: 8px;
}

.b-collapse--ghost .b-collapse-panel:last-child {
  margin-bottom: 0;
}

.b-collapse--ghost .b-collapse-panel__header {
  border-radius: var(--b-collapse-border-radius);
}

.b-collapse--ghost .b-collapse-panel__body {
  background: transparent;
  border-top: none;
}

/* ── Small size ─────────────────────────────── */
.b-collapse--small .b-collapse-panel__header {
  padding: 8px 12px;
  font-size: 13px;
}

.b-collapse--small .b-collapse-panel__body {
  padding: 12px;
  font-size: 13px;
}
</style>
