<script setup lang="ts">
import { computed } from 'vue';
import type { BSkeletonAvatarShape, BSkeletonAvatarSize } from './types';

const {
  active = false,
  shape = 'circle',
  size = 'default',
} = defineProps<{
  /** Animated shimmer effect. @default false */
  active?: boolean;
  /** Avatar shape. @default 'circle' */
  shape?: BSkeletonAvatarShape;
  /** Avatar size: preset string or pixel number. @default 'default' */
  size?: BSkeletonAvatarSize;
}>();

const sizeStyle = computed<Record<string, string> | undefined>(() => {
  if (typeof size === 'number') {
    return { width: `${size}px`, height: `${size}px`, lineHeight: `${size}px` };
  }
  return undefined;
});

const classes = computed(() => [
  'b-skeleton-element',
  'b-skeleton-avatar',
  `b-skeleton-avatar--${shape}`,
  typeof size === 'string' ? `b-skeleton-avatar--${size}` : null,
  { 'b-skeleton-element--active': active },
]);
</script>

<template>
  <span :class="classes" :style="sizeStyle" role="presentation" aria-hidden="true" />
</template>

<style>
.b-skeleton-avatar {
  display: inline-block;
  vertical-align: top;
  width: var(--b-skeleton-avatar-size-default);
  height: var(--b-skeleton-avatar-size-default);
  background: var(--b-skeleton-gradient-from-color);
}

.b-skeleton-avatar--small {
  width: var(--b-skeleton-avatar-size-small);
  height: var(--b-skeleton-avatar-size-small);
}

.b-skeleton-avatar--large {
  width: var(--b-skeleton-avatar-size-large);
  height: var(--b-skeleton-avatar-size-large);
}

.b-skeleton-avatar--circle {
  border-radius: 50%;
}

.b-skeleton-avatar--square {
  border-radius: var(--b-skeleton-border-radius);
}
</style>
