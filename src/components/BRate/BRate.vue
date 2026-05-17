<script lang="ts" setup>
import { useComponentId } from '@/composables/useComponentId.ts';
import { computed, ref, watch } from 'vue';

//#region Props
const {
  allowClear = true,
  allowHalf = false,
  count = 5,
  disabled = false,
  keyboard = true,
  size = 'default',
  tooltips = [],
  character,
} = defineProps<{
  /** Whether to allow clearing the value when clicking the same star again. */
  allowClear?: boolean;
  /** Whether to allow half-star selection. */
  allowHalf?: boolean;
  /** Total number of stars. */
  count?: number;
  /** If true, the component is read-only and cannot be interacted with. */
  disabled?: boolean;
  /** Whether keyboard navigation is enabled. */
  keyboard?: boolean;
  /** Size of the stars. */
  size?: 'small' | 'default' | 'large';
  /** Array of tooltip strings displayed on hover for each star. */
  tooltips?: string[];
  /** Custom character/icon rendered as each star. Receives `{ index }`. */
  character?: string;
}>();

/**
 * The current rating value.
 * Supports v-model for controlled usage.
 */
const model = defineModel<number>({ default: 0 });

const emit = defineEmits<{
  'hover-change': [value: number];
  change: [value: number];
  focus: [];
  blur: [];
  keydown: [event: KeyboardEvent];
}>();
//#endregion

//#region Internal state
const { componentUID } = useComponentId();
const hoverValue = ref(0);
const isFocused = ref(false);
const focusedIndex = ref(0);

const currentValue = computed(() =>
  hoverValue.value > 0 ? hoverValue.value : model.value,
);

const stars = computed(() => {
  const items: { index: number; value: number }[] = [];
  for (let i = 1; i <= count; i++) {
    items.push({ index: i, value: i });
  }
  return items;
});
//#endregion

//#region Star state
function getStarState(index: number): 'full' | 'half' | 'zero' {
  const val = currentValue.value;
  if (index <= Math.floor(val)) return 'full';
  if (allowHalf && index - 0.5 <= val && index > val) return 'half';
  return 'zero';
}
//#endregion

//#region Handlers
function handleClick(index: number, isHalf: boolean) {
  if (disabled) return;

  const newValue = isHalf && allowHalf ? index - 0.5 : index;

  if (allowClear && newValue === model.value) {
    model.value = 0;
    emit('change', 0);
  } else {
    model.value = newValue;
    emit('change', newValue);
  }
}

function handleMouseMove(index: number, event: MouseEvent) {
  if (disabled) return;

  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const isLeftHalf = event.clientX - rect.left < rect.width / 2;

  let newHoverValue: number;
  if (allowHalf && isLeftHalf) {
    newHoverValue = index - 0.5;
  } else {
    newHoverValue = index;
  }

  if (newHoverValue !== hoverValue.value) {
    hoverValue.value = newHoverValue;
    emit('hover-change', newHoverValue);
  }
}

function handleMouseLeave() {
  if (disabled) return;
  hoverValue.value = 0;
  emit('hover-change', 0);
}

function handleFocus() {
  isFocused.value = true;
  focusedIndex.value = Math.ceil(model.value) || 1;
  emit('focus');
}

function handleBlur() {
  isFocused.value = false;
  focusedIndex.value = 0;
  emit('blur');
}

function handleKeyDown(event: KeyboardEvent) {
  if (disabled || !keyboard) return;
  emit('keydown', event);

  const step = allowHalf ? 0.5 : 1;

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp': {
      event.preventDefault();
      const next = Math.min(model.value + step, count);
      model.value = next;
      focusedIndex.value = Math.ceil(next);
      emit('change', next);
      break;
    }
    case 'ArrowLeft':
    case 'ArrowDown': {
      event.preventDefault();
      const prev = Math.max(model.value - step, 0);
      model.value = prev;
      focusedIndex.value = Math.ceil(prev) || 1;
      emit('change', prev);
      break;
    }
    case 'Enter':
    case ' ': {
      event.preventDefault();
      if (allowClear && focusedIndex.value === Math.ceil(model.value)) {
        model.value = 0;
        emit('change', 0);
      }
      break;
    }
  }
}
//#endregion

//#region Expose
const rootRef = ref<HTMLElement | null>(null);

function focus() {
  rootRef.value?.focus();
}

function blur() {
  rootRef.value?.blur();
}

defineExpose({ focus, blur });
//#endregion

//#region Watch hover for tooltip
watch(hoverValue, (val) => {
  if (val === 0) {
    focusedIndex.value = Math.ceil(model.value) || 0;
  }
});
//#endregion
</script>

<template>
  <div
    ref="rootRef"
    class="b-rate"
    :class="[
      `b-rate--${size}`,
      {
        'b-rate--disabled': disabled,
        'b-rate--focused': isFocused,
      },
    ]"
    role="slider"
    :aria-label="$attrs['aria-label'] as string || 'Rating'"
    :aria-disabled="disabled || undefined"
    :aria-valuenow="model"
    :aria-valuemin="0"
    :aria-valuemax="count"
    :aria-valuetext="`${model} out of ${count} stars`"
    :tabindex="disabled ? -1 : 0"
    @mouseleave="handleMouseLeave"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeyDown"
  >
    <div
      v-for="star in stars"
      :key="star.index"
      class="b-rate__star"
      :class="{
        'b-rate__star--full': getStarState(star.index) === 'full',
        'b-rate__star--half': getStarState(star.index) === 'half',
        'b-rate__star--zero': getStarState(star.index) === 'zero',
        'b-rate__star--active': hoverValue > 0,
        'b-rate__star--focused': isFocused && focusedIndex === star.index,
      }"
      :title="tooltips[star.index - 1] || undefined"
      @mousemove="(e) => handleMouseMove(star.index, e)"
      @click="(e) => handleClick(star.index, allowHalf && (e.offsetX < (e.currentTarget as HTMLElement).offsetWidth / 2))"
    >
      <div class="b-rate__star-first" aria-hidden="true">
        <slot name="character" :index="star.index">
          <span v-if="character" class="b-rate__character" :data-character="character" />
          <svg
            v-else
            class="b-rate__icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        </slot>
      </div>
      <div class="b-rate__star-second" aria-hidden="true">
        <slot name="character" :index="star.index">
          <span v-if="character" class="b-rate__character" :data-character="character" />
          <svg
            v-else
            class="b-rate__icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
        </slot>
      </div>
    </div>

    <input
      type="hidden"
      :name="`b-rate-${componentUID}`"
      :value="model"
    />
  </div>
</template>

<style scoped>
.b-rate {
  --b-rate-star-bg: rgba(0, 0, 0, 0.06);
  --b-rate-star-color: #fadb14;
  --b-rate-star-hover-scale: scale(1.1);
  --b-rate-star-size: 20px;

  display: inline-flex;
  gap: 8px;
  align-items: center;
  outline: none;
  cursor: pointer;
  line-height: 1;
}

.b-rate--small {
  --b-rate-star-size: 15px;
  gap: 6px;
}

.b-rate--large {
  --b-rate-star-size: 25px;
  gap: 10px;
}

.b-rate--disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.b-rate:focus-visible {
  outline: 2px solid var(--b-rate-star-color);
  outline-offset: 4px;
  border-radius: 2px;
}

.b-rate__star {
  position: relative;
  display: inline-flex;
  width: var(--b-rate-star-size);
  height: var(--b-rate-star-size);
  cursor: pointer;
  transition: transform 0.15s ease;
}

.b-rate--disabled .b-rate__star {
  cursor: not-allowed;
}

.b-rate__star:not(.b-rate--disabled .b-rate__star):hover {
  transform: var(--b-rate-star-hover-scale);
}

.b-rate__star--focused {
  outline: 2px solid var(--b-rate-star-color);
  outline-offset: 2px;
  border-radius: 2px;
}

.b-rate__star-first,
.b-rate__star-second {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
}

.b-rate__star-first {
  width: 50%;
  overflow: hidden;
  z-index: 1;
}

.b-rate__star-second {
  z-index: 0;
}

/* Zero state: both halves use background color */
.b-rate__star--zero .b-rate__star-first,
.b-rate__star--zero .b-rate__star-second {
  color: var(--b-rate-star-bg);
}

/* Full state: both halves use active color */
.b-rate__star--full .b-rate__star-first,
.b-rate__star--full .b-rate__star-second {
  color: var(--b-rate-star-color);
}

/* Half state: first half active, second half background */
.b-rate__star--half .b-rate__star-first {
  color: var(--b-rate-star-color);
}

.b-rate__star--half .b-rate__star-second {
  color: var(--b-rate-star-bg);
}

.b-rate__icon {
  width: var(--b-rate-star-size);
  height: var(--b-rate-star-size);
  flex-shrink: 0;
  display: block;
}

.b-rate__character {
  font-size: var(--b-rate-star-size);
  line-height: 1;
  white-space: nowrap;
}

.b-rate__character::before {
  content: attr(data-character);
}

/* Dark mode */
[data-prefers-color='dark'] .b-rate {
  --b-rate-star-bg: rgba(255, 255, 255, 0.12);
  --b-rate-star-color: #fadb14;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .b-rate__star {
    transition: none;
  }
}
</style>
