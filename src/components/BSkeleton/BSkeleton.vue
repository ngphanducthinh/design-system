<script setup lang="ts">
import { computed } from 'vue';
import BSkeletonAvatar from './BSkeletonAvatar.vue';
import type {
  BSkeletonAvatarConfig,
  BSkeletonParagraphConfig,
  BSkeletonTitleConfig,
} from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  active = false,
  avatar = false,
  loading = true,
  paragraph = true,
  round = false,
  title = true,
} = defineProps<{
  /**
   * Show the animated shimmer effect.
   * @default false
   */
  active?: boolean;
  /**
   * Show the avatar placeholder. Pass an object to configure its shape/size/active.
   * @default false
   */
  avatar?: boolean | BSkeletonAvatarConfig;
  /**
   * When `false`, renders the default slot (real content) instead of placeholders.
   * @default true
   */
  loading?: boolean;
  /**
   * Show paragraph placeholder rows. Pass an object to configure rows / row widths.
   * @default true
   */
  paragraph?: boolean | BSkeletonParagraphConfig;
  /**
   * Round corners on title and paragraph rows.
   * @default false
   */
  round?: boolean;
  /**
   * Show the title bar placeholder. Pass an object to configure its width.
   * @default true
   */
  title?: boolean | BSkeletonTitleConfig;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /** Real content rendered when `loading` is `false`. */
  default?(): unknown;
}>();

// ─────────────────────────────────────────────
// Derived flags / configs
// ─────────────────────────────────────────────
const showAvatar = computed(() => avatar !== false && avatar != null);
const showTitle = computed(() => title !== false && title != null);
const showParagraph = computed(() => paragraph !== false && paragraph != null);

const avatarConfig = computed<BSkeletonAvatarConfig>(() =>
  typeof avatar === 'object' && avatar !== null ? avatar : {},
);

const titleConfig = computed<BSkeletonTitleConfig>(() =>
  typeof title === 'object' && title !== null ? title : {},
);

const paragraphConfig = computed<BSkeletonParagraphConfig>(() =>
  typeof paragraph === 'object' && paragraph !== null ? paragraph : {},
);

const titleWidth = computed(() => normalizeWidth(titleConfig.value.width));

const paragraphRows = computed(() => {
  const r = paragraphConfig.value.rows;
  return typeof r === 'number' && r > 0 ? Math.floor(r) : 3;
});

const paragraphRowWidths = computed<string[]>(() => {
  const widths = paragraphConfig.value.width;
  const rows = paragraphRows.value;
  const out: string[] = [];
  for (let i = 0; i < rows; i += 1) {
    if (Array.isArray(widths)) {
      const w = widths[i];
      out.push(normalizeWidth(w) ?? '');
    } else if (i === rows - 1) {
      // Apply explicit width to the LAST row only when a single value is given.
      const w = normalizeWidth(widths);
      out.push(w ?? '61%');
    } else {
      out.push('');
    }
  }
  return out;
});

function normalizeWidth(w: number | string | undefined): string | undefined {
  if (w == null) return undefined;
  if (typeof w === 'number') return `${w}px`;
  return w;
}

const rootClasses = computed(() => [
  'b-skeleton',
  {
    'b-skeleton--active': active,
    'b-skeleton--with-avatar': showAvatar.value,
    'b-skeleton--round': round,
  },
]);
</script>

<template>
  <div v-if="loading" :class="rootClasses" role="status" aria-live="polite" aria-label="Loading">
    <div v-if="showAvatar" class="b-skeleton__header">
      <BSkeletonAvatar
        :active="active || avatarConfig.active"
        :shape="avatarConfig.shape"
        :size="avatarConfig.size"
      />
    </div>

    <div class="b-skeleton__content">
      <h3
        v-if="showTitle"
        class="b-skeleton__title"
        :style="titleWidth ? { width: titleWidth } : undefined"
        aria-hidden="true"
      />

      <ul v-if="showParagraph" class="b-skeleton__paragraph" aria-hidden="true">
        <li
          v-for="(w, i) in paragraphRowWidths"
          :key="i"
          class="b-skeleton__paragraph-row"
          :style="w ? { width: w } : undefined"
        />
      </ul>
    </div>
  </div>

  <template v-else>
    <slot />
  </template>
</template>

<style>
/* ─────────────────────────────────────────────
   CSS Custom Properties (tokens)
   ─────────────────────────────────────────────
   AntD design-token mapping:
     gradientFromColor  → --b-skeleton-gradient-from-color
     gradientToColor    → --b-skeleton-gradient-to-color
     titleHeight        → --b-skeleton-title-height
     paragraphLiHeight  → --b-skeleton-paragraph-li-height
     paragraphMarginTop → --b-skeleton-paragraph-margin-top
     blockRadius        → --b-skeleton-block-radius
     borderRadius       → --b-skeleton-border-radius
     borderRadiusSM     → --b-skeleton-border-radius-sm
     controlHeight      → --b-skeleton-control-height
     controlHeightLG    → --b-skeleton-control-height-lg
     controlHeightSM    → --b-skeleton-control-height-sm
     ─────────────────────────────────────────── */
.b-skeleton {
  --b-skeleton-gradient-from-color: oklch(93% 0 0); /* #f2f2f2 */
  --b-skeleton-gradient-to-color: oklch(85% 0 0); /* #d9d9d9 */
  --b-skeleton-title-height: 16px;
  --b-skeleton-paragraph-li-height: 16px;
  --b-skeleton-paragraph-margin-top: 28px;
  --b-skeleton-paragraph-row-gap: 16px;
  --b-skeleton-block-radius: 4px;
  --b-skeleton-border-radius: 6px;
  --b-skeleton-border-radius-sm: 4px;
  --b-skeleton-control-height: 32px;
  --b-skeleton-control-height-lg: 40px;
  --b-skeleton-control-height-sm: 24px;
  --b-skeleton-avatar-size-default: 32px;
  --b-skeleton-avatar-size-small: 24px;
  --b-skeleton-avatar-size-large: 40px;
  --b-skeleton-image-size: 96px;
  --b-skeleton-button-min-width: 64px;
  --b-skeleton-input-min-width: 160px;
  --b-skeleton-animation-duration: 1.4s;
  --b-skeleton-content-gap: 16px;
}

/* Dark mode (explicit + system) */
[data-prefers-color='dark'] .b-skeleton,
[data-prefers-color='dark'] .b-skeleton-element {
  --b-skeleton-gradient-from-color: oklch(28% 0 0);
  --b-skeleton-gradient-to-color: oklch(35% 0 0);
}
@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-skeleton,
  [data-prefers-color='system'] .b-skeleton-element {
    --b-skeleton-gradient-from-color: oklch(28% 0 0);
    --b-skeleton-gradient-to-color: oklch(35% 0 0);
  }
}

/* ─────────────────────────────────────────────
   Layout
   ───────────────────────────────────────────── */
.b-skeleton {
  display: flex;
  width: 100%;
  gap: var(--b-skeleton-content-gap);
  box-sizing: border-box;
}

.b-skeleton__header {
  flex-shrink: 0;
}

.b-skeleton__content {
  flex: 1;
  min-width: 0;
}

/* ─────────────────────────────────────────────
   Title
   ───────────────────────────────────────────── */
.b-skeleton__title {
  width: 38%;
  height: var(--b-skeleton-title-height);
  margin: 0;
  background: var(--b-skeleton-gradient-from-color);
  border-radius: var(--b-skeleton-block-radius);
}

.b-skeleton--with-avatar .b-skeleton__title {
  width: 50%;
}

.b-skeleton--round .b-skeleton__title {
  border-radius: 100px;
}

/* ─────────────────────────────────────────────
   Paragraph
   ───────────────────────────────────────────── */
.b-skeleton__paragraph {
  list-style: none;
  margin: 0;
  padding: 0;
  margin-top: var(--b-skeleton-paragraph-margin-top);
}

.b-skeleton__title + .b-skeleton__paragraph {
  margin-top: var(--b-skeleton-paragraph-margin-top);
}

.b-skeleton__paragraph-row {
  width: 100%;
  height: var(--b-skeleton-paragraph-li-height);
  background: var(--b-skeleton-gradient-from-color);
  border-radius: var(--b-skeleton-block-radius);
}

.b-skeleton__paragraph-row + .b-skeleton__paragraph-row {
  margin-top: var(--b-skeleton-paragraph-row-gap);
}

.b-skeleton--round .b-skeleton__paragraph-row {
  border-radius: 100px;
}

/* ─────────────────────────────────────────────
   Active shimmer animation
   ───────────────────────────────────────────── */
.b-skeleton--active .b-skeleton__title,
.b-skeleton--active .b-skeleton__paragraph-row {
  background: linear-gradient(
    90deg,
    var(--b-skeleton-gradient-from-color) 25%,
    var(--b-skeleton-gradient-to-color) 37%,
    var(--b-skeleton-gradient-from-color) 63%
  );
  background-size: 400% 100%;
  animation: b-skeleton-loading var(--b-skeleton-animation-duration) ease infinite;
}

@keyframes b-skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}

/* Shared active shimmer for sub-components (Avatar, Button, Input, Image, Node) */
.b-skeleton-element--active {
  background: linear-gradient(
    90deg,
    var(--b-skeleton-gradient-from-color, oklch(93% 0 0)) 25%,
    var(--b-skeleton-gradient-to-color, oklch(85% 0 0)) 37%,
    var(--b-skeleton-gradient-from-color, oklch(93% 0 0)) 63%
  );
  background-size: 400% 100%;
  animation: b-skeleton-loading var(--b-skeleton-animation-duration, 1.4s) ease infinite;
}

@media (prefers-reduced-motion: reduce) {
  .b-skeleton--active .b-skeleton__title,
  .b-skeleton--active .b-skeleton__paragraph-row,
  .b-skeleton-element--active {
    animation: none;
  }
}
</style>
