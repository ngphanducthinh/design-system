<script setup lang="ts">
import { computed } from 'vue';
import type { BSkeletonInputSize } from './types';

const {
  active = false,
  block = false,
  size = 'default',
} = defineProps<{
  /** Animated shimmer effect. @default false */
  active?: boolean;
  /** Stretch to full width. @default false */
  block?: boolean;
  /** Input size. @default 'default' */
  size?: BSkeletonInputSize;
}>();

const classes = computed(() => [
  'b-skeleton-element',
  'b-skeleton-input',
  `b-skeleton-input--${size}`,
  {
    'b-skeleton-input--block': block,
    'b-skeleton-element--active': active,
  },
]);
</script>

<template>
  <span :class="classes" role="presentation" aria-hidden="true" />
</template>

<style>
.b-skeleton-input {
  display: inline-block;
  vertical-align: top;
  height: var(--b-skeleton-control-height, 32px);
  min-width: var(--b-skeleton-input-min-width, 160px);
  background: var(--b-skeleton-gradient-from-color, oklch(93% 0 0));
  border-radius: var(--b-skeleton-border-radius, 6px);
}

.b-skeleton-input--small {
  height: var(--b-skeleton-control-height-sm, 24px);
  min-width: 96px;
  border-radius: var(--b-skeleton-border-radius-sm, 4px);
}

.b-skeleton-input--large {
  height: var(--b-skeleton-control-height-lg, 40px);
  min-width: 200px;
}

.b-skeleton-input--block {
  display: block;
  width: 100%;
}
</style>
