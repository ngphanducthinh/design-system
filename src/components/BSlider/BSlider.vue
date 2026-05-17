<script lang="ts" setup>
defineOptions({ inheritAttrs: false });

import { computed, onBeforeUnmount, ref, useAttrs } from 'vue';
import type { BSliderMarks, BSliderRange, BSliderTooltip } from './types.ts';

const attrs = useAttrs();

//#region Props
const {
  disabled = false,
  dots = false,
  included = true,
  keyboard = true,
  max = 100,
  min = 0,
  range = false,
  reverse = false,
  step = 1,
  vertical = false,
  tooltip = {},
  marks,
} = defineProps<{
  /** Whether the slider is disabled. */
  disabled?: boolean;
  /** Whether only dots can be selected (step snap). */
  dots?: boolean;
  /** Whether the track between handles is filled. */
  included?: boolean;
  /** Whether keyboard navigation is enabled. */
  keyboard?: boolean;
  /** Maximum value. */
  max?: number;
  /** Minimum value. */
  min?: number;
  /** Whether range mode is enabled (dual handles). Can also be an object with draggableTrack. */
  range?: boolean | BSliderRange;
  /** Whether the slider is reversed. */
  reverse?: boolean;
  /** Step granularity. null means only marks are selectable. */
  step?: number | null;
  /** Whether the slider is vertical. */
  vertical?: boolean;
  /** Tooltip configuration. */
  tooltip?: BSliderTooltip;
  /** Tick marks on the slider. Keys are percentages (0–100 mapped to min–max). */
  marks?: BSliderMarks;
}>();

const model = defineModel<number | [number, number]>({ default: 0 });

const emit = defineEmits<{
  change: [value: number | [number, number]];
  changeComplete: [value: number | [number, number]];
}>();
//#endregion

//#region Internal state
const railRef = ref<HTMLElement | null>(null);
const rootRef = ref<HTMLElement | null>(null);

const dragging = ref<null | 'lower' | 'upper' | 'track'>(null);
const hovered = ref(false);
const focusedHandle = ref<'lower' | 'upper' | null>(null);
const tooltipVisible = ref<{ lower: boolean; upper: boolean }>({ lower: false, upper: false });

const trackDragStartValue = ref<[number, number] | null>(null);
const trackDragStartPos = ref(0);
//#endregion

//#region Computed values
const isRange = computed(() => range !== false);
const draggableTrack = computed(() => typeof range === 'object' && range.draggableTrack);

const lowerValue = computed(() => {
  if (isRange.value) {
    const v = model.value as [number, number];
    return v[0];
  }
  return min;
});

const upperValue = computed(() => {
  if (isRange.value) {
    const v = model.value as [number, number];
    return v[1];
  }
  return model.value as number;
});

function valueToPercent(value: number): number {
  if (max === min) return 0;
  return ((value - min) / (max - min)) * 100;
}

function percentToValue(percent: number): number {
  const raw = min + (percent / 100) * (max - min);
  return snapToStep(raw);
}

function snapToStep(value: number): number {
  if (step === null) {
    if (!marks) return clamp(value);
    const markValues = Object.keys(marks).map(Number);
    let closest = markValues[0] ?? min;
    let closestDist = Math.abs(value - closest);
    for (const mv of markValues) {
      const dist = Math.abs(value - mv);
      if (dist < closestDist) {
        closest = mv;
        closestDist = dist;
      }
    }
    return clamp(closest);
  }
  const stepped = Math.round((value - min) / step) * step + min;
  return clamp(stepped);
}

function clamp(value: number): number {
  return Math.min(max, Math.max(min, value));
}

const lowerPercent = computed(() => valueToPercent(lowerValue.value));
const upperPercent = computed(() => valueToPercent(upperValue.value));

const trackStyle = computed(() => {
  const start = isRange.value ? lowerPercent.value : 0;
  const length = isRange.value
    ? upperPercent.value - lowerPercent.value
    : upperPercent.value;

  if (vertical) {
    return reverse
      ? { top: `${100 - start - length}%`, height: `${length}%` }
      : { bottom: `${100 - start - length}%`, height: `${length}%` };
  }
  return reverse
    ? { right: `${start}%`, width: `${length}%` }
    : { left: `${start}%`, width: `${length}%` };
});

const lowerHandleStyle = computed(() => {
  const pct = lowerPercent.value;
  if (vertical) {
    return reverse ? { top: `${100 - pct}%` } : { bottom: `${100 - pct}%` };
  }
  return reverse ? { right: `${pct}%` } : { left: `${pct}%` };
});

const upperHandleStyle = computed(() => {
  const pct = upperPercent.value;
  if (vertical) {
    return reverse ? { top: `${100 - pct}%` } : { bottom: `${100 - pct}%` };
  }
  return reverse ? { right: `${pct}%` } : { left: `${pct}%` };
});

const markList = computed(() => {
  if (!marks) return [];
  return Object.entries(marks).map(([key, val]) => {
    const numKey = Number(key);
    const percent = valueToPercent(numKey);
    const isActive =
      included &&
      (isRange.value
        ? numKey >= lowerValue.value && numKey <= upperValue.value
        : numKey <= upperValue.value);
    const label = typeof val === 'string' ? val : val.label;
    const style = typeof val === 'object' ? val.style : undefined;
    return { value: numKey, percent, isActive, label, style };
  });
});

const dotList = computed(() => {
  if (!dots || step === null) return [];
  const result: { value: number; percent: number; isActive: boolean }[] = [];
  for (let v = min; v <= max; v += step) {
    const percent = valueToPercent(v);
    const isActive =
      included &&
      (isRange.value
        ? v >= lowerValue.value && v <= upperValue.value
        : v <= upperValue.value);
    result.push({ value: v, percent, isActive });
  }
  return result;
});

function formatTooltip(value: number): string | null {
  if (tooltip.formatter === null) return null;
  if (tooltip.formatter) return tooltip.formatter(value);
  return String(value);
}

const lowerTooltipText = computed(() => formatTooltip(lowerValue.value));
const upperTooltipText = computed(() => formatTooltip(upperValue.value));

const showLowerTooltip = computed(() => {
  if (tooltip.formatter === null) return false;
  if (tooltip.open !== undefined) return tooltip.open;
  return tooltipVisible.value.lower || dragging.value === 'lower' || dragging.value === 'track';
});

const showUpperTooltip = computed(() => {
  if (tooltip.formatter === null) return false;
  if (tooltip.open !== undefined) return tooltip.open;
  return tooltipVisible.value.upper || dragging.value === 'upper' || dragging.value === 'track';
});
//#endregion

//#region Event handlers
function getPercentFromEvent(event: MouseEvent | TouchEvent): number {
  if (!railRef.value) return 0;
  const rect = railRef.value.getBoundingClientRect();
  let clientPos: number;
  let size: number;

  if ('touches' in event) {
    clientPos = vertical ? event.touches[0].clientY : event.touches[0].clientX;
  } else {
    clientPos = vertical ? event.clientY : event.clientX;
  }

  if (vertical) {
    size = rect.height;
    const offset = clientPos - rect.top;
    return reverse ? (offset / size) * 100 : ((size - offset) / size) * 100;
  } else {
    size = rect.width;
    const offset = clientPos - rect.left;
    return reverse ? ((size - offset) / size) * 100 : (offset / size) * 100;
  }
}

function getCloserHandle(percent: number): 'lower' | 'upper' {
  if (!isRange.value) return 'upper';
  const distToLower = Math.abs(percent - lowerPercent.value);
  const distToUpper = Math.abs(percent - upperPercent.value);
  if (distToLower < distToUpper) return 'lower';
  if (distToUpper < distToLower) return 'upper';
  return percent < lowerPercent.value ? 'lower' : 'upper';
}

function updateValue(handle: 'lower' | 'upper', newValue: number) {
  if (isRange.value) {
    const current = model.value as [number, number];
    let updated: [number, number];
    if (handle === 'lower') {
      updated = [Math.min(newValue, current[1]), current[1]];
    } else {
      updated = [current[0], Math.max(newValue, current[0])];
    }
    model.value = updated;
    emit('change', updated);
  } else {
    model.value = newValue;
    emit('change', newValue);
  }
}

function handleRailClick(event: MouseEvent) {
  if (disabled) return;
  if ((event.target as HTMLElement).closest('.b-slider__handle')) return;

  const percent = getPercentFromEvent(event);
  const value = percentToValue(percent);
  const handle = getCloserHandle(percent);

  if (draggableTrack.value && isRange.value) {
    const lp = lowerPercent.value;
    const up = upperPercent.value;
    if (percent >= lp && percent <= up) return;
  }

  updateValue(handle, value);
  emit('changeComplete', isRange.value ? (model.value as [number, number]) : (model.value as number));
}

function handleDragStart(handle: 'lower' | 'upper' | 'track', event: MouseEvent | TouchEvent) {
  if (disabled) return;
  event.preventDefault();
  dragging.value = handle;

  if (handle === 'track' && isRange.value) {
    trackDragStartValue.value = [...(model.value as [number, number])] as [number, number];
    trackDragStartPos.value = getPercentFromEvent(event);
  }

  document.addEventListener('mousemove', handleDragMove);
  document.addEventListener('mouseup', handleDragEnd);
  document.addEventListener('touchmove', handleDragMove);
  document.addEventListener('touchend', handleDragEnd);
}

function handleDragMove(event: MouseEvent | TouchEvent) {
  if (!dragging.value || disabled) return;
  const percent = getPercentFromEvent(event);

  if (dragging.value === 'track' && trackDragStartValue.value) {
    const delta = percent - trackDragStartPos.value;
    const startLower = trackDragStartValue.value[0];
    const startUpper = trackDragStartValue.value[1];
    const lowerPct = valueToPercent(startLower) + delta;
    const upperPct = valueToPercent(startUpper) + delta;

    const newLower = percentToValue(lowerPct);
    const newUpper = percentToValue(upperPct);

    if (newLower >= min && newUpper <= max) {
      model.value = [newLower, newUpper];
      emit('change', [newLower, newUpper]);
    }
    return;
  }

  const value = percentToValue(percent);
  updateValue(dragging.value as 'lower' | 'upper', value);
}

function handleDragEnd() {
  if (dragging.value) {
    emit('changeComplete', isRange.value ? (model.value as [number, number]) : (model.value as number));
  }
  dragging.value = null;
  trackDragStartValue.value = null;
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
  document.removeEventListener('touchmove', handleDragMove);
  document.removeEventListener('touchend', handleDragEnd);
}

function handleKeyDown(event: KeyboardEvent, handle: 'lower' | 'upper') {
  if (disabled || !keyboard) return;
  const effectiveStep = step ?? 1;
  let delta = 0;

  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      delta = effectiveStep;
      break;
    case 'ArrowLeft':
    case 'ArrowDown':
      delta = -effectiveStep;
      break;
    case 'Home':
      delta = min - (handle === 'lower' ? lowerValue.value : upperValue.value);
      break;
    case 'End':
      delta = max - (handle === 'lower' ? lowerValue.value : upperValue.value);
      break;
    default:
      return;
  }

  event.preventDefault();
  const currentVal = handle === 'lower' ? lowerValue.value : upperValue.value;
  const newValue = snapToStep(currentVal + delta);
  updateValue(handle, newValue);
  emit('changeComplete', isRange.value ? (model.value as [number, number]) : (model.value as number));
}

function handleHandleFocus(handle: 'lower' | 'upper') {
  focusedHandle.value = handle;
  tooltipVisible.value[handle] = true;
}

function handleHandleBlur(handle: 'lower' | 'upper') {
  focusedHandle.value = null;
  tooltipVisible.value[handle] = false;
}

function handleHandleMouseEnter(handle: 'lower' | 'upper') {
  tooltipVisible.value[handle] = true;
}

function handleHandleMouseLeave(handle: 'lower' | 'upper') {
  if (focusedHandle.value !== handle && dragging.value !== handle) {
    tooltipVisible.value[handle] = false;
  }
}

function handleMouseEnter() {
  hovered.value = true;
}

function handleMouseLeave() {
  hovered.value = false;
}

function handleTrackMouseDown(event: MouseEvent) {
  if (disabled || !draggableTrack.value) return;
  handleDragStart('track', event);
}
//#endregion

//#region Expose
function focus() {
  const el = rootRef.value?.querySelector('.b-slider__handle') as HTMLElement | null;
  el?.focus();
}

function blur() {
  const el = rootRef.value?.querySelector('.b-slider__handle:focus') as HTMLElement | null;
  el?.blur();
}

defineExpose({ focus, blur });
//#endregion

//#region Cleanup
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', handleDragMove);
  document.removeEventListener('mouseup', handleDragEnd);
  document.removeEventListener('touchmove', handleDragMove);
  document.removeEventListener('touchend', handleDragEnd);
});
//#endregion
</script>

<template>
  <div
    ref="rootRef"
    class="b-slider"
    :class="[
      {
        'b-slider--vertical': vertical,
        'b-slider--disabled': disabled,
        'b-slider--with-marks': !!marks,
        'b-slider--reverse': reverse,
        'b-slider--hovered': hovered,
      },
    ]"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Rail -->
    <div
      ref="railRef"
      class="b-slider__rail"
      @mousedown="handleRailClick"
    >
      <!-- Track -->
      <div
        v-if="included"
        class="b-slider__track"
        :style="trackStyle"
        @mousedown.stop="handleTrackMouseDown"
      />

      <!-- Dots -->
      <span
        v-for="dot in dotList"
        :key="`dot-${dot.value}`"
        class="b-slider__dot"
        :class="{ 'b-slider__dot--active': dot.isActive }"
        :style="vertical
          ? (reverse ? { top: `${100 - dot.percent}%` } : { bottom: `${100 - dot.percent}%` })
          : (reverse ? { right: `${dot.percent}%` } : { left: `${dot.percent}%` })
        "
      />

      <!-- Marks -->
      <span
        v-for="mark in markList"
        :key="`mark-dot-${mark.value}`"
        class="b-slider__dot"
        :class="{ 'b-slider__dot--active': mark.isActive }"
        :style="vertical
          ? (reverse ? { top: `${100 - mark.percent}%` } : { bottom: `${100 - mark.percent}%` })
          : (reverse ? { right: `${mark.percent}%` } : { left: `${mark.percent}%` })
        "
      />

      <!-- Lower handle (range only) -->
      <div
        v-if="isRange"
        class="b-slider__handle"
        :class="{
          'b-slider__handle--active': dragging === 'lower' || focusedHandle === 'lower',
        }"
        :style="lowerHandleStyle"
        role="slider"
        :tabindex="disabled ? -1 : 0"
        :aria-valuemin="min"
        :aria-valuemax="upperValue"
        :aria-valuenow="lowerValue"
        :aria-disabled="disabled || undefined"
        :aria-orientation="vertical ? 'vertical' : 'horizontal'"
        :aria-label="(attrs['aria-label'] as string) ? `${attrs['aria-label']} - minimum` : 'Minimum'"
        @mousedown="(e) => handleDragStart('lower', e)"
        @touchstart="(e) => handleDragStart('lower', e)"
        @keydown="(e) => handleKeyDown(e, 'lower')"
        @focus="handleHandleFocus('lower')"
        @blur="handleHandleBlur('lower')"
        @mouseenter="handleHandleMouseEnter('lower')"
        @mouseleave="handleHandleMouseLeave('lower')"
      >
        <div
          v-if="lowerTooltipText !== null"
          class="b-slider__tooltip"
          :class="{ 'b-slider__tooltip--visible': showLowerTooltip }"
          role="tooltip"
        >
          {{ lowerTooltipText }}
        </div>
      </div>

      <!-- Upper handle (always) -->
      <div
        class="b-slider__handle"
        :class="{
          'b-slider__handle--active': dragging === 'upper' || focusedHandle === 'upper',
        }"
        :style="upperHandleStyle"
        role="slider"
        :tabindex="disabled ? -1 : 0"
        :aria-valuemin="isRange ? lowerValue : min"
        :aria-valuemax="max"
        :aria-valuenow="upperValue"
        :aria-disabled="disabled || undefined"
        :aria-orientation="vertical ? 'vertical' : 'horizontal'"
        :aria-label="(attrs['aria-label'] as string) || (isRange ? 'Maximum' : 'Slider')"
        @mousedown="(e) => handleDragStart('upper', e)"
        @touchstart="(e) => handleDragStart('upper', e)"
        @keydown="(e) => handleKeyDown(e, 'upper')"
        @focus="handleHandleFocus('upper')"
        @blur="handleHandleBlur('upper')"
        @mouseenter="handleHandleMouseEnter('upper')"
        @mouseleave="handleHandleMouseLeave('upper')"
      >
        <div
          v-if="upperTooltipText !== null"
          class="b-slider__tooltip"
          :class="{ 'b-slider__tooltip--visible': showUpperTooltip }"
          role="tooltip"
        >
          {{ upperTooltipText }}
        </div>
      </div>
    </div>

    <!-- Mark labels -->
    <div v-if="marks" class="b-slider__marks">
      <span
        v-for="mark in markList"
        :key="`mark-label-${mark.value}`"
        class="b-slider__mark-text"
        :class="{ 'b-slider__mark-text--active': mark.isActive }"
        :style="{
          ...(vertical
            ? (reverse ? { top: `${100 - mark.percent}%` } : { bottom: `${100 - mark.percent}%` })
            : (reverse ? { right: `${mark.percent}%` } : { left: `${mark.percent}%` })
          ),
          ...mark.style,
        }"
      >
        {{ mark.label }}
      </span>
    </div>
  </div>
</template>

<style>
.b-slider {
  --b-slider-rail-bg: rgba(0, 0, 0, 0.04);
  --b-slider-rail-hover-bg: rgba(0, 0, 0, 0.06);
  --b-slider-rail-size: 4px;
  --b-slider-track-bg: #91caff;
  --b-slider-track-bg-disabled: rgba(0, 0, 0, 0.04);
  --b-slider-track-hover-bg: #69b1ff;
  --b-slider-handle-color: #91caff;
  --b-slider-handle-color-disabled: #bfbfbf;
  --b-slider-handle-active-color: #1677ff;
  --b-slider-handle-active-outline-color: rgba(22, 119, 255, 0.2);
  --b-slider-handle-line-width: 2px;
  --b-slider-handle-line-width-hover: 2.5px;
  --b-slider-handle-size: 10px;
  --b-slider-handle-size-hover: 12px;
  --b-slider-dot-border-color: #f0f0f0;
  --b-slider-dot-active-border-color: #91caff;
  --b-slider-dot-size: 8px;
  --b-slider-control-size: 10px;

  position: relative;
  box-sizing: border-box;
  padding: 4px 0;
  cursor: pointer;
  touch-action: none;
}

.b-slider--vertical {
  display: inline-block;
  height: 100%;
  min-height: 200px;
  padding: 0 4px;
}

.b-slider--disabled {
  cursor: not-allowed;
}

/* Rail */
.b-slider__rail {
  position: relative;
  width: 100%;
  height: var(--b-slider-rail-size);
  background-color: var(--b-slider-rail-bg);
  border-radius: calc(var(--b-slider-rail-size) / 2);
  transition: background-color 0.2s;
}

.b-slider--hovered:not(.b-slider--disabled) .b-slider__rail {
  background-color: var(--b-slider-rail-hover-bg);
}

.b-slider--vertical .b-slider__rail {
  width: var(--b-slider-rail-size);
  height: 100%;
}

/* Track */
.b-slider__track {
  position: absolute;
  height: 100%;
  background-color: var(--b-slider-track-bg);
  border-radius: calc(var(--b-slider-rail-size) / 2);
  transition: background-color 0.2s;
}

.b-slider--hovered:not(.b-slider--disabled) .b-slider__track {
  background-color: var(--b-slider-track-hover-bg);
}

.b-slider--disabled .b-slider__track {
  background-color: var(--b-slider-track-bg-disabled);
}

.b-slider--vertical .b-slider__track {
  width: 100%;
  height: auto;
}

/* Handle */
.b-slider__handle {
  position: absolute;
  top: 50%;
  width: var(--b-slider-handle-size);
  height: var(--b-slider-handle-size);
  background-color: #fff;
  border: var(--b-slider-handle-line-width) solid var(--b-slider-handle-color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: grab;
  outline: none;
  transition:
    width 0.2s,
    height 0.2s,
    border-color 0.2s,
    border-width 0.2s,
    box-shadow 0.2s;
  touch-action: none;
  z-index: 1;
}

.b-slider--vertical .b-slider__handle {
  top: auto;
  left: 50%;
  transform: translate(-50%, 50%);
}

.b-slider__handle:hover,
.b-slider__handle:focus-visible {
  width: var(--b-slider-handle-size-hover);
  height: var(--b-slider-handle-size-hover);
  border-width: var(--b-slider-handle-line-width-hover);
  border-color: var(--b-slider-handle-active-color);
}

.b-slider__handle--active {
  width: var(--b-slider-handle-size-hover);
  height: var(--b-slider-handle-size-hover);
  border-width: var(--b-slider-handle-line-width-hover);
  border-color: var(--b-slider-handle-active-color);
  box-shadow: 0 0 0 4px var(--b-slider-handle-active-outline-color);
  cursor: grabbing;
}

.b-slider__handle:focus-visible {
  box-shadow: 0 0 0 4px var(--b-slider-handle-active-outline-color);
}

.b-slider--disabled .b-slider__handle {
  border-color: var(--b-slider-handle-color-disabled);
  cursor: not-allowed;
  box-shadow: none;
}

.b-slider--disabled .b-slider__handle:hover,
.b-slider--disabled .b-slider__handle:focus-visible {
  width: var(--b-slider-handle-size);
  height: var(--b-slider-handle-size);
  border-width: var(--b-slider-handle-line-width);
  border-color: var(--b-slider-handle-color-disabled);
  box-shadow: none;
}

/* Tooltip */
.b-slider__tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%) scale(0.8);
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.85);
  color: #fff;
  font-size: 12px;
  line-height: 1.4;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.b-slider__tooltip--visible {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

.b-slider--vertical .b-slider__tooltip {
  bottom: auto;
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%) scale(0.8);
}

.b-slider--vertical .b-slider__tooltip--visible {
  transform: translateY(-50%) scale(1);
}

/* Dots */
.b-slider__dot {
  position: absolute;
  top: 50%;
  width: var(--b-slider-dot-size);
  height: var(--b-slider-dot-size);
  background-color: #fff;
  border: 2px solid var(--b-slider-dot-border-color);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.b-slider--vertical .b-slider__dot {
  top: auto;
  left: 50%;
  transform: translate(-50%, 50%);
}

.b-slider__dot--active {
  border-color: var(--b-slider-dot-active-border-color);
}

/* Marks */
.b-slider__marks {
  position: relative;
}

.b-slider--vertical .b-slider__marks {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  pointer-events: none;
}

.b-slider__mark-text {
  position: absolute;
  top: 8px;
  transform: translateX(-50%);
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  white-space: nowrap;
  user-select: none;
}

.b-slider--vertical .b-slider__mark-text {
  top: auto;
  left: 20px;
  transform: translateY(50%);
}

.b-slider__mark-text--active {
  color: rgba(0, 0, 0, 0.88);
}

/* Dark mode */
[data-prefers-color='dark'] .b-slider {
  --b-slider-rail-bg: rgba(255, 255, 255, 0.08);
  --b-slider-rail-hover-bg: rgba(255, 255, 255, 0.12);
  --b-slider-track-bg: #177ddc;
  --b-slider-track-bg-disabled: rgba(255, 255, 255, 0.08);
  --b-slider-track-hover-bg: #3c9ae8;
  --b-slider-handle-color: #177ddc;
  --b-slider-handle-color-disabled: rgba(255, 255, 255, 0.3);
  --b-slider-handle-active-color: #3c9ae8;
  --b-slider-handle-active-outline-color: rgba(23, 125, 220, 0.2);
  --b-slider-dot-border-color: rgba(255, 255, 255, 0.12);
  --b-slider-dot-active-border-color: #177ddc;
}

[data-prefers-color='dark'] .b-slider__tooltip {
  background-color: rgba(255, 255, 255, 0.9);
  color: #141414;
}

[data-prefers-color='dark'] .b-slider__handle {
  background-color: #141414;
}

[data-prefers-color='dark'] .b-slider__mark-text {
  color: rgba(255, 255, 255, 0.65);
}

[data-prefers-color='dark'] .b-slider__mark-text--active {
  color: rgba(255, 255, 255, 0.88);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .b-slider__handle,
  .b-slider__track,
  .b-slider__rail,
  .b-slider__tooltip {
    transition: none;
  }
}
</style>
