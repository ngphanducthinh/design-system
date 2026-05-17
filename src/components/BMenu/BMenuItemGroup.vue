<script setup lang="ts">
import { inject } from 'vue';
import BMenuItem from './BMenuItem.vue';
import { BMenuContextKey, type BMenuContext, type BMenuItemType } from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    /** Group title label. */
    label?: string;
    /** Items within this group. */
    children?: BMenuItemType[];
  }>(),
  {
    label: '',
    children: () => [],
  },
);

defineSlots<{
  default?(): unknown;
  title?(): unknown;
}>();

const menu = inject<BMenuContext>(BMenuContextKey)!;
</script>

<template>
  <li class="b-menu-item-group" role="presentation">
    <div v-if="!menu.inlineCollapsed.value" class="b-menu-item-group__title" role="presentation">
      <slot name="title">{{ props.label }}</slot>
    </div>
    <ul class="b-menu-item-group__list" role="group" :aria-label="props.label">
      <slot>
        <BMenuItem
          v-for="item in props.children"
          :key="item.key"
          :item-key="item.key"
          :label="item.label"
          :icon="item.icon"
          :disabled="item.disabled"
          :danger="item.danger"
          :extra="item.extra"
        />
      </slot>
    </ul>
  </li>
</template>

<style>
/* ─────────────────────────────────────────────
   BMenuItemGroup
   ───────────────────────────────────────────── */
.b-menu-item-group {
  list-style: none;
}

.b-menu-item-group__title {
  padding: 8px 16px 4px;
  color: var(--b-menu-group-title-color);
  font-size: var(--b-menu-group-title-font-size);
  line-height: var(--b-menu-group-title-line-height);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.b-menu-item-group__list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
