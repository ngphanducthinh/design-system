<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import type { BTagColor, BTagPresetColor, BTagSize, BTagVariant } from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  color,
  variant = 'filled',
  size = 'default',
  closable = false,
  closeIcon,
  visible = undefined,
  bordered = true,
  icon,
} = defineProps<{
  /**
   * Preset semantic color name or any CSS color value.
   * Preset names map to a full color scale (bg, border, text).
   * Any other string is treated as a raw CSS color and applied to the border.
   * @example 'success' | 'processing' | 'error' | '#ff0000' | 'rgb(0,0,255)'
   */
  color?: BTagColor;
  /**
   * Visual style variant.
   * @default 'filled'
   */
  variant?: BTagVariant;
  /**
   * Size of the tag.
   * @default 'default'
   */
  size?: BTagSize;
  /**
   * Whether the tag can be closed/removed.
   * @default false
   */
  closable?: boolean;
  /**
   * Custom icon shown as the close trigger (string emoji / unicode or slot).
   * If omitted the default × SVG is used.
   */
  closeIcon?: string;
  /**
   * Controlled visibility — operate the tag in controlled mode via v-model.
   * When undefined the component manages its own visibility.
   */
  visible?: boolean;
  /**
   * Whether the tag has a border.
   * @default true
   */
  bordered?: boolean;
  /**
   * Leading icon string (emoji / unicode). For accessible icon rendering
   * prefer the `#icon` slot which lets callers set `role="img"` + `aria-label`.
   */
  icon?: string;
}>();

// ─────────────────────────────────────────────
// Emits
// ─────────────────────────────────────────────
const emit = defineEmits<{
  /** Fires synchronously when the close button is clicked/activated. */
  (e: 'close', event: MouseEvent | KeyboardEvent): void;
  /** Fires after the fade-out transition fully completes. */
  (e: 'afterClose'): void;
  /** v-model support — emitted with `false` when the tag is closed. */
  (e: 'update:visible', value: boolean): void;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /** Default tag content. */
  default?(): unknown;
  /** Leading icon area — receives no scoped props. */
  icon?(): unknown;
  /** Overrides the built-in close icon. */
  closeIcon?(): unknown;
}>();

// ─────────────────────────────────────────────
// Preset colors
// ─────────────────────────────────────────────
const PRESET_COLORS: BTagPresetColor[] = [
  'default',
  'success',
  'processing',
  'error',
  'warning',
  'magenta',
  'red',
  'volcano',
  'orange',
  'gold',
  'lime',
  'green',
  'cyan',
  'blue',
  'geekblue',
  'purple',
];

const isPreset = computed(() =>
  color === undefined || (PRESET_COLORS as string[]).includes(color),
);

const effectiveColor = computed<BTagPresetColor>(() =>
  isPreset.value ? ((color ?? 'default') as BTagPresetColor) : 'default',
);

// ─────────────────────────────────────────────
// Visibility state
// ─────────────────────────────────────────────
const isControlled = computed(() => visible !== undefined);
const internalVisible = ref(true);

// Sync external → internal when switching to controlled
watch(
  () => visible,
  (val) => {
    if (val !== undefined) internalVisible.value = val;
  },
);

const isVisible = computed(() =>
  isControlled.value ? visible! : internalVisible.value,
);

// ─────────────────────────────────────────────
// Close logic
// ─────────────────────────────────────────────
function handleClose(event: MouseEvent | KeyboardEvent) {
  emit('close', event);
  if (isControlled.value) {
    emit('update:visible', false);
  } else {
    internalVisible.value = false;
  }
}

function onCloseClick(event: MouseEvent) {
  handleClose(event);
}

function onCloseKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === ' ' || event.key === 'Escape') {
    event.preventDefault();
    handleClose(event);
  }
}

function onAfterLeave() {
  emit('afterClose');
}

// ─────────────────────────────────────────────
// Root class
// ─────────────────────────────────────────────
const rootClasses = computed(() => [
  'b-tag',
  `b-tag--${effectiveColor.value}`,
  `b-tag--${variant}`,
  {
    'b-tag--borderless': !bordered,
    'b-tag--closable': closable,
    'b-tag--small': size === 'small',
    'b-tag--large': size === 'large',
    'b-tag--custom-color': !isPreset.value,
  },
]);

// ─────────────────────────────────────────────
// Custom color inline style
// ─────────────────────────────────────────────
const customColorStyle = computed(() => {
  if (isPreset.value) return undefined;
  // For custom colors: use the color as border + text; tint bg at 10% opacity
  return {
    '--b-tag-custom-color': color,
  } as Record<string, string>;
});
</script>

<template>
  <Transition name="b-tag-fade" @after-leave="onAfterLeave">
    <span
      v-if="isVisible"
      :class="rootClasses"
      :style="customColorStyle"
    >
      <!-- Leading icon -->
      <span
        v-if="$slots.icon || icon"
        class="b-tag__icon"
        :aria-hidden="$slots.icon ? undefined : 'true'"
      >
        <slot name="icon">{{ icon }}</slot>
      </span>

      <!-- Content -->
      <span class="b-tag__content">
        <slot />
      </span>

      <!-- Close button -->
      <button
        v-if="closable"
        type="button"
        class="b-tag__close"
        aria-label="Remove tag"
        tabindex="0"
        @click.stop="onCloseClick"
        @keydown="onCloseKeydown"
      >
        <slot name="closeIcon">
          <span v-if="closeIcon" class="b-tag__close-label" aria-hidden="true" :data-icon="closeIcon" />
          <svg
            v-else
            class="b-tag__close-icon"
            viewBox="0 0 12 12"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M9.5 3.205 8.795 2.5 6 5.295 3.205 2.5 2.5 3.205 5.295 6 2.5 8.795 3.205 9.5 6 6.705 8.795 9.5 9.5 8.795 6.705 6z" />
          </svg>
        </slot>
      </button>
    </span>
  </Transition>
</template>

<style>
/* ─────────────────────────────────────────────
   BTag — CSS custom properties (scoped to root)
   ───────────────────────────────────────────── */
.b-tag {
  /* Layout */
  --b-tag-height: 22px;
  --b-tag-padding: 0 7px;
  --b-tag-border-radius: 4px;
  --b-tag-font-size: 12px;
  --b-tag-line-height: 20px;
  --b-tag-gap: 4px;

  /* Close button */
  --b-tag-close-size: 12px;
  --b-tag-close-offset: 3px;
  --b-tag-close-opacity: 0.45;
  --b-tag-close-hover-opacity: 1;

  /* Animation */
  --b-tag-transition-duration: 200ms;

  /* Custom color (set via inline style for non-preset colors) */
  --b-tag-custom-color: initial;

  /* ── Default color scheme ── */
  --b-tag-bg: oklch(96% 0.003 260);
  --b-tag-border-color: oklch(87% 0.007 260);
  --b-tag-color: oklch(32% 0.02 260);

  /* ── Layout ── */
  display: inline-flex;
  align-items: center;
  gap: var(--b-tag-gap);
  height: var(--b-tag-height);
  padding: var(--b-tag-padding);
  border-radius: var(--b-tag-border-radius);
  border: 1px solid var(--b-tag-border-color);
  background: var(--b-tag-bg);
  color: var(--b-tag-color);
  font-size: var(--b-tag-font-size);
  line-height: var(--b-tag-line-height);
  white-space: nowrap;
  box-sizing: border-box;
  vertical-align: middle;
  cursor: default;
  user-select: none;
}

/* ── Size variants ── */
.b-tag--small {
  --b-tag-height: 18px;
  --b-tag-padding: 0 5px;
  --b-tag-font-size: 11px;
  --b-tag-line-height: 16px;
  --b-tag-close-size: 10px;
}

.b-tag--large {
  --b-tag-height: 28px;
  --b-tag-padding: 0 10px;
  --b-tag-font-size: 14px;
  --b-tag-line-height: 26px;
  --b-tag-close-size: 14px;
}

/* ── Borderless ── */
.b-tag--borderless {
  border-color: transparent;
}

/* ── Outlined variant ── */
.b-tag--outlined {
  background: transparent;
}

/* ── Icon ── */
.b-tag__icon {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  font-size: var(--b-tag-font-size);
}

/* ── Content ── */
.b-tag__content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: var(--b-tag-line-height);
}

/* ── Close button ── */
.b-tag__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 0;
  margin-left: var(--b-tag-close-offset);
  border: none;
  border-radius: 2px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: var(--b-tag-close-opacity);
  line-height: 1;
  font-size: var(--b-tag-close-size);
  width: var(--b-tag-close-size);
  height: var(--b-tag-close-size);
  transition: opacity var(--b-tag-transition-duration) ease;
}

.b-tag__close:hover {
  opacity: var(--b-tag-close-hover-opacity);
}

.b-tag__close:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
  opacity: var(--b-tag-close-hover-opacity);
}

.b-tag__close-icon {
  width: 1em;
  height: 1em;
  fill: currentColor;
  display: block;
}

.b-tag__close-label::before {
  content: attr(data-icon);
}

/* ─────────────────────────────────────────────
   Preset color schemes
   ───────────────────────────────────────────── */

/* ── success ── */
.b-tag--success {
  --b-tag-bg: oklch(95% 0.05 145);
  --b-tag-border-color: oklch(78% 0.14 148);
  --b-tag-color: oklch(40% 0.14 148);
}

/* ── processing (blue pulse-ready) ── */
.b-tag--processing {
  --b-tag-bg: oklch(94% 0.05 260);
  --b-tag-border-color: oklch(72% 0.17 262);
  --b-tag-color: oklch(45% 0.18 262);
}

/* ── error ── */
.b-tag--error {
  --b-tag-bg: oklch(96% 0.04 20);
  --b-tag-border-color: oklch(78% 0.15 22);
  --b-tag-color: oklch(40% 0.17 22);
}

/* ── warning ── */
.b-tag--warning {
  --b-tag-bg: oklch(97% 0.06 75);
  --b-tag-border-color: oklch(82% 0.17 58);
  --b-tag-color: oklch(42% 0.14 55);
}

/* ── magenta ── */
.b-tag--magenta {
  --b-tag-bg: oklch(95% 0.04 345);
  --b-tag-border-color: oklch(76% 0.18 350);
  --b-tag-color: oklch(42% 0.2 348);
}

/* ── red ── */
.b-tag--red {
  --b-tag-bg: oklch(96% 0.035 15);
  --b-tag-border-color: oklch(74% 0.19 18);
  --b-tag-color: oklch(40% 0.2 18);
}

/* ── volcano ── */
.b-tag--volcano {
  --b-tag-bg: oklch(96% 0.04 38);
  --b-tag-border-color: oklch(76% 0.17 38);
  --b-tag-color: oklch(42% 0.18 38);
}

/* ── orange ── */
.b-tag--orange {
  --b-tag-bg: oklch(97% 0.055 65);
  --b-tag-border-color: oklch(80% 0.18 62);
  --b-tag-color: oklch(44% 0.16 60);
}

/* ── gold ── */
.b-tag--gold {
  --b-tag-bg: oklch(97% 0.06 80);
  --b-tag-border-color: oklch(82% 0.18 78);
  --b-tag-color: oklch(45% 0.14 78);
}

/* ── lime ── */
.b-tag--lime {
  --b-tag-bg: oklch(96% 0.07 128);
  --b-tag-border-color: oklch(80% 0.18 128);
  --b-tag-color: oklch(42% 0.15 128);
}

/* ── green ── */
.b-tag--green {
  --b-tag-bg: oklch(95% 0.05 145);
  --b-tag-border-color: oklch(76% 0.16 147);
  --b-tag-color: oklch(38% 0.14 147);
}

/* ── cyan ── */
.b-tag--cyan {
  --b-tag-bg: oklch(95% 0.05 200);
  --b-tag-border-color: oklch(76% 0.14 200);
  --b-tag-color: oklch(40% 0.12 200);
}

/* ── blue ── */
.b-tag--blue {
  --b-tag-bg: oklch(94% 0.05 255);
  --b-tag-border-color: oklch(72% 0.17 258);
  --b-tag-color: oklch(42% 0.18 258);
}

/* ── geekblue ── */
.b-tag--geekblue {
  --b-tag-bg: oklch(94% 0.04 270);
  --b-tag-border-color: oklch(68% 0.2 272);
  --b-tag-color: oklch(38% 0.22 272);
}

/* ── purple ── */
.b-tag--purple {
  --b-tag-bg: oklch(95% 0.04 300);
  --b-tag-border-color: oklch(72% 0.18 300);
  --b-tag-color: oklch(40% 0.2 300);
}

/* ─────────────────────────────────────────────
   Custom (non-preset) color
   ───────────────────────────────────────────── */
.b-tag--custom-color {
  /* 8% tint keeps the background very light; 55% blend with black produces
     text dark enough to clear WCAG AA 4.5:1 against that near-white bg. */
  --b-tag-bg: color-mix(in oklch, var(--b-tag-custom-color) 8%, white);
  --b-tag-border-color: color-mix(in oklch, var(--b-tag-custom-color) 50%, white);
  --b-tag-color: color-mix(in oklch, var(--b-tag-custom-color) 55%, black);
}

/* ─────────────────────────────────────────────
   Dark mode
   ───────────────────────────────────────────── */
[data-prefers-color='dark'] .b-tag {
  --b-tag-bg: oklch(26% 0.008 260);
  --b-tag-border-color: oklch(36% 0.012 260);
  --b-tag-color: oklch(82% 0.01 260);
}

[data-prefers-color='dark'] .b-tag--success {
  --b-tag-bg: oklch(20% 0.06 148);
  --b-tag-border-color: oklch(38% 0.12 148);
  --b-tag-color: oklch(78% 0.12 148);
}

[data-prefers-color='dark'] .b-tag--processing {
  --b-tag-bg: oklch(20% 0.06 260);
  --b-tag-border-color: oklch(40% 0.14 262);
  --b-tag-color: oklch(76% 0.15 262);
}

[data-prefers-color='dark'] .b-tag--error {
  --b-tag-bg: oklch(20% 0.05 20);
  --b-tag-border-color: oklch(38% 0.14 22);
  --b-tag-color: oklch(78% 0.14 22);
}

[data-prefers-color='dark'] .b-tag--warning {
  --b-tag-bg: oklch(20% 0.06 58);
  --b-tag-border-color: oklch(40% 0.15 58);
  --b-tag-color: oklch(80% 0.14 58);
}

[data-prefers-color='dark'] .b-tag--magenta {
  --b-tag-bg: oklch(20% 0.05 348);
  --b-tag-border-color: oklch(38% 0.16 350);
  --b-tag-color: oklch(76% 0.16 348);
}

[data-prefers-color='dark'] .b-tag--red {
  --b-tag-bg: oklch(20% 0.05 18);
  --b-tag-border-color: oklch(38% 0.17 18);
  --b-tag-color: oklch(76% 0.17 18);
}

[data-prefers-color='dark'] .b-tag--volcano {
  --b-tag-bg: oklch(20% 0.05 38);
  --b-tag-border-color: oklch(38% 0.15 38);
  --b-tag-color: oklch(76% 0.15 38);
}

[data-prefers-color='dark'] .b-tag--orange {
  --b-tag-bg: oklch(20% 0.06 62);
  --b-tag-border-color: oklch(40% 0.16 62);
  --b-tag-color: oklch(80% 0.16 62);
}

[data-prefers-color='dark'] .b-tag--gold {
  --b-tag-bg: oklch(20% 0.06 78);
  --b-tag-border-color: oklch(40% 0.16 78);
  --b-tag-color: oklch(80% 0.14 78);
}

[data-prefers-color='dark'] .b-tag--lime {
  --b-tag-bg: oklch(20% 0.07 128);
  --b-tag-border-color: oklch(40% 0.16 128);
  --b-tag-color: oklch(80% 0.14 128);
}

[data-prefers-color='dark'] .b-tag--green {
  --b-tag-bg: oklch(20% 0.06 147);
  --b-tag-border-color: oklch(38% 0.14 147);
  --b-tag-color: oklch(76% 0.13 147);
}

[data-prefers-color='dark'] .b-tag--cyan {
  --b-tag-bg: oklch(20% 0.05 200);
  --b-tag-border-color: oklch(38% 0.12 200);
  --b-tag-color: oklch(76% 0.11 200);
}

[data-prefers-color='dark'] .b-tag--blue {
  --b-tag-bg: oklch(20% 0.06 258);
  --b-tag-border-color: oklch(38% 0.15 258);
  --b-tag-color: oklch(74% 0.15 258);
}

[data-prefers-color='dark'] .b-tag--geekblue {
  --b-tag-bg: oklch(20% 0.05 272);
  --b-tag-border-color: oklch(36% 0.18 272);
  --b-tag-color: oklch(72% 0.18 272);
}

[data-prefers-color='dark'] .b-tag--purple {
  --b-tag-bg: oklch(20% 0.05 300);
  --b-tag-border-color: oklch(36% 0.16 300);
  --b-tag-color: oklch(74% 0.16 300);
}

[data-prefers-color='dark'] .b-tag--custom-color {
  --b-tag-bg: color-mix(in oklch, var(--b-tag-custom-color) 15%, oklch(15% 0 0));
  --b-tag-border-color: color-mix(in oklch, var(--b-tag-custom-color) 50%, oklch(15% 0 0));
  --b-tag-color: color-mix(in oklch, var(--b-tag-custom-color) 85%, white);
}

/* ─────────────────────────────────────────────
   Transition (fade)
   ───────────────────────────────────────────── */
.b-tag-fade-enter-active,
.b-tag-fade-leave-active {
  transition:
    opacity var(--b-tag-transition-duration) ease,
    transform var(--b-tag-transition-duration) ease;
}

.b-tag-fade-enter-from,
.b-tag-fade-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-tag {
    --b-tag-transition-duration: 0ms;
  }

  .b-tag-fade-enter-active,
  .b-tag-fade-leave-active {
    transition: opacity var(--b-tag-transition-duration) ease;
    transform: none !important;
  }
}
</style>
