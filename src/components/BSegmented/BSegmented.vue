<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import type { BSegmentedOption, BSegmentedRawOption } from './types';

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────
const {
  modelValue,
  defaultValue,
  options = [],
  disabled = false,
  size = 'default',
  block = false,
} = defineProps<{
  /**
   * Currently selected value (controlled / two-way binding via v-model).
   * When provided, the component is in controlled mode.
   */
  modelValue?: string | number;
  /**
   * Initial selected value for uncontrolled mode.
   * Ignored when `modelValue` is set.
   * @default first option value
   */
  defaultValue?: string | number;
  /** Segmented options. Accepts strings, numbers, or option objects. */
  options?: BSegmentedRawOption[];
  /** Whether the whole control is disabled. @default false */
  disabled?: boolean;
  /** Size of the component. @default 'default' */
  size?: 'small' | 'default' | 'large';
  /** Whether the segmented fills the full width of its container. @default false */
  block?: boolean;
}>();

// ─────────────────────────────────────────────
// Emits
// ─────────────────────────────────────────────
const emit = defineEmits<{
  /** Fires when the selected value changes. */
  (e: 'update:modelValue', value: string | number): void;
  /** Fires when the selected value changes (mirrors `update:modelValue`). */
  (e: 'change', value: string | number): void;
}>();

// ─────────────────────────────────────────────
// Slots
// ─────────────────────────────────────────────
defineSlots<{
  /** Custom label renderer for each option. Receives the resolved option object. */
  label?: (props: { option: BSegmentedOption }) => unknown;
}>();

// ─────────────────────────────────────────────
// Normalise options
// ─────────────────────────────────────────────
const normalizedOptions = computed<BSegmentedOption[]>(() =>
  options.map((opt) => {
    if (typeof opt === 'string' || typeof opt === 'number') {
      return { label: String(opt), value: opt, disabled: false };
    }
    return {
      label: String(opt.label ?? opt.value),
      value: opt.value,
      disabled: opt.disabled ?? false,
      icon: opt.icon,
    };
  }),
);

// ─────────────────────────────────────────────
// Internal selection state
// ─────────────────────────────────────────────
const isControlled = computed(() => modelValue !== undefined);

const internalValue = ref<string | number | undefined>(
  modelValue ?? defaultValue ?? normalizedOptions.value[0]?.value,
);

// Sync controlled value → internal
watch(
  () => modelValue,
  (val) => {
    if (val !== undefined) internalValue.value = val;
  },
);

// Sync first option as default when options change and nothing is selected
watch(normalizedOptions, (opts) => {
  if (internalValue.value === undefined && opts.length > 0) {
    internalValue.value = opts[0].value;
  }
});

const selectedValue = computed(() => (isControlled.value ? modelValue : internalValue.value));

// ─────────────────────────────────────────────
// Thumb (animated indicator) positioning
// ─────────────────────────────────────────────
const rootRef = ref<HTMLElement | null>(null);
const thumbStyle = ref<{ transform: string; width: string } | null>(null);

function updateThumb(index: number) {
  if (!rootRef.value) return;
  const items = rootRef.value.querySelectorAll<HTMLElement>('.b-segmented__item');
  const target = items[index];
  if (!target) return;

  const containerLeft = rootRef.value.getBoundingClientRect().left;
  const { left, width } = target.getBoundingClientRect();
  thumbStyle.value = {
    transform: `translateX(${left - containerLeft}px)`,
    width: `${width}px`,
  };
}

const selectedIndex = computed(() =>
  normalizedOptions.value.findIndex((o) => o.value === selectedValue.value),
);

watch(
  selectedIndex,
  async (idx) => {
    if (idx < 0) return;
    await nextTick();
    updateThumb(idx);
  },
  { immediate: false },
);

onMounted(() => {
  if (selectedIndex.value >= 0) updateThumb(selectedIndex.value);
});

// ─────────────────────────────────────────────
// Selection logic
// ─────────────────────────────────────────────
function select(opt: BSegmentedOption) {
  if (disabled || opt.disabled) return;
  if (opt.value === selectedValue.value) return;

  if (!isControlled.value) {
    internalValue.value = opt.value;
  }
  emit('update:modelValue', opt.value);
  emit('change', opt.value);
}

// ─────────────────────────────────────────────
// Keyboard navigation
// ─────────────────────────────────────────────
function onKeydown(event: KeyboardEvent, opt: BSegmentedOption) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    select(opt);
  }
  if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    event.preventDefault();
    focusNext(1);
  }
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    event.preventDefault();
    focusNext(-1);
  }
}

function focusNext(direction: 1 | -1) {
  if (!rootRef.value) return;
  const items = Array.from(
    rootRef.value.querySelectorAll<HTMLElement>('.b-segmented__item:not([aria-disabled="true"])'),
  );
  const activeEl = document.activeElement as HTMLElement;
  const currentIdx = items.indexOf(activeEl);
  if (currentIdx < 0) {
    items[0]?.focus();
    return;
  }
  const next = (currentIdx + direction + items.length) % items.length;
  items[next]?.focus();
}

// ─────────────────────────────────────────────
// Root classes
// ─────────────────────────────────────────────
const rootClasses = computed(() => [
  'b-segmented',
  {
    'b-segmented--disabled': disabled,
    'b-segmented--block': block,
    'b-segmented--small': size === 'small',
    'b-segmented--large': size === 'large',
  },
]);
</script>

<template>
  <div
    ref="rootRef"
    :class="rootClasses"
    role="group"
    :aria-disabled="disabled ? 'true' : undefined"
  >
    <!-- Animated thumb - positioned via JS -->
    <div
      v-if="thumbStyle"
      class="b-segmented__thumb"
      aria-hidden="true"
      :style="{ transform: thumbStyle.transform, width: thumbStyle.width }"
    />

    <!-- Items -->
    <div
      v-for="opt in normalizedOptions"
      :key="String(opt.value)"
      class="b-segmented__item"
      :class="{
        'b-segmented__item--selected': opt.value === selectedValue,
        'b-segmented__item--disabled': opt.disabled || disabled,
      }"
      role="radio"
      :aria-label="opt.label"
      :aria-checked="opt.value === selectedValue"
      :aria-disabled="opt.disabled || disabled ? 'true' : undefined"
      :tabindex="disabled || opt.disabled ? -1 : opt.value === selectedValue ? 0 : -1"
      @click="select(opt)"
      @keydown="onKeydown($event, opt)"
    >
      <div class="b-segmented__item-inner">
        <!-- Icon -->
        <span v-if="opt.icon" class="b-segmented__item-icon" aria-hidden="true">{{
          opt.icon
        }}</span>

        <!-- Label - slot or prop -->
        <span class="b-segmented__item-label">
          <slot name="label" :option="opt">{{ opt.label }}</slot>
        </span>
      </div>
    </div>
  </div>
</template>

<style>
/* ─────────────────────────────────────────────
   BSegmented - CSS custom properties (scoped to root)
   ───────────────────────────────────────────── */
.b-segmented {
  /* Surface */
  --b-segmented-bg: oklch(95% 0.003 260);
  --b-segmented-border-radius: 8px;
  --b-segmented-padding: 2px;

  /* Item */
  --b-segmented-item-color: oklch(40% 0.02 260);
  --b-segmented-item-hover-color: oklch(20% 0.02 260);
  --b-segmented-item-hover-bg: oklch(100% 0 0 / 50%);
  --b-segmented-item-padding: 0 11px;
  --b-segmented-item-border-radius: 6px;

  /* Selected thumb */
  --b-segmented-thumb-bg: oklch(100% 0 0);
  --b-segmented-thumb-shadow: 0 1px 2px oklch(0% 0 0 / 10%), 0 0 0 1px oklch(0% 0 0 / 6%);
  --b-segmented-thumb-transition:
    transform 200ms cubic-bezier(0.34, 0.69, 0.1, 1), width 200ms cubic-bezier(0.34, 0.69, 0.1, 1);

  /* Selected text */
  --b-segmented-selected-color: oklch(20% 0.02 260);
  --b-segmented-selected-font-weight: 500;

  /* Disabled */
  --b-segmented-disabled-opacity: 0.4;
  --b-segmented-disabled-cursor: not-allowed;

  /* Height variants */
  --b-segmented-height: 32px;

  /* Focus ring */
  --b-segmented-focus-ring: 0 0 0 2px oklch(54.6% 0.245 262.881 / 20%);

  /* Transition */
  --b-segmented-transition-duration: 200ms;

  /* ── Layout ── */
  position: relative;
  display: inline-flex;
  align-items: center;
  background: var(--b-segmented-bg);
  border-radius: var(--b-segmented-border-radius);
  padding: var(--b-segmented-padding);
  box-sizing: border-box;
  user-select: none;
  height: var(--b-segmented-height);
  font-size: 14px;
  line-height: 1;
}

/* ── Block (full width) ── */
.b-segmented--block {
  display: flex;
  width: 100%;
}

.b-segmented--block .b-segmented__item {
  flex: 1;
}

/* ── Size variants ── */
.b-segmented--small {
  --b-segmented-height: 24px;
  --b-segmented-item-padding: 0 7px;
  font-size: 12px;
}

.b-segmented--large {
  --b-segmented-height: 40px;
  --b-segmented-item-padding: 0 15px;
  font-size: 16px;
}

/* ── Thumb (sliding indicator) ── */
.b-segmented__thumb {
  position: absolute;
  top: var(--b-segmented-padding);
  left: 0;
  height: calc(100% - var(--b-segmented-padding) * 2);
  background: var(--b-segmented-thumb-bg);
  border-radius: var(--b-segmented-item-border-radius);
  box-shadow: var(--b-segmented-thumb-shadow);
  transition: var(--b-segmented-thumb-transition);
  pointer-events: none;
  will-change: transform, width;
}

/* ── Item ── */
.b-segmented__item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(var(--b-segmented-height) - var(--b-segmented-padding) * 2);
  padding: var(--b-segmented-item-padding);
  border-radius: var(--b-segmented-item-border-radius);
  color: var(--b-segmented-item-color);
  cursor: pointer;
  transition:
    color var(--b-segmented-transition-duration),
    background var(--b-segmented-transition-duration);
  white-space: nowrap;
  outline: none;
  box-sizing: border-box;
  z-index: 1;
}

.b-segmented__item:hover:not(.b-segmented__item--selected):not(.b-segmented__item--disabled) {
  color: var(--b-segmented-item-hover-color);
  background: var(--b-segmented-item-hover-bg);
}

.b-segmented__item:focus-visible {
  box-shadow: var(--b-segmented-focus-ring);
}

/* ── Selected item ── */
.b-segmented__item--selected {
  color: var(--b-segmented-selected-color);
  font-weight: var(--b-segmented-selected-font-weight);
}

/* ── Disabled ── */
.b-segmented--disabled,
.b-segmented__item--disabled {
  opacity: var(--b-segmented-disabled-opacity);
  cursor: var(--b-segmented-disabled-cursor);
  pointer-events: none;
}

/* Re-enable pointer events on items when only the item is disabled (not whole control) */
.b-segmented:not(.b-segmented--disabled) .b-segmented__item--disabled {
  pointer-events: auto;
  cursor: var(--b-segmented-disabled-cursor);
}

/* ── Inner wrapper (icon + label) ── */
.b-segmented__item-inner {
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1;
}

.b-segmented__item-icon {
  display: flex;
  align-items: center;
  font-size: 1em;
  flex-shrink: 0;
}

.b-segmented__item-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Dark mode ── */
[data-prefers-color='dark'] .b-segmented {
  --b-segmented-bg: oklch(22% 0.02 260);
  --b-segmented-item-color: oklch(72% 0.01 260);
  --b-segmented-item-hover-color: oklch(92% 0.005 260);
  --b-segmented-item-hover-bg: oklch(100% 0 0 / 8%);
  --b-segmented-thumb-bg: oklch(30% 0.02 260);
  --b-segmented-thumb-shadow: 0 1px 2px oklch(0% 0 0 / 30%), 0 0 0 1px oklch(0% 0 0 / 20%);
  --b-segmented-selected-color: oklch(95% 0.005 260);
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .b-segmented {
    --b-segmented-thumb-transition: none;
    --b-segmented-transition-duration: 0ms;
  }
}
</style>
