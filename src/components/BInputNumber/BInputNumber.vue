<script setup lang="ts">
import { BInputStatus, BInputVariant } from '@/components/BInput/types.ts';
import { useComponentId } from '@/composables/useComponentId.ts';
import { BCommonSize } from '@/types.ts';
import { computed, ref, useSlots, watch } from 'vue';
import type { BInputNumberFocusOptions, BInputNumberStepInfo } from './types.ts';

defineOptions({ inheritAttrs: false });

const slots = useSlots();

const {
  size = BCommonSize.Medium,
  variant = BInputVariant.Outlined,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  disabled = false,
  readOnly = false,
  controls = true,
  keyboard = true,
  changeOnBlur = true,
  changeOnWheel = false,
  placeholder,
  id,
  precision,
  formatter,
  parser,
  decimalSeparator,
  stringMode = false,
  status,
} = defineProps<{
  /** The size of the input number. */
  size?: `${BCommonSize}`;
  /** Visual variant of the input number. */
  variant?: `${BInputVariant}`;
  /** Validation status. */
  status?: `${BInputStatus}`;
  /** Minimum value allowed. */
  min?: number;
  /** Maximum value allowed. */
  max?: number;
  /** Increment/decrement step amount. */
  step?: number;
  /** Whether the input number is disabled. */
  disabled?: boolean;
  /** Whether the input number is read-only. */
  readOnly?: boolean;
  /** Whether to show +/- controls. */
  controls?: boolean;
  /** Whether keyboard up/down changes value. */
  keyboard?: boolean;
  /** Whether to trigger change on blur (e.g. reset out-of-range). */
  changeOnBlur?: boolean;
  /** Whether mouse wheel changes value. */
  changeOnWheel?: boolean;
  /** Placeholder text. */
  placeholder?: string;
  /** HTML id attribute. */
  id?: string;
  /** Decimal precision for display. */
  precision?: number;
  /** Format the displayed value. */
  formatter?: (value: string | number) => string;
  /** Parse the formatted value back to a number. */
  parser?: (displayValue: string) => string;
  /** Custom decimal separator character. */
  decimalSeparator?: string;
  /** Use string mode for high-precision decimals. */
  stringMode?: boolean;
}>();

const emit = defineEmits<{
  /** Fired when value changes. */
  change: [value: number | null];
  /** Fired when Enter key is pressed. */
  pressEnter: [event: KeyboardEvent];
  /** Fired on step (button, keyboard, or wheel). */
  step: [value: number | null, info: BInputNumberStepInfo];
  /** Fired on input focus. */
  focus: [event: FocusEvent];
  /** Fired on input blur. */
  blur: [event: FocusEvent];
}>();

const model = defineModel<number | null>({ default: null });

const { componentUID } = useComponentId();
const inputId = computed(() => id ?? `b-input-number-${componentUID.value}`);

const inputRef = ref<HTMLInputElement | null>(null);
const isFocused = ref(false);
const displayValue = ref('');

const hasPrefix = computed(() => !!slots.prefix);
const hasSuffix = computed(() => !!slots.suffix);

const isUpDisabled = computed(() => {
  if (disabled || readOnly) return true;
  if (model.value === null) return false;
  return model.value >= max;
});

const isDownDisabled = computed(() => {
  if (disabled || readOnly) return true;
  if (model.value === null) return false;
  return model.value <= min;
});

function toFixedPrecision(val: number): number {
  if (precision !== undefined) {
    return parseFloat(val.toFixed(precision));
  }
  const stepStr = String(step);
  const stepDecimals = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
  if (stepDecimals > 0) {
    return parseFloat(val.toFixed(stepDecimals));
  }
  return val;
}

function clamp(val: number): number {
  return Math.min(max, Math.max(min, val));
}

function formatValue(val: number | null): string {
  if (val === null) return '';
  let str: string;
  if (precision !== undefined) {
    str = val.toFixed(precision);
  } else {
    str = String(val);
  }
  if (decimalSeparator) {
    str = str.replace('.', decimalSeparator);
  }
  if (formatter) {
    return formatter(stringMode ? str : val);
  }
  return str;
}

function parseInput(input: string): number | null {
  if (!input.trim()) return null;
  let parsed = input;
  if (parser) {
    parsed = parser(input);
  } else if (decimalSeparator) {
    parsed = parsed.replace(decimalSeparator, '.');
  }
  const num = Number(parsed);
  if (isNaN(num)) return model.value;
  return num;
}

function syncDisplay() {
  displayValue.value = formatValue(model.value);
}

function updateValue(newVal: number | null, triggerChange = true) {
  if (newVal !== null) {
    newVal = toFixedPrecision(clamp(newVal));
  }
  const changed = newVal !== model.value;
  model.value = newVal;
  syncDisplay();
  if (changed && triggerChange) {
    emit('change', newVal);
  }
}

function stepValue(direction: 'up' | 'down') {
  if (disabled || readOnly) return;
  const current = model.value ?? 0;
  const offset = direction === 'up' ? step : -step;
  const next = toFixedPrecision(current + offset);
  const clamped = clamp(next);
  updateValue(clamped);
  emit('step', clamped, { offset: step, type: direction });
}

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  displayValue.value = target.value;
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    commitValue();
    emit('pressEnter', e);
  }
  if (!keyboard) return;
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    stepValue('up');
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    stepValue('down');
  }
};

const handleFocus = (e: FocusEvent) => {
  isFocused.value = true;
  emit('focus', e);
};

const handleBlur = (e: FocusEvent) => {
  isFocused.value = false;
  if (changeOnBlur) {
    commitValue();
  }
  emit('blur', e);
};

const handleWheel = (e: WheelEvent) => {
  if (!changeOnWheel || disabled || readOnly || !isFocused.value) return;
  e.preventDefault();
  if (e.deltaY < 0) {
    stepValue('up');
  } else if (e.deltaY > 0) {
    stepValue('down');
  }
};

function commitValue() {
  const parsed = parseInput(displayValue.value);
  if (parsed === null) {
    updateValue(null);
  } else {
    updateValue(parsed);
  }
}

const focus = (options?: BInputNumberFocusOptions) => {
  inputRef.value?.focus({ preventScroll: options?.preventScroll });
  if (options?.cursor && inputRef.value) {
    const len = inputRef.value.value.length;
    switch (options.cursor) {
      case 'start':
        inputRef.value.setSelectionRange(0, 0);
        break;
      case 'end':
        inputRef.value.setSelectionRange(len, len);
        break;
      case 'all':
        inputRef.value.setSelectionRange(0, len);
        break;
    }
  }
};

const blur = () => {
  inputRef.value?.blur();
};

watch(
  () => model.value,
  () => {
    if (!isFocused.value) {
      syncDisplay();
    }
  },
  { immediate: true },
);

defineExpose({ focus, blur });
</script>

<template>
  <span
    class="b-input-number"
    :class="[
      `b-input-number--${size}`,
      `b-input-number--${variant}`,
      {
        'b-input-number--focused': isFocused,
        'b-input-number--disabled': disabled,
        'b-input-number--readonly': readOnly,
        'b-input-number--error': status === BInputStatus.Error,
        'b-input-number--warning': status === BInputStatus.Warning,
        'b-input-number--has-controls': controls,
      },
    ]"
  >
    <span class="b-input-number__wrapper">
      <span v-if="hasPrefix" class="b-input-number__prefix" aria-hidden="true">
        <slot name="prefix" />
      </span>

      <input
        :id="inputId"
        ref="inputRef"
        :value="displayValue"
        type="text"
        inputmode="decimal"
        role="spinbutton"
        :aria-valuenow="model ?? undefined"
        :aria-valuemin="min !== Number.MIN_SAFE_INTEGER ? min : undefined"
        :aria-valuemax="max !== Number.MAX_SAFE_INTEGER ? max : undefined"
        :aria-invalid="status === BInputStatus.Error ? true : undefined"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readOnly"
        class="b-input-number__input"
        @input="handleInput"
        @keydown="handleKeyDown"
        @focus="handleFocus"
        @blur="handleBlur"
        @wheel="handleWheel"
      />

      <span v-if="hasSuffix" class="b-input-number__suffix" aria-hidden="true">
        <slot name="suffix" />
      </span>

      <span v-if="controls" class="b-input-number__handler-wrap" aria-hidden="true">
        <span
          class="b-input-number__handler b-input-number__handler--up"
          :class="{ 'b-input-number__handler--disabled': isUpDisabled }"
          role="button"
          tabindex="-1"
          aria-label="Increase value"
          :aria-disabled="isUpDisabled"
          @mousedown.prevent="!isUpDisabled && stepValue('up')"
        >
          <svg
            viewBox="0 0 1024 1024"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M890.5 755.3L537.9 269.2c-12.8-17.6-39-17.6-51.7 0L133.5 755.3A8 8 0 00140 768h286c2.1 0 4.2-.8 5.7-2.3l70.3-70.3 70.3 70.3c1.5 1.5 3.5 2.3 5.7 2.3h286c6.5 0 10.3-7.4 6.5-12.7z"
            />
          </svg>
        </span>
        <span
          class="b-input-number__handler b-input-number__handler--down"
          :class="{ 'b-input-number__handler--disabled': isDownDisabled }"
          role="button"
          tabindex="-1"
          aria-label="Decrease value"
          :aria-disabled="isDownDisabled"
          @mousedown.prevent="!isDownDisabled && stepValue('down')"
        >
          <svg
            viewBox="0 0 1024 1024"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z"
            />
          </svg>
        </span>
      </span>
    </span>
  </span>
</template>

<style scoped>
.b-input-number {
  --b-input-number-active-bg: #ffffff;
  --b-input-number-active-border-color: #1677ff;
  --b-input-number-active-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
  --b-input-number-addon-bg: rgba(0, 0, 0, 0.02);
  --b-input-number-control-width: 90px;
  --b-input-number-error-active-shadow: 0 0 0 2px rgba(255, 38, 5, 0.06);
  --b-input-number-filled-handle-bg: #f0f0f0;
  --b-input-number-handle-active-bg: rgba(0, 0, 0, 0.02);
  --b-input-number-handle-bg: #ffffff;
  --b-input-number-handle-border-color: #d9d9d9;
  --b-input-number-handle-font-size: 7px;
  --b-input-number-handle-hover-color: #1677ff;
  --b-input-number-handle-width: 22px;
  --b-input-number-hover-bg: #ffffff;
  --b-input-number-hover-border-color: #4096ff;
  --b-input-number-font-size: 14px;
  --b-input-number-font-size-lg: 16px;
  --b-input-number-font-size-sm: 14px;
  --b-input-number-padding-block: 4px;
  --b-input-number-padding-block-lg: 7px;
  --b-input-number-padding-block-sm: 0px;
  --b-input-number-padding-inline: 11px;
  --b-input-number-padding-inline-lg: 11px;
  --b-input-number-padding-inline-sm: 7px;
  --b-input-number-warning-active-shadow: 0 0 0 2px rgba(255, 215, 5, 0.1);
  --b-input-number-border-color: #d9d9d9;
  --b-input-number-bg: #ffffff;
  --b-input-number-color: rgba(0, 0, 0, 0.88);
  --b-input-number-placeholder-color: rgba(0, 0, 0, 0.25);
  --b-input-number-border-radius: 6px;
  --b-input-number-disabled-bg: rgba(0, 0, 0, 0.04);
  --b-input-number-disabled-color: rgba(0, 0, 0, 0.25);
  --b-input-number-error-border-color: #ff4d4f;
  --b-input-number-error-hover-border-color: #ff7875;
  --b-input-number-warning-border-color: #faad14;
  --b-input-number-warning-hover-border-color: #ffc53d;
  --b-input-number-filled-bg: rgba(0, 0, 0, 0.04);
  --b-input-number-filled-hover-bg: rgba(0, 0, 0, 0.04);

  display: inline-flex;
  align-items: stretch;
  width: var(--b-input-number-control-width);
  font-size: var(--b-input-number-font-size);
  color: var(--b-input-number-color);
  line-height: 1.5714;
}

.b-input-number--lg {
  font-size: var(--b-input-number-font-size-lg);
}

.b-input-number--sm {
  font-size: var(--b-input-number-font-size-sm);
}

.b-input-number__wrapper {
  display: inline-flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  position: relative;
  transition: all 0.2s;
}

/* Outlined */
.b-input-number--outlined .b-input-number__wrapper {
  background: var(--b-input-number-bg);
  border: 1px solid var(--b-input-number-border-color);
  border-radius: var(--b-input-number-border-radius);
}

.b-input-number--outlined:not(.b-input-number--disabled):hover .b-input-number__wrapper {
  border-color: var(--b-input-number-hover-border-color);
  background: var(--b-input-number-hover-bg);
}

.b-input-number--outlined.b-input-number--focused .b-input-number__wrapper {
  border-color: var(--b-input-number-active-border-color);
  background: var(--b-input-number-active-bg);
  box-shadow: var(--b-input-number-active-shadow);
}

/* Filled */
.b-input-number--filled .b-input-number__wrapper {
  background: var(--b-input-number-filled-bg);
  border: 1px solid transparent;
  border-radius: var(--b-input-number-border-radius);
}

.b-input-number--filled:not(.b-input-number--disabled):hover .b-input-number__wrapper {
  background: var(--b-input-number-filled-hover-bg);
}

.b-input-number--filled.b-input-number--focused .b-input-number__wrapper {
  background: var(--b-input-number-active-bg);
  border-color: var(--b-input-number-active-border-color);
  box-shadow: var(--b-input-number-active-shadow);
}

/* Borderless */
.b-input-number--borderless .b-input-number__wrapper {
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--b-input-number-border-radius);
}

/* Underlined */
.b-input-number--underlined .b-input-number__wrapper {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--b-input-number-border-color);
  border-radius: 0;
}

.b-input-number--underlined:not(.b-input-number--disabled):hover .b-input-number__wrapper {
  border-bottom-color: var(--b-input-number-hover-border-color);
}

.b-input-number--underlined.b-input-number--focused .b-input-number__wrapper {
  border-bottom-color: var(--b-input-number-active-border-color);
  box-shadow: 0 1px 0 0 var(--b-input-number-active-border-color);
}

/* Error */
.b-input-number--error.b-input-number--outlined .b-input-number__wrapper {
  border-color: var(--b-input-number-error-border-color);
}

.b-input-number--error.b-input-number--outlined:not(.b-input-number--disabled):hover
  .b-input-number__wrapper {
  border-color: var(--b-input-number-error-hover-border-color);
}

.b-input-number--error.b-input-number--outlined.b-input-number--focused .b-input-number__wrapper,
.b-input-number--error.b-input-number--filled.b-input-number--focused .b-input-number__wrapper {
  border-color: var(--b-input-number-error-border-color);
  box-shadow: var(--b-input-number-error-active-shadow);
}

.b-input-number--error.b-input-number--underlined .b-input-number__wrapper {
  border-bottom-color: var(--b-input-number-error-border-color);
}

.b-input-number--error.b-input-number--underlined.b-input-number--focused .b-input-number__wrapper {
  border-bottom-color: var(--b-input-number-error-border-color);
  box-shadow: 0 1px 0 0 var(--b-input-number-error-border-color);
}

/* Warning */
.b-input-number--warning.b-input-number--outlined .b-input-number__wrapper {
  border-color: var(--b-input-number-warning-border-color);
}

.b-input-number--warning.b-input-number--outlined:not(.b-input-number--disabled):hover
  .b-input-number__wrapper {
  border-color: var(--b-input-number-warning-hover-border-color);
}

.b-input-number--warning.b-input-number--outlined.b-input-number--focused .b-input-number__wrapper,
.b-input-number--warning.b-input-number--filled.b-input-number--focused .b-input-number__wrapper {
  border-color: var(--b-input-number-warning-border-color);
  box-shadow: var(--b-input-number-warning-active-shadow);
}

.b-input-number--warning.b-input-number--underlined .b-input-number__wrapper {
  border-bottom-color: var(--b-input-number-warning-border-color);
}

.b-input-number--warning.b-input-number--underlined.b-input-number--focused
  .b-input-number__wrapper {
  border-bottom-color: var(--b-input-number-warning-border-color);
  box-shadow: 0 1px 0 0 var(--b-input-number-warning-border-color);
}

/* Disabled */
.b-input-number--disabled .b-input-number__wrapper {
  background: var(--b-input-number-disabled-bg);
  cursor: not-allowed;
}

.b-input-number--disabled .b-input-number__input {
  color: var(--b-input-number-disabled-color);
  cursor: not-allowed;
}

/* Input element */
.b-input-number__input {
  flex: 1;
  min-width: 0;
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font-size: inherit;
  font-family: inherit;
  line-height: inherit;
  text-align: left;
}

.b-input-number--md .b-input-number__input {
  padding: var(--b-input-number-padding-block) var(--b-input-number-padding-inline);
}

.b-input-number--lg .b-input-number__input {
  padding: var(--b-input-number-padding-block-lg) var(--b-input-number-padding-inline-lg);
}

.b-input-number--sm .b-input-number__input {
  padding: var(--b-input-number-padding-block-sm) var(--b-input-number-padding-inline-sm);
}

.b-input-number--has-controls .b-input-number__input {
  padding-right: calc(var(--b-input-number-handle-width) + 2px);
}

.b-input-number__input::placeholder {
  color: var(--b-input-number-placeholder-color);
}

/* Prefix & Suffix */
.b-input-number__prefix,
.b-input-number__suffix {
  display: inline-flex;
  align-items: center;
  color: var(--b-input-number-color);
  flex-shrink: 0;
}

.b-input-number__prefix {
  margin-left: var(--b-input-number-padding-inline);
}

.b-input-number__suffix {
  margin-right: var(--b-input-number-padding-inline);
}

.b-input-number__prefix ~ .b-input-number__input {
  padding-left: 4px;
}

/* Handler (step buttons) */
.b-input-number__handler-wrap {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: var(--b-input-number-handle-width);
  border-left: 1px solid var(--b-input-number-handle-border-color);
  border-radius: 0 var(--b-input-number-border-radius) var(--b-input-number-border-radius) 0;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.2s;
}

.b-input-number:hover .b-input-number__handler-wrap,
.b-input-number--focused .b-input-number__handler-wrap {
  opacity: 1;
}

.b-input-number__handler {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  cursor: pointer;
  background: var(--b-input-number-handle-bg);
  font-size: var(--b-input-number-handle-font-size);
  color: rgba(0, 0, 0, 0.45);
  user-select: none;
  transition:
    color 0.2s,
    background 0.2s;
}

.b-input-number__handler:hover {
  color: var(--b-input-number-handle-hover-color);
  background: var(--b-input-number-handle-active-bg);
}

.b-input-number__handler--up {
  border-bottom: 1px solid var(--b-input-number-handle-border-color);
}

.b-input-number__handler--disabled {
  cursor: not-allowed;
  opacity: 0.4;
  pointer-events: none;
}

.b-input-number__handler svg {
  width: 0.5em;
  height: 0.5em;
}

/* Filled variant handler */
.b-input-number--filled .b-input-number__handler {
  background: var(--b-input-number-filled-handle-bg);
}

/* Borderless / underlined: hide handler border */
.b-input-number--borderless .b-input-number__handler-wrap,
.b-input-number--underlined .b-input-number__handler-wrap {
  border-left-color: transparent;
}

/* Dark mode */
[data-prefers-color='dark'] .b-input-number {
  --b-input-number-active-bg: #141414;
  --b-input-number-active-border-color: #1668dc;
  --b-input-number-active-shadow: 0 0 0 2px rgba(22, 104, 220, 0.15);
  --b-input-number-addon-bg: rgba(255, 255, 255, 0.04);
  --b-input-number-error-active-shadow: 0 0 0 2px rgba(220, 56, 56, 0.1);
  --b-input-number-filled-handle-bg: rgba(255, 255, 255, 0.12);
  --b-input-number-handle-active-bg: rgba(255, 255, 255, 0.04);
  --b-input-number-handle-bg: #1f1f1f;
  --b-input-number-handle-border-color: #424242;
  --b-input-number-handle-hover-color: #3c89e8;
  --b-input-number-hover-bg: #141414;
  --b-input-number-hover-border-color: #3c89e8;
  --b-input-number-warning-active-shadow: 0 0 0 2px rgba(209, 163, 0, 0.1);
  --b-input-number-border-color: #424242;
  --b-input-number-bg: #141414;
  --b-input-number-color: rgba(255, 255, 255, 0.88);
  --b-input-number-placeholder-color: rgba(255, 255, 255, 0.25);
  --b-input-number-disabled-bg: rgba(255, 255, 255, 0.08);
  --b-input-number-disabled-color: rgba(255, 255, 255, 0.25);
  --b-input-number-error-border-color: #dc3838;
  --b-input-number-error-hover-border-color: #e86e6e;
  --b-input-number-warning-border-color: #d1a300;
  --b-input-number-warning-hover-border-color: #e8c631;
  --b-input-number-filled-bg: rgba(255, 255, 255, 0.08);
  --b-input-number-filled-hover-bg: rgba(255, 255, 255, 0.12);
}

@media (prefers-reduced-motion: reduce) {
  .b-input-number__wrapper,
  .b-input-number__handler-wrap,
  .b-input-number__handler {
    transition: none;
  }
}
</style>
