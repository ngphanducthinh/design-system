<script setup lang="ts">
import { BAvatarShape, BAvatarSize } from '@/types.ts';
import { computed, nextTick, onMounted, ref, useId, watch } from 'vue';

// ─────────────────────────────────────────────
// Props & emits
// ─────────────────────────────────────────────
const {
  shape = BAvatarShape.Circle,
  size = BAvatarSize.Default,
  src = '',
  srcSet = '',
  alt = '',
  icon = false,
  gap = 4,
  crossOrigin,
  draggable,
} = defineProps<{
  /**
   * Shape of the avatar.
   * @default 'circle'
   */
  shape?: `${BAvatarShape}`;
  /**
   * Size of the avatar. Can be a preset string or a custom pixel number.
   * @default 'default'
   */
  size?: `${BAvatarSize}` | number;
  /**
   * Image source URL for the avatar.
   */
  src?: string;
  /**
   * Srcset attribute for responsive image sources.
   */
  srcSet?: string;
  /**
   * Alt text for the image avatar.
   */
  alt?: string;
  /**
   * Whether the default slot contains an icon (applies icon styling).
   * @default false
   */
  icon?: boolean;
  /**
   * Pixel gap between the text content and the avatar edges for auto-scaling.
   * @default 4
   */
  gap?: number;
  /**
   * CORS setting for the image element.
   */
  crossOrigin?: '' | 'anonymous' | 'use-credentials';
  /**
   * Whether the image is draggable.
   */
  draggable?: boolean;
}>();

const emit = defineEmits<{
  /**
   * Fired when the image fails to load. Allows fallback to icon/text.
   */
  (e: 'error', event: Event): void;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
const slots = defineSlots<{
  /** Fallback content when no src or image fails: text or icon. */
  default?(): unknown;
  /** Custom icon slot (replaces default icon fallback). */
  icon?(): unknown;
}>();

// ─────────────────────────────────────────────
// Internal state
// ─────────────────────────────────────────────
const avatarId = useId();
const isImgExist = ref(true);
const textRef = ref<HTMLSpanElement | null>(null);
const avatarRef = ref<HTMLSpanElement | null>(null);
const textScale = ref(1);

// ─────────────────────────────────────────────
// Derived state
// ─────────────────────────────────────────────
const isCustomSize = computed(() => typeof size === 'number');
const sizeLabel = computed(() => (isCustomSize.value ? undefined : size));

const hasImage = computed(() => src && isImgExist.value);
const hasIcon = computed(() => icon || Boolean(slots.icon));
const hasText = computed(() => !hasImage.value && !hasIcon.value && Boolean(slots.default));

const rootClasses = computed(() => [
  'b-avatar',
  `b-avatar--${shape}`,
  {
    [`b-avatar--${sizeLabel.value}`]: !isCustomSize.value,
    'b-avatar--image': hasImage.value,
    'b-avatar--icon': hasIcon.value,
  },
]);

const rootStyle = computed(() => {
  if (!isCustomSize.value) return undefined;
  const px = `${size}px`;
  return {
    width: px,
    height: px,
    lineHeight: px,
    fontSize: `${(size as number) / 2}px`,
  };
});

const textStyle = computed(() => {
  if (textScale.value === 1) return undefined;
  return {
    transform: `scale(${textScale.value}) translateX(-50%)`,
  };
});

const ariaLabel = computed(() => {
  if (alt) return alt;
  return 'Avatar';
});

// ─────────────────────────────────────────────
// Image error handling
// ─────────────────────────────────────────────
function handleImgError(e: Event) {
  isImgExist.value = false;
  emit('error', e);
}

// Reset image state when src changes
watch(
  () => src,
  () => {
    isImgExist.value = true;
  },
);

// ─────────────────────────────────────────────
// Text auto-scaling
// ─────────────────────────────────────────────
function scaleText() {
  if (!textRef.value || !avatarRef.value) return;
  const avatarWidth = avatarRef.value.offsetWidth;
  const textWidth = textRef.value.offsetWidth;
  const availableWidth = avatarWidth - gap * 2;
  if (availableWidth <= 0) {
    textScale.value = 1;
    return;
  }
  textScale.value = textWidth > availableWidth ? availableWidth / textWidth : 1;
}

onMounted(() => {
  nextTick(scaleText);
});

watch([() => gap, hasText], () => {
  nextTick(scaleText);
});
</script>

<template>
  <span
    :id="avatarId"
    ref="avatarRef"
    :class="rootClasses"
    :style="rootStyle"
    role="img"
    :aria-label="ariaLabel"
  >
    <!-- Image avatar -->
    <img
      v-if="hasImage"
      class="b-avatar__image"
      :src="src"
      :srcset="srcSet || undefined"
      :alt="alt"
      :crossorigin="crossOrigin"
      :draggable="draggable"
      @error="handleImgError"
    />

    <!-- Icon avatar -->
    <span v-else-if="hasIcon" class="b-avatar__icon" aria-hidden="true">
      <slot name="icon">
        <slot />
      </slot>
    </span>

    <!-- Text avatar (auto-scaled) -->
    <span
      v-else-if="hasText"
      ref="textRef"
      class="b-avatar__text"
      :style="textStyle"
      aria-hidden="true"
    >
      <slot />
    </span>

    <!-- Empty fallback -->
    <span v-else class="b-avatar__icon b-avatar__icon--fallback" aria-hidden="true">
      <svg viewBox="64 64 896 896" fill="currentColor" width="1em" height="1em" aria-hidden="true">
        <path
          d="M512 580c-123.7 0-224-100.3-224-224S388.3 132 512 132s224 100.3 224 224-100.3 224-224 224zm0-384c-88.4 0-160 71.6-160 160s71.6 160 160 160 160-71.6 160-160-71.6-160-160-160zm370 766.7c-3.7-73.2-32.7-142.4-84.3-200.1C741.5 701.6 660.1 668 574 652.2c-8.6-1.6-17.5 1.3-23.4 7.5-25.5 27.1-59.5 42.3-95.6 42.3s-70.1-15.2-95.6-42.3c-5.9-6.2-14.8-9.1-23.4-7.5-86.1 15.8-167.5 49.4-223.7 110.4-51.6 57.7-80.6 126.9-84.3 200.1-0.4 8.5 6.4 15.3 14.9 15.3h60.3c8 0 14.6-6.2 15-14.2 3.1-58.7 25.6-114 65.2-160.1 42.3-49.2 101.5-83.7 167.3-99.1 28.7 26.8 66.5 42 106.3 42s77.6-15.2 106.3-42c65.8 15.4 125 49.9 167.3 99.1 39.6 46.1 62.1 101.4 65.2 160.1 0.4 8 7 14.2 15 14.2h60.3c8.5 0 15.3-6.8 14.9-15.3z"
        />
      </svg>
    </span>
  </span>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (tokens)
   ──────────────────────────────────────────── */
.b-avatar {
  /* Sizes */
  --b-avatar-size-small: 24px;
  --b-avatar-size-default: 32px;
  --b-avatar-size-large: 40px;

  /* Font sizes */
  --b-avatar-font-size-small: 14px;
  --b-avatar-font-size-default: 18px;
  --b-avatar-font-size-large: 24px;

  /* Colors */
  --b-avatar-bg: oklch(50% 0.06 240);
  --b-avatar-color: oklch(100% 0 0);
  --b-avatar-icon-color: oklch(100% 0 0);

  /* Shape */
  --b-avatar-border-radius-square: 6px;

  /* Transition */
  --b-avatar-transition-duration: 200ms;
}

/* ── Dark mode ───────────────────────────────── */
[data-prefers-color='dark'] .b-avatar {
  --b-avatar-bg: oklch(40% 0.03 240);
  --b-avatar-color: oklch(90% 0.01 240);
  --b-avatar-icon-color: oklch(90% 0.01 240);
}

/* ─────────────────────────────────────────────
   Base layout
   ───────────────────────────────────────────── */
.b-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  white-space: nowrap;
  text-align: center;
  vertical-align: middle;
  background: var(--b-avatar-bg);
  color: var(--b-avatar-color);
  width: var(--b-avatar-size-default);
  height: var(--b-avatar-size-default);
  line-height: var(--b-avatar-size-default);
  font-size: var(--b-avatar-font-size-default);
  box-sizing: border-box;
  position: relative;
  user-select: none;
  transition: all var(--b-avatar-transition-duration) ease;
}

/* ── Shapes ── */
.b-avatar--circle {
  border-radius: 50%;
}

.b-avatar--square {
  border-radius: var(--b-avatar-border-radius-square);
}

/* ── Sizes ── */
.b-avatar--small {
  width: var(--b-avatar-size-small);
  height: var(--b-avatar-size-small);
  line-height: var(--b-avatar-size-small);
  font-size: var(--b-avatar-font-size-small);
}

.b-avatar--large {
  width: var(--b-avatar-size-large);
  height: var(--b-avatar-size-large);
  line-height: var(--b-avatar-size-large);
  font-size: var(--b-avatar-font-size-large);
}

/* ── Image ── */
.b-avatar--image {
  background: transparent;
}

.b-avatar__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ── Icon ── */
.b-avatar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--b-avatar-icon-color);
}

.b-avatar__icon > svg {
  width: 1em;
  height: 1em;
  fill: currentColor;
}

.b-avatar__icon--fallback > svg {
  width: 1em;
  height: 1em;
}

/* ── Text ── */
.b-avatar__text {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  transform-origin: 0 center;
  white-space: nowrap;
  line-height: 1;
  font-weight: 500;
}

/* ─────────────────────────────────────────────
   Reduced motion
   ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-avatar {
    transition: none;
  }
}
</style>
