<script setup lang="ts">
import {
  BCommonSize,
  BSkeletonAvatarShape,
  type BSkeletonAvatar,
  type BSkeletonParagraph,
  type BSkeletonTitle,
} from '@/types.ts';
import { computed } from 'vue';

export interface BSkeletonProps {
  /**
   * Whether to show the loading skeleton.
   */
  loading?: boolean;
  /**
   * Whether to show the active shimmer animation.
   */
  active?: boolean;
  /**
   * Avatar placeholder configuration.
   */
  avatar?: boolean | BSkeletonAvatar;
  /**
   * Title placeholder configuration.
   */
  title?: boolean | BSkeletonTitle;
  /**
   * Paragraph placeholder configuration.
   */
  paragraph?: boolean | BSkeletonParagraph;
  /**
   * Whether to render blocks with rounded corners.
   */
  round?: boolean;
}

const props = withDefaults(defineProps<BSkeletonProps>(), {
  loading: true,
  active: false,
  avatar: false,
  title: true,
  paragraph: true,
  round: false,
});

const normalizeWidth = (value?: number | string) => {
  if (value === undefined || value === null) {
    return undefined;
  }
  return typeof value === 'number' ? `${value}px` : value;
};

const normalizedAvatar = computed<BSkeletonAvatar | null>(() => {
  if (!props.avatar) {
    return null;
  }
  if (props.avatar === true) {
    return {
      size: BCommonSize.Medium,
      shape: BSkeletonAvatarShape.Circle,
    };
  }
  return {
    size: props.avatar.size ?? BCommonSize.Medium,
    shape: props.avatar.shape ?? BSkeletonAvatarShape.Circle,
  };
});

const normalizedTitle = computed<BSkeletonTitle | null>(() => {
  if (!props.title) {
    return null;
  }
  return props.title === true ? {} : props.title;
});

const normalizedParagraph = computed<BSkeletonParagraph | null>(() => {
  if (!props.paragraph) {
    return null;
  }
  return props.paragraph === true ? {} : props.paragraph;
});

const hasParagraph = computed(() => {
  if (!normalizedParagraph.value) {
    return false;
  }
  const rows = normalizedParagraph.value.rows ?? 3;
  return rows > 0;
});

const paragraphRowWidths = computed(() => {
  if (!normalizedParagraph.value) {
    return [];
  }
  const rows = Math.max(0, normalizedParagraph.value.rows ?? 3);
  if (rows === 0) {
    return [];
  }
  const widths = normalizedParagraph.value.width;
  if (Array.isArray(widths) && widths.length > 0) {
    return Array.from({ length: rows }, (_, index) => widths[index] ?? widths[widths.length - 1]);
  }
  if (widths !== undefined) {
    return Array.from({ length: rows }, () => widths);
  }
  return Array.from({ length: rows }, (_, index) => (index === rows - 1 ? '61%' : '100%'));
});

const titleWidth = computed(() => normalizeWidth(normalizedTitle.value?.width ?? '38%'));

const avatarSizeClass = computed(() => {
  if (!normalizedAvatar.value || typeof normalizedAvatar.value.size === 'number') {
    return '';
  }
  switch (normalizedAvatar.value.size) {
    case BCommonSize.Small:
      return 'b:h-8 b:w-8';
    case BCommonSize.Large:
      return 'b:h-12 b:w-12';
    case BCommonSize.Medium:
    default:
      return 'b:h-10 b:w-10';
  }
});

const avatarSizeStyle = computed(() => {
  if (!normalizedAvatar.value || typeof normalizedAvatar.value.size !== 'number') {
    return undefined;
  }
  const size = normalizedAvatar.value.size;
  return {
    width: `${size}px`,
    height: `${size}px`,
  };
});

const lineRadiusClass = computed(() => (props.round ? 'b:rounded-full' : 'b:rounded-md'));
const avatarRadiusClass = computed(() => {
  if (!normalizedAvatar.value) {
    return '';
  }
  if (normalizedAvatar.value.shape === BSkeletonAvatarShape.Circle) {
    return 'b:rounded-full';
  }
  return props.round ? 'b:rounded-lg' : 'b:rounded-md';
});

const blockBaseClass = computed(() =>
  props.active
    ? 'b:bg-gradient-to-r b:from-zinc-200 b:via-zinc-100 b:to-zinc-200'
    : 'b:bg-zinc-200',
);
</script>

<template>
  <div
    v-if="loading"
    class="b-skeleton b:w-full"
    :class="[{ 'b-skeleton--active': active }]"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <span class="b:sr-only">Loading</span>
    <div class="b:flex b:items-start b:gap-x-4">
      <div
        v-if="normalizedAvatar"
        class="b-skeleton__block b-skeleton__avatar b:flex-shrink-0"
        :class="[blockBaseClass, avatarSizeClass, avatarRadiusClass]"
        :style="avatarSizeStyle"
        aria-hidden="true"
      />
      <div class="b:flex b:flex-1 b:flex-col b:gap-y-3">
        <div
          v-if="normalizedTitle"
          class="b-skeleton__block b-skeleton__title b:h-4"
          :class="[blockBaseClass, lineRadiusClass]"
          :style="{ width: titleWidth }"
          aria-hidden="true"
        />
        <div v-if="hasParagraph" class="b:flex b:flex-col b:gap-y-2">
          <div
            v-for="(width, index) in paragraphRowWidths"
            :key="`row-${index}`"
            class="b-skeleton__block b-skeleton__line b:h-3"
            :class="[blockBaseClass, lineRadiusClass]"
            :style="{ width: normalizeWidth(width) }"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  </div>
  <template v-else>
    <slot />
  </template>
</template>

<style scoped>
.b-skeleton--active .b-skeleton__block {
  background-size: 400% 100%;
  animation: b-skeleton-shimmer 1.4s ease infinite;
}

@keyframes b-skeleton-shimmer {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
