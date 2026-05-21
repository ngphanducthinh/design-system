<script setup lang="ts">
import { computed } from 'vue';
import type { BSkeletonButtonShape, BSkeletonButtonSize } from './types';

const {
  active = false,
  block = false,
  shape = 'default',
  size = 'default',
} = defineProps<{
  /** Animated shimmer effect. @default false */
  active?: boolean;
  /** Stretch to full width. @default false */
  block?: boolean;
  /** Button shape. @default 'default' */
  shape?: BSkeletonButtonShape;
  /** Button size. @default 'default' */
  size?: BSkeletonButtonSize;
}>();

const classes = computed(() => [
  'b-skeleton-element',
  'b-skeleton-button',
  `b-skeleton-button--${shape}`,
  `b-skeleton-button--${size}`,
  {
    'b-skeleton-button--block': block,
    'b-skeleton-element--active': active,
  },
]);
</script>

<template>
  <span :class="classes" role="presentation" aria-hidden="true" />
</template>

<style>
.b-skeleton-button {
  display: inline-block;
  vertical-align: top;
  height: var(--b-skeleton-control-height, 32px);
  min-width: var(--b-skeleton-button-min-width, 64px);
  background: var(--b-skeleton-gradient-from-color, oklch(93% 0 0));
  border-radius: var(--b-skeleton-border-radius, 6px);
}

.b-skeleton-button--small {
  height: var(--b-skeleton-control-height-sm, 24px);
  min-width: 48px;
  border-radius: var(--b-skeleton-border-radius-sm, 4px);
}

.b-skeleton-button--large {
  height: var(--b-skeleton-control-height-lg, 40px);
  min-width: 80px;
}

.b-skeleton-button--round {
  border-radius: 100px;
}

.b-skeleton-button--circle {
  width: var(--b-skeleton-control-height, 32px);
  min-width: var(--b-skeleton-control-height, 32px);
  border-radius: 50%;
}
.b-skeleton-button--circle.b-skeleton-button--small {
  width: var(--b-skeleton-control-height-sm, 24px);
  min-width: var(--b-skeleton-control-height-sm, 24px);
}
.b-skeleton-button--circle.b-skeleton-button--large {
  width: var(--b-skeleton-control-height-lg, 40px);
  min-width: var(--b-skeleton-control-height-lg, 40px);
}

.b-skeleton-button--square {
  border-radius: var(--b-skeleton-border-radius-sm, 4px);
}

.b-skeleton-button--block {
  display: block;
  width: 100%;
}
</style>
