<script setup lang="ts">
import { computed } from 'vue';

const { active = false, fullSize = false } = defineProps<{
  /** Animated shimmer effect. @default false */
  active?: boolean;
  /** Stretch to fill the parent's width and height. @default false */
  fullSize?: boolean;
}>();

defineSlots<{
  /** Custom content placed inside the placeholder block (e.g., an icon). */
  default?(): unknown;
}>();

const classes = computed(() => [
  'b-skeleton-element',
  'b-skeleton-node',
  {
    'b-skeleton-node--full-size': fullSize,
    'b-skeleton-element--active': active,
  },
]);
</script>

<template>
  <div :class="classes" role="presentation" aria-hidden="true">
    <slot />
  </div>
</template>

<style>
.b-skeleton-node {
  display: inline-flex;
  vertical-align: top;
  align-items: center;
  justify-content: center;
  width: var(--b-skeleton-image-size, 96px);
  height: var(--b-skeleton-image-size, 96px);
  background: var(--b-skeleton-gradient-from-color, oklch(93% 0 0));
  border-radius: var(--b-skeleton-border-radius, 6px);
  color: oklch(75% 0 0);
}

.b-skeleton-node--full-size {
  display: flex;
  width: 100%;
  height: 100%;
}
</style>
