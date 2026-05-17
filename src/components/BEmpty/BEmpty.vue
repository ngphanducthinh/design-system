<script setup lang="ts">
import { BEmptyImage } from '@/types.ts';
import { computed } from 'vue';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const props = withDefaults(
  defineProps<{
    /**
     * Customize description text. Pass empty string to show no text,
     * or set hideDescription to true to hide the description entirely.
     */
    description?: string;
    /**
     * Set to true to hide the description area completely.
     * @default false
     */
    hideDescription?: boolean;
    /**
     * Image type or custom image URL string.
     * Use BEmptyImage.Default for the detailed illustration or
     * BEmptyImage.Simple for the minimal version.
     * @default BEmptyImage.Default
     */
    image?: `${BEmptyImage}` | string;
    /**
     * Inline styles applied to the image element.
     */
    imageStyle?: Record<string, string>;
  }>(),
  {
    description: 'No data',
    hideDescription: false,
    image: BEmptyImage.Default,
  },
);

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
const slots = defineSlots<{
  /** Default slot: action content below description (e.g. button). */
  default?(): unknown;
  /** Custom description content, overrides the description prop. */
  description?(): unknown;
  /** Custom image content, overrides the image prop entirely. */
  image?(): unknown;
}>();

// ─────────────────────────────────────────────
// Derived state
// ─────────────────────────────────────────────
const isSimple = computed(() => props.image === BEmptyImage.Simple);

const isBuiltInImage = computed(
  () => props.image === BEmptyImage.Default || props.image === BEmptyImage.Simple,
);

const isCustomUrl = computed(
  () => !isBuiltInImage.value && typeof props.image === 'string' && props.image.length > 0,
);

const showDescription = computed(() => {
  if (slots.description) return true;
  return !props.hideDescription;
});

const descriptionText = computed(() => {
  return props.description;
});
</script>

<template>
  <div
    class="b-empty"
    :class="{ 'b-empty--simple': isSimple }"
    role="status"
    :aria-label="props.description || 'No data'"
  >
    <!-- Image -->
    <div class="b-empty__image" :style="props.imageStyle">
      <slot name="image">
        <!-- Default built-in illustration -->
        <svg
          v-if="props.image === BEmptyImage.Default"
          class="b-empty__svg b-empty__svg--default"
          viewBox="0 0 184 152"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <g fill="none" fill-rule="evenodd">
            <g transform="translate(24 31.67)">
              <ellipse class="b-empty__ellipse" cx="67.797" cy="106.89" rx="67.797" ry="12.668" />
              <path
                class="b-empty__path-bg"
                d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
              />
              <path
                class="b-empty__path-main"
                d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z"
                transform="translate(13.56)"
              />
              <path
                class="b-empty__path-front"
                d="M33.83 0h67.933a4 4 0 014 4v93.344H29.83V4a4 4 0 014-4z"
              />
              <path
                class="b-empty__path-panel"
                d="M42.678 9.953h50.237a2 2 0 012 2V36.91h-54.237V11.953a2 2 0 012-2zM42.94 49.767h49.713a2.262 2.262 0 110 4.524H42.94a2.262 2.262 0 110-4.524zM42.94 61.53h49.713a2.262 2.262 0 110 4.525H42.94a2.262 2.262 0 010-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 01-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393 0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
              />
            </g>
            <path
              class="b-empty__path-dot"
              d="M149.121 33.292l-6.83 2.65a1 1 0 01-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
            />
            <g class="b-empty__path-dots-group" transform="translate(149.65 15.383)">
              <ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
              <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
            </g>
          </g>
        </svg>

        <!-- Simple built-in illustration -->
        <svg
          v-else-if="props.image === BEmptyImage.Simple"
          class="b-empty__svg b-empty__svg--simple"
          viewBox="0 0 64 41"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <g transform="translate(0 1)" fill="none" fill-rule="evenodd">
            <ellipse class="b-empty__simple-ellipse" cx="32" cy="33" rx="32" ry="7" />
            <g class="b-empty__simple-group" fill-rule="nonzero">
              <path
                d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46V12.76z"
              />
              <path
                class="b-empty__simple-inner"
                d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
              />
            </g>
          </g>
        </svg>

        <!-- Custom URL image -->
        <img
          v-else-if="isCustomUrl"
          :src="props.image"
          alt=""
          class="b-empty__custom-image"
          aria-hidden="true"
        />
      </slot>
    </div>

    <!-- Description -->
    <div v-if="showDescription" class="b-empty__description">
      <slot name="description">
        {{ descriptionText }}
      </slot>
    </div>

    <!-- Footer / actions -->
    <div v-if="slots.default" class="b-empty__footer">
      <slot />
    </div>
  </div>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (tokens)
   ──────────────────────────────────────────── */
.b-empty {
  /* Layout */
  --b-empty-padding: 32px 0;
  --b-empty-text-align: center;

  /* Image */
  --b-empty-image-height: 152px;
  --b-empty-image-height-simple: 35px;
  --b-empty-image-margin-bottom: 8px;
  --b-empty-image-opacity: 1;

  /* Default SVG colors */
  --b-empty-ellipse-fill: oklch(93% 0.005 260);
  --b-empty-path-bg-fill: oklch(95% 0.003 260);
  --b-empty-path-main-fill: oklch(97% 0.002 260);
  --b-empty-path-front-stroke: oklch(83% 0.01 260);
  --b-empty-path-front-fill: oklch(97% 0.002 260);
  --b-empty-path-panel-fill: oklch(93% 0.005 260);
  --b-empty-path-dot-fill: oklch(83% 0.01 260);
  --b-empty-path-dots-group-fill: oklch(100% 0 0);

  /* Simple SVG colors */
  --b-empty-simple-ellipse-fill: oklch(93% 0.005 260);
  --b-empty-simple-group-stroke: oklch(83% 0.01 260);
  --b-empty-simple-group-fill: oklch(97% 0.002 260);
  --b-empty-simple-inner-fill: oklch(93% 0.005 260);

  /* Description */
  --b-empty-description-color: oklch(55% 0.01 260);
  --b-empty-description-font-size: 14px;
  --b-empty-description-line-height: 1.572;
  --b-empty-description-margin-top: 8px;

  /* Footer */
  --b-empty-footer-margin-top: 16px;

  /* Animation */
  --b-empty-transition-duration: 200ms;
}

/* ── Dark mode ───────────────────────────────── */
[data-prefers-color='dark'] .b-empty {
  --b-empty-ellipse-fill: oklch(25% 0.005 260);
  --b-empty-path-bg-fill: oklch(22% 0.005 260);
  --b-empty-path-main-fill: oklch(18% 0.003 260);
  --b-empty-path-front-stroke: oklch(40% 0.01 260);
  --b-empty-path-front-fill: oklch(20% 0.005 260);
  --b-empty-path-panel-fill: oklch(28% 0.005 260);
  --b-empty-path-dot-fill: oklch(40% 0.01 260);
  --b-empty-path-dots-group-fill: oklch(18% 0 0);

  --b-empty-simple-ellipse-fill: oklch(25% 0.005 260);
  --b-empty-simple-group-stroke: oklch(40% 0.01 260);
  --b-empty-simple-group-fill: oklch(20% 0.005 260);
  --b-empty-simple-inner-fill: oklch(28% 0.005 260);

  --b-empty-description-color: oklch(70% 0.01 260);
}

@media (prefers-color-scheme: dark) {
  [data-prefers-color='system'] .b-empty {
    --b-empty-ellipse-fill: oklch(25% 0.005 260);
    --b-empty-path-bg-fill: oklch(22% 0.005 260);
    --b-empty-path-main-fill: oklch(18% 0.003 260);
    --b-empty-path-front-stroke: oklch(40% 0.01 260);
    --b-empty-path-front-fill: oklch(20% 0.005 260);
    --b-empty-path-panel-fill: oklch(28% 0.005 260);
    --b-empty-path-dot-fill: oklch(40% 0.01 260);
    --b-empty-path-dots-group-fill: oklch(18% 0 0);
  
    --b-empty-simple-ellipse-fill: oklch(25% 0.005 260);
    --b-empty-simple-group-stroke: oklch(40% 0.01 260);
    --b-empty-simple-group-fill: oklch(20% 0.005 260);
    --b-empty-simple-inner-fill: oklch(28% 0.005 260);
  
    --b-empty-description-color: oklch(70% 0.01 260);
  }
}

/* ─────────────────────────────────────────────
   Base layout
   ───────────────────────────────────────────── */
.b-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--b-empty-padding);
  text-align: var(--b-empty-text-align);
  box-sizing: border-box;
}

/* ─────────────────────────────────────────────
   Image area
   ───────────────────────────────────────────── */
.b-empty__image {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--b-empty-image-height);
  margin-bottom: var(--b-empty-image-margin-bottom);
  opacity: var(--b-empty-image-opacity);
}

.b-empty--simple .b-empty__image {
  height: var(--b-empty-image-height-simple);
}

.b-empty__svg {
  width: auto;
  height: 100%;
}

.b-empty__custom-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* ─────────────────────────────────────────────
   Default SVG illustration colors
   ───────────────────────────────────────────── */
.b-empty__ellipse {
  fill: var(--b-empty-ellipse-fill);
}

.b-empty__path-bg {
  fill: var(--b-empty-path-bg-fill);
}

.b-empty__path-main {
  fill: var(--b-empty-path-main-fill);
}

.b-empty__path-front {
  stroke: var(--b-empty-path-front-stroke);
  fill: var(--b-empty-path-front-fill);
}

.b-empty__path-panel {
  fill: var(--b-empty-path-panel-fill);
}

.b-empty__path-dot {
  fill: var(--b-empty-path-dot-fill);
}

.b-empty__path-dots-group {
  fill: var(--b-empty-path-dots-group-fill);
}

/* ─────────────────────────────────────────────
   Simple SVG illustration colors
   ───────────────────────────────────────────── */
.b-empty__simple-ellipse {
  fill: var(--b-empty-simple-ellipse-fill);
}

.b-empty__simple-group {
  stroke: var(--b-empty-simple-group-stroke);
  fill: var(--b-empty-simple-group-fill);
}

.b-empty__simple-inner {
  fill: var(--b-empty-simple-inner-fill);
}

/* ─────────────────────────────────────────────
   Description
   ───────────────────────────────────────────── */
.b-empty__description {
  color: var(--b-empty-description-color);
  font-size: var(--b-empty-description-font-size);
  line-height: var(--b-empty-description-line-height);
  margin-top: var(--b-empty-description-margin-top);
}

/* ─────────────────────────────────────────────
   Footer (actions area)
   ───────────────────────────────────────────── */
.b-empty__footer {
  margin-top: var(--b-empty-footer-margin-top);
}

/* ─────────────────────────────────────────────
   Reduced motion
   ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-empty {
    --b-empty-transition-duration: 0ms;
  }
}
</style>
