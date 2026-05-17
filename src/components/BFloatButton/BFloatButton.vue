<script setup lang="ts">
import BIcon from '@/components/BIcon/BIcon.vue';
import { type BIconName } from '@/components/BIcon/BIconEnum.ts';
import { computed } from 'vue';
import type { BFloatButtonBadgeProps } from './types.ts';
import { BFloatButtonShape, BFloatButtonType } from './types.ts';

// ─────────────────────────────────────────────
// Props & emits
// ─────────────────────────────────────────────
const {
  icon,
  description,
  tooltip,
  type = BFloatButtonType.Default,
  shape = BFloatButtonShape.Circle,
  href,
  target = '_blank',
  htmlType = 'button',
  badge,
  disabled = false,
  ariaLabel,
} = defineProps<{
  /**
   * Icon name for the float button.
   * @example 'arrow-up', 'plus', 'question'
   */
  icon?: `${BIconName}`;
  /**
   * Description text shown below the icon (square shape only).
   */
  description?: string;
  /**
   * Tooltip text shown on hover.
   */
  tooltip?: string;
  /**
   * Visual type of the button.
   * @default 'default'
   */
  type?: `${BFloatButtonType}`;
  /**
   * Shape of the button.
   * @default 'circle'
   */
  shape?: `${BFloatButtonShape}`;
  /**
   * When set, renders as an anchor element with this href.
   */
  href?: string;
  /**
   * Link target attribute (only used with href).
   * @default '_blank'
   */
  target?: string;
  /**
   * HTML button type attribute (only used when not href).
   * @default 'button'
   */
  htmlType?: 'button' | 'submit' | 'reset';
  /**
   * Badge configuration to display on the button.
   */
  badge?: BFloatButtonBadgeProps;
  /**
   * Whether the button is disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * Accessible label for the button (important when no visible text).
   */
  ariaLabel?: string;
}>();

const emit = defineEmits<{
  /** Emitted when the button is clicked. */
  (e: 'click', event: MouseEvent): void;
}>();

defineSlots<{
  /** Custom icon content. */
  icon?(): unknown;
  /** Description content (square shape only). */
  description?(): unknown;
  /** Tooltip content. */
  tooltip?(): unknown;
}>();

// ─────────────────────────────────────────────
// Computed helpers
// ─────────────────────────────────────────────
const isType = (value: `${BFloatButtonType}`) => type === value;
const isShape = (value: `${BFloatButtonShape}`) => shape === value;

const badgeCount = computed(() => {
  if (!badge) return undefined;
  if (badge.dot) return undefined;
  return badge.count;
});

const showBadgeDot = computed(() => badge?.dot ?? false);

const badgeOverflow = computed(() => badge?.overflowCount ?? 99);

const badgeDisplayCount = computed(() => {
  const count = badgeCount.value;
  if (count === undefined) return undefined;
  if (count === 0 && !badge?.showZero) return undefined;
  return count > badgeOverflow.value ? `${badgeOverflow.value}+` : String(count);
});

const showBadge = computed(() => {
  return showBadgeDot.value || badgeDisplayCount.value !== undefined;
});

function handleClick(event: MouseEvent) {
  if (disabled) return;
  emit('click', event);
}

const rootTag = computed(() => (href ? 'a' : 'button'));
</script>

<template>
  <component
    :is="rootTag"
    :href="href"
    :target="href ? target : undefined"
    :type="!href ? htmlType : undefined"
    :disabled="!href && disabled ? true : undefined"
    :aria-disabled="href && disabled ? 'true' : undefined"
    :aria-label="ariaLabel ?? tooltip"
    :title="tooltip"
    :class="[
      'b-float-button',
      {
        'b-float-button--circle': isShape('circle'),
        'b-float-button--square': isShape('square'),
        'b-float-button--default': isType('default'),
        'b-float-button--primary': isType('primary'),
        'b-float-button--disabled': disabled,
      },
    ]"
    @click="handleClick"
  >
    <!-- Badge -->
    <span
      v-if="showBadge"
      class="b-float-button__badge"
      :class="{
        'b-float-button__badge--dot': showBadgeDot,
        'b-float-button__badge--count': !showBadgeDot,
      }"
      :style="badge?.color ? { backgroundColor: badge.color } : undefined"
      aria-hidden="true"
    >
      <template v-if="!showBadgeDot">{{ badgeDisplayCount }}</template>
    </span>

    <!-- Body -->
    <span class="b-float-button__body">
      <!-- Icon -->
      <span class="b-float-button__icon" aria-hidden="true">
        <slot name="icon">
          <BIcon v-if="icon" :icon="icon" size="md" />
          <!-- Default plus icon when no icon prop or slot is provided -->
          <svg
            v-else
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </slot>
      </span>

      <!-- Description (square shape only) -->
      <span
        v-if="($slots.description || description) && isShape('square')"
        class="b-float-button__description"
      >
        <slot name="description">{{ description }}</slot>
      </span>
    </span>

    <!-- Tooltip overlay -->
    <span
      v-if="$slots.tooltip || (tooltip && !ariaLabel)"
      class="b-float-button__tooltip"
      role="tooltip"
    >
      <slot name="tooltip">{{ tooltip }}</slot>
    </span>
  </component>
</template>

<style>
/* ────────────────────────────────────────────
   CSS Custom Properties (tokens)
   scoped to .b-float-button — never on :root
   ──────────────────────────────────────────── */
.b-float-button {
  /* Size tokens — AntD: floatButtonSize (40px) */
  --b-float-button-size: 40px;
  /* Icon size — AntD: floatButtonIconSize (21px) */
  --b-float-button-icon-size: 1.3125rem;
  /* Background — AntD: colorBgContainer */
  --b-float-button-bg: #fff;
  /* Primary background */
  --b-float-button-primary-bg: oklch(55% 0.2 264);
  /* Primary hover background */
  --b-float-button-primary-bg-hover: oklch(62% 0.2 264);
  /* Default hover background */
  --b-float-button-bg-hover: oklch(96% 0 0);
  /* Text / icon color — AntD: colorText */
  --b-float-button-color: oklch(20% 0 0);
  /* Primary text color */
  --b-float-button-primary-color: #fff;
  /* Border radius (circle: 50%, square: 8px) */
  --b-float-button-border-radius-circle: 50%;
  --b-float-button-border-radius-square: 0.5rem;
  /* Shadow — AntD: boxShadowSecondary */
  --b-float-button-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
  /* Bottom inset — AntD: floatButtonInsetBlockEnd (48px) */
  --b-float-button-inset-block-end: 3rem;
  /* Inline inset — AntD: floatButtonInsetInlineEnd (24px) */
  --b-float-button-inset-inline-end: 1.5rem;
  /* z-index — AntD: zIndexPopupBase (1000) */
  --b-float-button-z-index: 1000;
  /* Transition */
  --b-float-button-transition-duration: 200ms;
  /* Description font size (sm) */
  --b-float-button-description-font-size: 0.75rem;
  /* Badge */
  --b-float-button-badge-bg: oklch(57% 0.22 25);
  --b-float-button-badge-color: #fff;
  --b-float-button-badge-font-size: 0.6875rem;
  /* Tooltip */
  --b-float-button-tooltip-bg: oklch(20% 0.02 260);
  --b-float-button-tooltip-color: oklch(96% 0 0);
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-float-button,
[data-prefers-color='dark'].b-float-button {
  --b-float-button-bg: oklch(20% 0.02 260);
  --b-float-button-bg-hover: oklch(28% 0.02 260);
  --b-float-button-color: oklch(88% 0.01 260);
  --b-float-button-primary-bg: oklch(50% 0.2 264);
  --b-float-button-primary-bg-hover: oklch(57% 0.2 264);
  --b-float-button-shadow:
    0 6px 16px 0 oklch(0% 0 0 / 30%), 0 3px 6px -4px oklch(0% 0 0 / 40%),
    0 9px 28px 8px oklch(0% 0 0 / 25%);
  --b-float-button-tooltip-bg: oklch(30% 0.02 260);
  --b-float-button-tooltip-color: oklch(88% 0.01 260);
  --b-float-button-badge-bg: oklch(55% 0.22 25);
}

/* ─────────────────────────────────────────────
   Base button
   ───────────────────────────────────────────── */
.b-float-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: var(--b-float-button-size);
  height: var(--b-float-button-size);
  min-height: var(--b-float-button-size);
  background-color: var(--b-float-button-bg);
  color: var(--b-float-button-color);
  border: none;
  padding: 0;
  cursor: pointer;
  box-shadow: var(--b-float-button-shadow);
  text-decoration: none;
  transition:
    background-color var(--b-float-button-transition-duration) ease,
    color var(--b-float-button-transition-duration) ease,
    box-shadow var(--b-float-button-transition-duration) ease,
    transform var(--b-float-button-transition-duration) ease;
  outline-offset: 2px;

  /* Tooltip hidden by default */
  &:hover .b-float-button__tooltip {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(-50%) scale(1);
  }
}

/* ── Shape: circle ── */
.b-float-button--circle {
  border-radius: var(--b-float-button-border-radius-circle);
}

/* ── Shape: square ── */
.b-float-button--square {
  border-radius: var(--b-float-button-border-radius-square);
  height: auto;
  min-height: var(--b-float-button-size);
  padding: 0.5rem;
}

/* ── Type: default ── */
.b-float-button--default {
  background-color: var(--b-float-button-bg);
  color: var(--b-float-button-color);

  &:not(.b-float-button--disabled):hover {
    background-color: var(--b-float-button-bg-hover);
  }
}

/* ── Type: primary ── */
.b-float-button--primary {
  background-color: var(--b-float-button-primary-bg);
  color: var(--b-float-button-primary-color);

  &:not(.b-float-button--disabled):hover {
    background-color: var(--b-float-button-primary-bg-hover);
  }
}

/* ── Disabled state ── */
.b-float-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* ── Focus visible ring ── */
.b-float-button:focus-visible {
  outline: 2px solid var(--b-float-button-primary-bg);
}

/* ─────────────────────────────────────────────
   Body (icon + description wrapper)
   ───────────────────────────────────────────── */
.b-float-button__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
}

/* ─────────────────────────────────────────────
   Icon
   ───────────────────────────────────────────── */
.b-float-button__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--b-float-button-icon-size);
  line-height: 1;
}

/* ─────────────────────────────────────────────
   Description
   ───────────────────────────────────────────── */
.b-float-button__description {
  font-size: var(--b-float-button-description-font-size);
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
}

/* ─────────────────────────────────────────────
   Tooltip overlay
   ───────────────────────────────────────────── */
.b-float-button__tooltip {
  position: absolute;
  right: calc(100% + 0.75rem);
  top: 50%;
  transform: translateX(-50%) scale(0.95);
  white-space: nowrap;
  background: var(--b-float-button-tooltip-bg);
  color: var(--b-float-button-tooltip-color);
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  pointer-events: none;
  opacity: 0;
  transition:
    opacity var(--b-float-button-transition-duration) ease,
    transform var(--b-float-button-transition-duration) ease;

  /* Arrow */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 100%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-left-color: var(--b-float-button-tooltip-bg);
  }
}

/* ─────────────────────────────────────────────
   Badge
   ───────────────────────────────────────────── */
.b-float-button__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  z-index: 1;
  background: var(--b-float-button-badge-bg);
  color: var(--b-float-button-badge-color);
  font-size: var(--b-float-button-badge-font-size);
  line-height: 1;
  border-radius: 10px;
  padding: 2px 5px;
  min-width: 1.25rem;
  text-align: center;
  box-shadow: 0 0 0 2px var(--b-float-button-bg);
}

.b-float-button__badge--dot {
  width: 8px;
  height: 8px;
  min-width: 0;
  padding: 0;
  border-radius: 50%;
}

/* ─────────────────────────────────────────────
   Reduced motion
   ───────────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .b-float-button,
  .b-float-button__tooltip {
    transition-duration: 0ms;
  }
}
</style>
